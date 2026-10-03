import { ExternalLink } from "lucide-react";
import type { Address } from "@/data";
import { getSourceByUrl } from "@/data";
import { confidenceLabel, missingFacts, type ResolvedItem } from "@/lib/resolve";
import { fingerprint, formatDate, formatTimestamp } from "@/lib/format";
import { useLang } from "@/i18n";
import { StatusBadge } from "./StatusBadge";
import { ListenButton } from "./ListenButton";
import { cn } from "@/lib/utils";

export function RuleCard({ item, address }: { item: ResolvedItem; address: Address }) {
  const { t, lang } = useLang();
  const { rule, badge } = item;
  const isNone = badge === "none";
  const conf = confidenceLabel(rule.confidence);
  const source = getSourceByUrl(rule.source_url);
  const missing = badge === "unknown" ? missingFacts(address) : [];

  return (
    <article
      lang="en"
      className={cn("rounded-lg border bg-card p-5", isNone ? "border-dashed border-status-none/40 bg-status-none-tint/40" : "border-border")}
      aria-label={rule.title}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge kind={badge} />
        {item.review && <StatusBadge kind="review" />}
        <span className="ml-auto text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span lang={lang}>{t.address.level[rule.level]}</span> · {rule.jurisdiction} · {rule.team_rule_id}
        </span>
      </div>

      <h4 className="mt-3 text-lg font-semibold">{rule.title}</h4>
      <p className={cn("mt-2", isNone ? "font-serif text-lg" : "text-foreground")}>{rule.requirement}</p>

      {item.takesEffect && (
        <p className="mt-2 text-sm font-medium text-status-future" lang={lang}>
          {t.address.takesEffect(formatDate(item.takesEffect, lang))}
        </p>
      )}

      {rule.key_value && !isNone && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" lang={lang}>
            {t.address.keyValue}
          </p>
          <p className="font-serif text-2xl leading-snug text-foreground">{rule.key_value}</p>
        </div>
      )}

      {(item.explanation || missing.length > 0) && (
        <div className="mt-4">
          <p className="text-sm font-semibold" lang={lang}>
            {t.address.why}
          </p>
          {item.explanation && <p className="text-sm text-muted-foreground">{item.explanation}</p>}
          {missing.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2" lang={lang}>
              {missing.map((m) => (
                <li key={m} className="rounded-full border border-status-unknown/40 bg-status-unknown-tint px-2.5 py-0.5 text-xs text-status-unknown">
                  {t.address.missing[m]}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {item.review && item.reviewNote && (
        <div className="mt-4 rounded-md border border-status-review/30 bg-status-review-tint p-3 text-sm">
          <p className="font-semibold text-status-review" lang={lang}>
            {t.address.reviewNote}
          </p>
          <p className="text-foreground">{item.reviewNote}</p>
        </div>
      )}

      {!isNone && (rule.coverage_conditions || rule.exemptions) && (
        <details className="mt-4 rounded-md border border-border">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium" lang={lang}>
            {t.address.details}
          </summary>
          <dl className="space-y-3 px-3 pb-3 text-sm">
            <div>
              <dt className="font-semibold" lang={lang}>{t.address.coverage}</dt>
              <dd className="text-muted-foreground">{rule.coverage_conditions ?? <span lang={lang}>{t.address.noneListed}</span>}</dd>
            </div>
            <div>
              <dt className="font-semibold" lang={lang}>{t.address.exemptions}</dt>
              <dd className="text-muted-foreground">{rule.exemptions ?? <span lang={lang}>{t.address.noneListed}</span>}</dd>
            </div>
          </dl>
        </details>
      )}

      <section className="hairline mt-4 pt-4" aria-label={t.address.evidence}>
        <p className="eyebrow" lang={lang}>{t.address.evidence}</p>
        {rule.quoted_span ? (
          <blockquote className="quote-block mt-2">“{rule.quoted_span}”</blockquote>
        ) : (
          <p className="mt-2 text-sm italic text-muted-foreground" lang={lang}>{t.address.quoteMissing}</p>
        )}
        <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
          {rule.citation && (
            <>
              <dt className="font-semibold" lang={lang}>{t.address.citation}</dt>
              <dd>{rule.citation}</dd>
            </>
          )}
        </dl>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" lang={lang}>
          {rule.source_url && (
            <a href={rule.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4">
              {t.address.openSource}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">{t.address.newTab}</span>
            </a>
          )}
          <span className="text-muted-foreground">
            {source?.retrieved_at ? t.address.retrieved(formatTimestamp(source.retrieved_at, lang)) : t.address.retrievalMissing}
            {source?.sha256 && (
              <>
                {" · "}
                {t.address.fingerprint} <code className="font-mono text-xs">{fingerprint(source.sha256)}</code>
              </>
            )}
          </span>
          <span className={cn("font-medium", conf.level === "low" ? "text-status-review" : "text-muted-foreground")}>
            {t.address.confidence[conf.level](conf.value)}
          </span>
        </div>
        <ListenButton text={`${rule.title}. ${rule.requirement}`} />
      </section>
    </article>
  );
}
