import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { en, type Dict } from "./en";
import { es } from "./es";

export type Lang = "en" | "es";
const dicts: Record<Lang, Dict> = { en, es };

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: en });

/** Language choice is kept in memory only. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const value = useMemo(() => ({ lang, setLang, t: dicts[lang] }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useT = () => useContext(LangContext).t;
