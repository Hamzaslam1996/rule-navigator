import { createContext, useContext, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useSearch } from "@tanstack/react-router";
import { AddressBook, BellRing, BookOpen, Building2, ClipboardCheck, FileSearch, FileText, ListChecks, Menu, X } from "lucide-react";
import { getAddresses, getRules, lookupsAsOf } from "@/data";
import { useLang } from "@/i18n";
import { Button } from "./ui/button";
import { LanguageToggle } from "./PublicChrome";
import { RequestAccessModal } from "./RequestAccessModal";
import { formatDate } from "@/lib/format";
import { appMeta } from "@/lib/meta";

const AsOfContext = createContext({ date: lookupsAsOf, setDate: (_d: string) => {} });
export const useAsOf = () => useContext(AsOfContext);
const icons = [Building2, AddressBook, ClipboardCheck, BellRing, ListChecks, FileSearch, FileText, BookOpen];
const paths = ["/app", "/app/check", "/app/check", "/app/changes", "/app/review", "/app/evidence", "/app", "/app/method"] as const;
export function WorkspaceShell() {
  const { t, lang } = useLang();
  const search = useSearch({ strict: false }) as { asof?: string };
  const navigate = useNavigate();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(search.asof ?? "") ? String(search.asof) : lookupsAsOf;
  const setDate = (asof: string) => void navigate({ to: ".", search: (prev) => ({ ...prev, asof }), replace: true });
  const [menu, setMenu] = useState(false);
  const [access, setAccess] = useState(false);
  const labels = Object.values(t.v2.shell.nav);
  const value = useMemo(() => ({ date, setDate }), [date]);
  return <AsOfContext.Provider value={value}><div className="min-h-[calc(100vh-40px)] md:grid md:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="hidden border-r border-border bg-card md:flex md:flex-col"><Link to="/" className="border-b border-border px-5 py-5 text-sm font-bold uppercase tracking-widest">Statute Street</Link><nav className="flex-1 py-3" aria-label="Workspace">{paths.map((to, i) => { const Icon=icons[i]; return <Link key={`${to}-${i}`} to={to} className="flex items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "border-r-2 border-primary bg-secondary font-semibold text-foreground" }} activeOptions={i===0?{exact:true}:undefined}><Icon className="h-4 w-4"/>{labels[i]}</Link>; })}</nav></aside>
    <div className="min-w-0"><header className="sticky top-0 z-30 border-b border-border bg-background/95"><div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6"><div className="flex items-center gap-2"><Button className="md:hidden" variant="ghost" size="icon" onClick={() => setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</Button><span className="text-sm font-semibold">{t.v2.shell.workspace(getAddresses().length)}</span></div><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="global-date">{t.v2.shell.asOf}</label><input id="global-date" type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="h-8 border border-input bg-background px-2 font-mono text-xs"/>{["2026-10-01","2026-01-01","2027-07-02"].map(d=><Button key={d} size="sm" variant={date===d?"default":"outline"} className="hidden lg:inline-flex" onClick={()=>setDate(d)}>{formatDate(d,lang)}</Button>)}<LanguageToggle/><Button className="hidden sm:inline-flex" onClick={()=>setAccess(true)}>{t.v2.requestAccess}</Button></div></div>{menu&&<nav className="grid grid-cols-2 border-t border-border p-2 md:hidden">{paths.map((to,i)=><Link key={`${to}-${i}`} to={to} onClick={()=>setMenu(false)} className="px-3 py-2 text-sm">{labels[i]}</Link>)}</nav>}</header>
      <Outlet/><footer className="border-t border-border px-4 py-5 font-mono text-xs text-muted-foreground lg:px-6">{appMeta?.rules_version&&appMeta.engine_commit?t.v2.shell.version(appMeta.rules_version,appMeta.engine_commit,getRules().length,getAddresses().length,formatDate(date,lang)):t.v2.shell.versionFallback}</footer>
    </div></div><nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background md:hidden">{paths.slice(0,5).map((to,i)=>{const Icon=icons[i];return <Link key={`${to}-${i}`} to={to} className="flex flex-col items-center gap-1 px-1 py-2 text-[10px]"><Icon className="h-4 w-4"/>{labels[i]}</Link>})}</nav><RequestAccessModal open={access} onClose={()=>setAccess(false)}/></AsOfContext.Provider>;
}
