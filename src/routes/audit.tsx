import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, ExternalLink } from "lucide-react";
import { getDataIssues, getRules, getRulesCitingSource, getSources, lookupsAsOf } from "@/data";
import { fingerprint, formatDate, formatTimestamp } from "@/lib/format";
import { useLang } from "@/i18n";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log, Statute Street" },
      { name: "description", content: "Every source document behind Statute Street's rules, with retrieval dates and SHA-256 fingerprints." },
      { property: "og:title", content: "Audit log, Statute Street" },
      { property: "og:description", content: "Source documents, retrieval dates and fingerprints behind every rule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

function CopyButton({ value }: { value: string }) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={t.audit.copy}
      title={t.audit.copy}
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      <span className="sr-only" aria-live="polite">{done ? t.audit.copied : ""}</span>
    </button>
  );
}

function AuditPage() {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const sources = getSources();
  const issues = getDataIssues();
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return sources;
    return sources.filter((s) => [s.source_id, s.title, s.citation, s.jurisdiction, s.url].some((v) => v?.toLowerCase().includes(n)));
  }, [q, sources]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-semibold">{t.audit.title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t.audit.lead}</p>
      <p className="mt-2 text-sm">
        {t.audit.datasetDate(formatDate(lookupsAsOf, lang))} · {t.audit.rulesLoaded(getRules().length)}
      </p>

      <label className="mt-6 block max-w-md">
        <span className="text-sm font-semibold">{t.audit.search}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.audit.searchPlaceholder}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2"
        />
      </label>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t.audit.cols.id}</th>
              <th className="px-3 py-2">{t.audit.cols.jurisdiction}</th>
              <th className="px-3 py-2">{t.audit.cols.title}</th>
              <th className="px-3 py-2">{t.audit.cols.retrieved}</th>
              <th className="px-3 py-2">{t.audit.cols.sha}</th>
              <th className="px-3 py-2">{t.audit.cols.rules}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const rules = getRulesCitingSource(s);
              return (
                <tr key={s.source_id} className="border-b border-border align-top last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{s.source_id}</td>
                  <td className="px-3 py-2">{s.jurisdiction}</td>
                  <td className="px-3 py-2" lang="en">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
                        {s.title}
                        <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden />
                        <span className="sr-only">{t.address.newTab}</span>
                      </a>
                    ) : (
                      s.title
                    )}
                    <div className="text-xs text-muted-foreground">{s.citation}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {s.retrieved_at ? formatTimestamp(s.retrieved_at, lang) : <span className="italic text-muted-foreground">{t.address.retrievalMissing}</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {s.sha256 && (
                      <span className="inline-flex items-center gap-1">
                        <code className="font-mono text-xs">{fingerprint(s.sha256)}…</code>
                        <CopyButton value={s.sha256} />
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{rules.map((r) => r.team_rule_id).join(", ") || "none"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sources.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t.audit.empty}</p>}
        {sources.length > 0 && filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t.audit.noMatch}</p>}
      </div>

      <section className="mt-10" aria-labelledby="issues-h">
        <h2 id="issues-h" className="text-2xl font-semibold">
          {t.audit.issuesTitle}
        </h2>
        {issues.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t.audit.issuesNone}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">{t.audit.issuesLead}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {issues.map((i, k) => (
                <li key={k} className="rounded-md border border-status-review/30 bg-status-review-tint p-3">
                  <span className="font-mono text-xs font-semibold">
                    {i.file} · {i.record}
                  </span>
                  <p>{i.message}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
