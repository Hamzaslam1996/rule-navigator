import type { AddressResult } from "@/lib/resolve";
import { lookupsAsOf } from "@/data";
import { formatDate, hideInternalNote } from "@/lib/format";
import { useLang } from "@/i18n";
import { StatusBadge } from "./StatusBadge";

export function ChangesPanel({ result }: { result: AddressResult }) {
  const { t, lang } = useLang();
  const { upcoming, nowInEffect, failed, changeNotes } = result;
  const empty = upcoming.length === 0 && nowInEffect.length === 0 && failed.length === 0 && changeNotes.length === 0;

  return (
    <aside aria-labelledby="changes-h" className="rounded-lg border border-border bg-card p-5">
      <h2 id="changes-h" className="text-xl font-semibold">
        {t.changes.title}
      </h2>
      {empty && <p className="mt-2 text-sm text-muted-foreground">{t.changes.empty}</p>}

      {upcoming.length > 0 && (
        <section className="mt-4">
          <h3 className="eyebrow">{t.changes.upcoming}</h3>
          <ul className="mt-2 space-y-3">
            {upcoming.map((r) => (
              <li key={r.team_rule_id} className="hairline pt-3 first:border-t-0 first:pt-0">
                <StatusBadge kind={r.status === "pending" ? "pending" : "not_yet_effective"} />
                <p className="mt-1.5 text-sm font-medium" lang="en">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.effective_date ? t.changes.effective(formatDate(r.effective_date, lang)) : ""}
                  {r.conflict_flag && " · " + t.badges.review}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nowInEffect.length > 0 && (
        <section className="mt-5">
          <h3 className="eyebrow">{t.changes.nowInEffect(formatDate(lookupsAsOf, lang))}</h3>
          <ul className="mt-2 space-y-3">
            {nowInEffect.map((r) => (
              <li key={r.team_rule_id}>
                <StatusBadge kind="applies" />
                <p className="mt-1.5 text-sm font-medium" lang="en">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t.changes.effective(formatDate(r.effective_date, lang))}
                  {r.conflict_flag && " · " + t.badges.review}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {changeNotes.length > 0 && (
        <section className="mt-5">
          <h3 className="eyebrow">{t.changes.notes}</h3>
          <ul className="mt-2 space-y-3">
            {changeNotes.map((c) => (
              <li key={c.test_id} className="rounded-md bg-secondary p-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold">{c.test_id}</span>
                  {c.review && <StatusBadge kind="review" className="text-xs" />}
                </div>
                {hideInternalNote(c.notes) ? <p lang="en">{hideInternalNote(c.notes)}</p> : c.review ? <p>{t.address.reviewHidden}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {failed.length > 0 && (
        <section className="mt-5">
          <h3 className="eyebrow">{t.changes.didNot}</h3>
          <ul className="mt-2 space-y-3">
            {failed.map((r) => (
              <li key={r.team_rule_id} className="text-sm">
                <StatusBadge kind="failed" />
                <p className="mt-1.5 font-medium" lang="en">{r.title}</p>
                <p className="text-muted-foreground" lang="en">{r.requirement}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
