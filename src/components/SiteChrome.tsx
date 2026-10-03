import { Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/i18n";

export function LegalBanner() {
  const { t } = useLang();
  return (
    <div role="note" className="bg-banner px-4 py-2 text-center text-sm text-banner-foreground">
      <Scale className="mr-2 inline h-4 w-4 align-[-2px]" aria-hidden />
      {t.banner}
    </div>
  );
}

export function SiteHeader() {
  const { t, lang, setLang } = useLang();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const navCls = "rounded px-2 py-1 text-sm text-muted-foreground hover:text-foreground";
  const active = { className: "text-foreground font-semibold underline decoration-terracotta decoration-2 underline-offset-8" };
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="street-sign" aria-label="Statute Street — home">
          Statute Street
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          <Link to="/" className={navCls} activeProps={active} activeOptions={{ exact: true }}>
            {t.nav.search}
          </Link>
          <Link to="/audit" className={navCls} activeProps={active}>
            {t.nav.audit}
          </Link>
          <Link to="/about" className={navCls} activeProps={active}>
            {t.nav.about}
          </Link>
          <div role="group" aria-label={t.langLabel} className="ml-2 inline-flex overflow-hidden rounded-md border border-input">
            {(["en", "es"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                disabled={!hydrated}
                onClick={() => setLang(l)}
                className={
                  lang === l
                    ? "bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground"
                    : "bg-card px-2.5 py-1 text-sm text-foreground hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
                }
              >
                {l === "en" ? "English" : "Español"}
              </button>
            ))}
          </div>
        </nav>
      </div>
      {t.ruleTextNote && (
        <p className="mx-auto max-w-6xl px-4 pb-3 text-xs text-muted-foreground" lang="es">
          {t.ruleTextNote}
        </p>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t border-border">
      <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">{t.footer}</p>
    </footer>
  );
}
