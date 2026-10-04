import { createContext, useContext, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useSearch } from "@tanstack/react-router";
import { BellRing, BookOpen, Building2, CalendarDays, ClipboardCheck, FileSearch, ListChecks, MapPin, Menu, X } from "lucide-react";
import { getAddresses, getRules, lookupsAsOf } from "@/data";
import { useLang } from "@/i18n";
import { Button } from "./ui/button";
import { LanguageToggle } from "./PublicChrome";
import { RequestAccessModal } from "./RequestAccessModal";
import { formatDate } from "@/lib/format";
import { appMeta } from "@/lib/meta";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const AsOfContext = createContext({ date: lookupsAsOf, setDate: (_date: string) => {} });
export const useAsOf = () => useContext(AsOfContext);

const nav = [
  { to: "/app", key: "portfolio", icon: Building2, exact: true },
  { to: "/app/search", key: "search", icon: MapPin },
  { to: "/app/check", key: "action", icon: ClipboardCheck },
  { to: "/app/changes", key: "changes", icon: BellRing },
  { to: "/app/review", key: "review", icon: ListChecks },
  { to: "/app/evidence", key: "evidence", icon: FileSearch },
  { to: "/app/method", key: "method", icon: BookOpen },
] as const;

export function WorkspaceShell() {
  const { t, lang } = useLang();
  const search = useSearch({ strict: false }) as { asof?: string };
  const navigate = useNavigate();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(search.asof ?? "") ? String(search.asof) : lookupsAsOf;
  const setDate = (asof: string) => void navigate({ to: ".", search: (previous) => ({ ...previous, asof }), replace: true });
  const [menu, setMenu] = useState(false);
  const [access, setAccess] = useState(false);
  const value = useMemo(() => ({ date, setDate }), [date]);
  const labels = t.v2.shell.nav;
  const rulesInForce = appMeta?.rules_in_force ?? getRules().filter((rule) => rule.status === "in_force" && !rule.negative_finding).length;
  const negatives = appMeta?.negative_findings ?? getRules().filter((rule) => rule.negative_finding).length;
  const addresses = appMeta?.addresses ?? getAddresses().length;
  return <AsOfContext.Provider value={value}>
    <div className="min-h-[calc(100vh-40px)] md:grid md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-card md:flex md:flex-col">
        <Link to="/" className="border-b border-border px-5 py-5 text-sm font-bold uppercase tracking-widest">Statute Street</Link>
        <nav className="flex-1 py-3" aria-label="Workspace">{nav.map(({ to, key, icon: Icon, exact }) => <Link key={to} to={to} search={{ asof: date }} activeOptions={{ exact }} className="flex items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "border-r-2 border-primary bg-secondary font-semibold text-foreground" }}><Icon className="h-4 w-4" />{labels[key]}</Link>)}</nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-2"><Button className="md:hidden" variant="ghost" size="icon" onClick={() => setMenu(!menu)} aria-label={t.v2.shell.menu}>{menu ? <X /> : <Menu />}</Button><span className="text-sm font-semibold">{t.v2.shell.workspace(getAddresses().length)}</span></div>
            <div className="flex flex-wrap items-center gap-2">
              <Popover><PopoverTrigger asChild><Button variant="outline" size="sm"><CalendarDays className="h-4 w-4" />{formatDate(date, lang)}</Button></PopoverTrigger><PopoverContent align="end" className="w-auto p-0"><Calendar mode="single" selected={new Date(`${date}T00:00:00Z`)} onSelect={(selected) => selected && setDate(selected.toISOString().slice(0, 10))} /></PopoverContent></Popover>
              {["2026-10-01", "2026-01-01", "2027-07-02"].map((quick) => <Button key={quick} size="sm" variant={date === quick ? "default" : "outline"} className="hidden lg:inline-flex" onClick={() => setDate(quick)}>{formatDate(quick, lang)}</Button>)}
              <LanguageToggle /><Button className="hidden sm:inline-flex" onClick={() => setAccess(true)}>{t.v2.requestAccess}</Button>
            </div>
          </div>
          {menu && <nav className="grid grid-cols-2 border-t border-border p-2 md:hidden">{nav.map(({ to, key, exact }) => <Link key={to} to={to} search={{ asof: date }} activeOptions={{ exact }} activeProps={{ className: "bg-secondary font-semibold" }} onClick={() => setMenu(false)} className="px-3 py-2 text-sm">{labels[key]}</Link>)}</nav>}
        </header>
        <Outlet />
        <footer className="border-t border-border px-4 py-5 font-mono text-xs text-muted-foreground lg:px-6">{appMeta?.rules_version && appMeta.engine_commit ? t.v2.shell.version(appMeta.rules_version, appMeta.engine_commit, rulesInForce, negatives, addresses, date) : t.v2.shell.versionFallback}</footer>
      </div>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background md:hidden">{nav.slice(0, 5).map(({ to, key, icon: Icon, exact }) => <Link key={to} to={to} search={{ asof: date }} activeOptions={{ exact }} activeProps={{ className: "bg-secondary font-semibold" }} className="flex flex-col items-center gap-1 px-1 py-2 text-[10px]"><Icon className="h-4 w-4" />{labels[key]}</Link>)}</nav>
    <RequestAccessModal open={access} onClose={() => setAccess(false)} />
  </AsOfContext.Provider>;
}