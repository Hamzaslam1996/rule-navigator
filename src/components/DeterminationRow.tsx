import { ExternalLink } from "lucide-react";
import type { Address } from "@/data";
import { getRule, getSourceByUrl, getSources } from "@/data";
import sourcesRaw from "@/data/sources.json";
import type { ResolvedItem } from "@/lib/resolve";
import { missingFacts } from "@/lib/resolve";
import { fingerprint, formatTimestamp, hideInternalNote } from "@/lib/format";
import { useLang } from "@/i18n";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/button";

const shortValue = (value: string | null | undefined) => value && value.length > 70 ? `${value.slice(0, 67)}...` : value;

export function DeterminationRow({ item, address, changed = false }: { item: ResolvedItem; address: Address; changed?: boolean }) {
  const { t, lang } = useLang();
  const rule = item.rule;
  const source = getSourceByUrl(rule.source_url) ?? getSources().find((entry) => entry.source_id === rule.source_doc_id);
  const explanation = hideInternalNote(item.explanation);
  const review = hideInternalNote(rule.conflict_note) ?? (item.review ? t.address.reviewHidden : null);
  const appliesUnless = item.badge === "applies" && Boolean(explanation?.toLowerCase().startsWith("applies unless"));
  const keyValue = rule.key_value_short || shortValue(rule.key_value);
  const governedRule = getRule(item.governedBy);
  const sourceRecord = sourcesRaw.sources.find((entry) => entry.source_id === source?.source_id);
  const basisKey = sourceRecord?.evidence_basis;
  const basis = basisKey === "supplied_corpus" ? t.v2.determination.supplied : basisKey === "link_only_capture" ? t.v2.determination.official : t.v2.determination.primary;
  const openGoverned = () => {
    if (!governedRule) return;
    const target = document.getElementById(`rule-${governedRule.team_rule_id}`);
    if (target instanceof HTMLDetailsElement) target.open = true;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  if (item.badge === "none") return <div id={`rule-${rule.team_rule_id}`} className="border-b border-border px-3 py-3 text-sm text-muted-foreground"><span lang="en">{rule.title}</span><span className="ml-2">{t.badges.none}</span></div>;
  return <details id={`rule-${rule.team_rule_id}`} className={`group border-b border-border ${changed ? "status-pulse" : ""}`}>
    <summary className="grid cursor-pointer list-none gap-3 px-3 py-3 hover:bg-secondary sm:grid-cols-[10rem_minmax(0,1fr)_minmax(12rem,18rem)] sm:items-start">
      <div className="flex flex-wrap gap-1"><StatusBadge kind={item.badge} outline={appliesUnless} />{item.review && <StatusBadge kind="review" className="px-1.5 text-xs" />}{changed && <span className="text-xs font-semibold text-primary">{t.v2.determination.changed}</span>}</div>
      <div><h3 className="font-semibold" lang="en">{rule.title}</h3>{explanation && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground" lang="en">{explanation}</p>}{item.badge === "unknown" && <div className="mt-1 flex flex-wrap gap-1">{missingFacts(address).map((fact) => <span key={fact} className="border border-status-unknown/40 px-1.5 text-xs">{t.address.missing[fact]}</span>)}</div>}{governedRule && <Button type="button" variant="link" className="h-auto p-0 text-left text-xs" onClick={(event) => { event.preventDefault(); openGoverned(); }}>{t.v2.determination.governedBy(governedRule.title)}</Button>}</div>
      <div className="text-left">{keyValue && <p className="line-clamp-2 font-mono text-sm font-semibold" title={rule.key_value ?? undefined} lang="en">{keyValue}</p>}<p className="mt-1 font-mono text-xs text-muted-foreground">{t.v2.determination.level(t.address.level[rule.level], rule.jurisdiction)}</p></div>
    </summary>
    <div className="grid gap-5 bg-card px-3 pb-5 pt-2 text-sm md:grid-cols-2">
      <div>{rule.key_value && <><p className="eyebrow">{t.address.keyValue}</p><p className="mt-2 font-mono" lang="en">{rule.key_value}</p></>}<p className="eyebrow mt-5">{t.v2.determination.requirement}</p><p className="mt-2" lang="en">{rule.requirement}</p>{item.review && review && <p className="mt-3 border-l-2 border-status-review pl-3" lang="en">{review}</p>}</div>
      <div><p className="eyebrow">{t.address.evidence}</p>{rule.quoted_span ? <blockquote className="quote-block mt-2" lang="en">“{rule.quoted_span}”</blockquote> : <p className="mt-2 text-muted-foreground">{t.address.quoteMissing}</p>}<p className="mt-2 font-mono text-xs" lang="en">{rule.citation}</p>{rule.source_url && <a className="mt-2 inline-flex items-center gap-1 text-primary underline" href={rule.source_url} target="_blank" rel="noreferrer">{t.address.openSource}<ExternalLink className="h-3 w-3" /></a>}<div className="mt-2 font-mono text-xs text-muted-foreground">{source?.retrieved_at ? t.address.retrieved(formatTimestamp(source.retrieved_at, lang)) : t.address.retrievalMissing}{source?.sha256 ? ` · ${fingerprint(source.sha256)}` : ""}</div><div className="mt-2 flex flex-wrap gap-2 text-xs"><span>{t.v2.determination.quoteVerified}</span><span>{t.v2.determination.basis}: {basis}</span><span>{t.v2.determination.confidence(rule.confidence)}</span></div></div>
    </div>
  </details>;
}