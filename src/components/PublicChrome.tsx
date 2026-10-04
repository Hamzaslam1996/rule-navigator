import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { RequestAccessModal } from "./RequestAccessModal";
import { Button } from "./ui/button";
import { useLang, type Lang } from "@/i18n";

export function LanguageToggle() {
  const { lang, setLang, t } = useLang();
  return <div role="group" aria-label={t.langLabel} className="inline-flex border border-input">{(["en", "es"] as Lang[]).map((l) => <Button key={l} size="sm" variant={lang === l ? "default" : "ghost"} aria-pressed={lang === l} onClick={() => setLang(l)}>{l === "en" ? "EN" : "ES"}</Button>)}</div>;
}
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  return <><header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4"><Link to="/" className="text-lg font-bold uppercase tracking-widest">Statute Street</Link><div className="flex items-center gap-3"><LanguageToggle/><Button variant="outline" onClick={() => setOpen(true)}>{t.v2.requestAccess}</Button></div></div></header><RequestAccessModal open={open} onClose={() => setOpen(false)} /></>;
}
