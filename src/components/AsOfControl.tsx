import { useId } from "react";
import { CalendarDays, RotateCcw } from "lucide-react";
import { DATE_MAX, DATE_MIN } from "@/lib/resolve";
import { formatDate } from "@/lib/format";
import { useLang } from "@/i18n";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;
const base = Date.parse(`${DATE_MIN}T00:00:00Z`);
const toDays = (iso: string) => Math.round((Date.parse(`${iso}T00:00:00Z`) - base) / DAY);
const fromDays = (n: number) => new Date(base + n * DAY).toISOString().slice(0, 10);
const TOTAL = toDays(DATE_MAX);

export function AsOfControl({
  date,
  onChange,
  ticks,
  datasetDate,
}: {
  date: string;
  onChange: (d: string) => void;
  ticks: string[];
  datasetDate: string;
}) {
  const { t, lang } = useLang();
  const id = useId();
  const pct = (d: string) => `${(toDays(d) / TOTAL) * 100}%`;

  return (
    <section aria-labelledby={`${id}-h`} className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={`${id}-h`} className="text-lg font-semibold">
            {t.address.asOfTitle}
          </h2>
          <p className="font-serif text-2xl text-foreground">{formatDate(date, lang)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">{t.address.dateInput}</span>
            <input
              type="date"
              min={DATE_MIN}
              max={DATE_MAX}
              value={date}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d{4}-\d{2}-\d{2}$/.test(v) && v >= DATE_MIN && v <= DATE_MAX) onChange(v);
              }}
              className="rounded-md border border-input bg-background px-2 py-1.5"
            />
          </label>
          {date !== datasetDate && (
            <button type="button" onClick={() => onChange(datasetDate)} className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {t.address.reset}
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-4 px-[11px]">
        <div className="pointer-events-none absolute inset-x-[11px] top-[22px] h-3" aria-hidden>
          {ticks.map((d) => (
            <span key={d} className="absolute h-3 w-0.5 -translate-x-1/2 bg-terracotta" style={{ left: pct(d) }} />
          ))}
          <span className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 bg-foreground/40" style={{ left: pct(datasetDate) }} />
        </div>
        <input
          type="range"
          min={0}
          max={TOTAL}
          step={1}
          value={toDays(date)}
          onChange={(e) => onChange(fromDays(Number(e.target.value)))}
          aria-label={t.address.asOfTitle}
          aria-valuetext={formatDate(date, lang)}
          className="range-input relative -mx-[11px] w-[calc(100%+22px)]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{formatDate(DATE_MIN, lang)}</span>
          <span>{formatDate(DATE_MAX, lang)}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {t.address.asOfHelp} {t.address.datasetDate(formatDate(datasetDate, lang))}
      </p>

      {ticks.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.address.keyDates}</p>
          <ul className="flex flex-wrap gap-2">
            {ticks.map((d) => (
              <li key={d}>
                <button
                  type="button"
                  aria-label={t.address.jumpTo(formatDate(d, lang))}
                  aria-pressed={date === d}
                  onClick={() => onChange(d)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    date === d ? "border-terracotta bg-accent text-accent-foreground" : "border-border bg-background hover:border-terracotta",
                  )}
                >
                  {formatDate(d, lang)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
