import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, data, getAddress, lookupsAsOf } from "@/data";
import { BADGE_ORDER, resolveAddress } from "@/lib/resolve";
import { useLang } from "@/i18n";
import { AsOfControl } from "@/components/AsOfControl";
import { RuleCard } from "@/components/RuleCard";
import { ChangesPanel } from "@/components/ChangesPanel";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/address/$id")({
  loader: ({ params }) => {
    const address = getAddress(params.id);
    if (!address) throw notFound();
    return { address };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Address not found, Statute Street" }, { name: "robots", content: "noindex" }] };
    const a = loaderData.address;
    const title = `${a.street_address}, ${a.postal_city} ${a.state}, Statute Street`;
    const desc = `Housing rules that apply to ${a.street_address}, ${a.postal_city}, ${a.state}, with quoted sources and dates.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: AddressNotFound,
  component: AddressPage,
});

function AddressNotFound() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">{t.address.notFoundTitle}</h1>
      <p className="mt-3 text-muted-foreground">{t.address.notFoundBody}</p>
      <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        {t.address.back}
      </Link>
    </div>
  );
}

function AddressPage() {
  const { address } = Route.useLoaderData();
  const { t } = useLang();
  const [date, setDate] = useState(lookupsAsOf);
  const result = useMemo(() => resolveAddress(address, date, data), [address, date]);
  const { stack } = result;

  const fact = (v: string) => (v.trim() ? v : <span className="italic text-muted-foreground">{t.address.notInRecords}</span>);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t.address.back}
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-semibold md:text-4xl">{address.street_address}</h1>
        <p className="mt-1 text-muted-foreground">
          {address.postal_city}, {address.state} {address.zip}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label={t.address.stack}>
          <span className="rounded-md bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground">
            {t.address.state}: {stack.state}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="rounded-md border border-primary px-2.5 py-1 text-sm font-semibold text-primary">
            {t.address.city}: {stack.city ?? "not resolved"}
          </span>
          {stack.inferred && (
            <span className="rounded-full border border-status-unknown/40 bg-status-unknown-tint px-2.5 py-0.5 text-xs text-status-unknown">
              {t.address.cityInferred}
            </span>
          )}
        </div>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="font-semibold">{t.address.yearBuilt}:</dt>
            <dd>{fact(address.year_built)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">{t.address.units}:</dt>
            <dd>{fact(address.units)}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-8">
        <AsOfControl date={date} onChange={setDate} ticks={result.tickDates} datasetDate={lookupsAsOf} />
      </div>

      <section aria-labelledby="summary-h" className="mt-6">
        <h2 id="summary-h" className="sr-only">
          {t.address.summary}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {[...BADGE_ORDER, "review" as const].map((b) => (
            <li key={b} className="flex items-center gap-1.5">
              <StatusBadge kind={b} />
              <span className="font-mono text-sm font-semibold">{result.counts[b]}</span>
            </li>
          ))}
        </ul>
      </section>

      {!result.hasLookups && (
        <p className="mt-6 rounded-md border border-status-unknown/40 bg-status-unknown-tint p-4 text-sm text-status-unknown">{t.address.noLookups}</p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          {CATEGORIES.map((c) => (
            <section key={c} aria-labelledby={`cat-${c}`}>
              <h3 id={`cat-${c}`} className="border-b border-border pb-2 text-2xl font-semibold">
                {t.categories[c]}
              </h3>
              {result.byCategory[c].length === 0 ? (
                <p className="mt-3 text-sm italic text-muted-foreground">{t.address.emptyCategory}</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {result.byCategory[c].map((it) => (
                    <RuleCard key={it.rule.team_rule_id} item={it} address={address} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
        <div className="md:sticky md:top-4 md:self-start">
          <ChangesPanel result={result} />
        </div>
      </div>
    </div>
  );
}
