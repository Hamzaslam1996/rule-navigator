import { useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import type { Address } from "@/data";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function AddressCombobox({ addresses, target = "legacy", onSelect, selectedId }: { addresses: Address[]; target?: "legacy" | "workspace" | "select"; onSelect?: (address: Address) => void; selectedId?: string }) {
  const t = useT();
  const navigate = useNavigate();
  const id = useId();
  const listId = `${id}-list`;
  const selected = addresses.find((address) => address.address_id === selectedId);
  const [q, setQ] = useState(selected ? `${selected.street_address}, ${selected.postal_city}` : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const n = norm(q);
    if (!n) return addresses;
    const parts = n.split(" ");
    return addresses.filter((a) => {
      const hay = norm(`${a.address_id} ${a.street_address} ${a.postal_city} ${a.legal_city} ${a.state} ${a.zip}`);
      return parts.every((p) => hay.includes(p));
    });
  }, [q, addresses]);

  const noMatch = q.trim().length > 0 && matches.length === 0;
  const go = (a: Address) => {
    setQ(`${a.street_address}, ${a.postal_city}`);
    setOpen(false);
    if (target === "select") return onSelect?.(a);
    return target === "workspace"
      ? navigate({ to: "/app/address/$id", params: { id: a.address_id }, search: { asof: "2026-10-01" } })
      : navigate({ to: "/address/$id", params: { id: a.address_id } });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[active]) {
        e.preventDefault();
        go(matches[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && matches.length > 0;

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {t.home.label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && matches[active] ? `${id}-opt-${matches[active].address_id}` : undefined}
          aria-describedby={`${id}-hint`}
          placeholder={t.home.placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          disabled={addresses.length === 0}
          className="w-full rounded-md border border-input bg-card py-3.5 pl-11 pr-4 text-lg shadow-sm placeholder:text-muted-foreground"
        />
      </div>
      <p id={`${id}-hint`} className="mt-2 text-xs text-muted-foreground">
        {t.home.hint}
      </p>
      <div role="status" aria-live="polite" className="sr-only">
        {q.trim() ? (noMatch ? t.home.notFound : t.home.results(matches.length)) : ""}
      </div>
      {addresses.length === 0 && (
        <p className="mt-3 rounded-md border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">{t.home.noData}</p>
      )}
      {noMatch && (
        <p className="mt-3 rounded-md border border-status-unknown/40 bg-status-unknown-tint px-4 py-3 text-sm text-status-unknown">
          {t.home.notFound}
        </p>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label={t.home.label}
        hidden={!showList}
        className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-lg"
      >
        {matches.map((a, i) => (
          <li
            key={a.address_id}
            id={`${id}-opt-${a.address_id}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(a)}
            className={cn("flex cursor-pointer items-start gap-3 px-4 py-2.5", i === active && "bg-secondary")}
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden />
            <span>
              <span className="block font-medium">{a.street_address}</span>
              <span className="block text-sm text-muted-foreground">
                {a.postal_city}, {a.state} {a.zip}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
