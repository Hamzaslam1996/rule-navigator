import type { Lang } from "@/i18n";
import { isMonthPrecision, normDate } from "./resolve";

const locale = (lang: Lang) => (lang === "es" ? "es-US" : "en-US");

/** Formats YYYY-MM-DD as a full date and YYYY-MM as "June 2025". */
export function formatDate(s: string | null | undefined, lang: Lang): string {
  const n = normDate(s);
  if (!n) return s ?? "";
  const d = new Date(`${n}T00:00:00Z`);
  if (isMonthPrecision(s)) return new Intl.DateTimeFormat(locale(lang), { timeZone: "UTC", year: "numeric", month: "long" }).format(d);
  return new Intl.DateTimeFormat(locale(lang), { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }).format(d);
}

export function formatTimestamp(s: string | null | undefined, lang: Lang): string {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat(locale(lang), { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" }).format(d);
}

export const fingerprint = (sha: string | null | undefined) => (sha ? sha.slice(0, 12) : "");

/** Hides internal team notes ("Decided by …" or "(Q<n>" question ids) from public display. */
export function hideInternalNote(text: string | null | undefined): string | null {
  if (!text) return null;
  const t = text.trim();
  if (!t) return null;
  if (/^decided by/i.test(t) || /\(Q\d/i.test(t)) return null;
  return text;
}
