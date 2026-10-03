import { createFileRoute, Link } from "@tanstack/react-router";
import { getAddresses } from "@/data";
import { AddressCombobox } from "@/components/AddressCombobox";
import { useT } from "@/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Statute Street — Which housing rules apply to this apartment?" },
      { name: "description", content: "Look up a rental address in CA, NJ or MA and see the housing rules in force on any date, each with a quoted source." },
      { property: "og:title", content: "Statute Street — Which housing rules apply to this apartment?" },
      { property: "og:description", content: "Rental housing rules by address and date, each with a quoted source." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const t = useT();
  const addresses = getAddresses();
  const states = [...new Set(addresses.map((a) => a.state))];
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <p className="eyebrow">{t.home.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{t.home.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t.home.lead}</p>
      <div className="mt-10">
        <AddressCombobox addresses={addresses} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{t.home.scope}</p>

      <section className="hairline mt-14 pt-8" aria-labelledby="browse-h">
        <h2 id="browse-h" className="text-xl font-semibold">
          {t.home.browse}
        </h2>
        {addresses.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{t.home.noData}</p>}
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {states.map((s) => (
            <div key={s}>
              <h3 className="eyebrow">{s}</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {addresses
                  .filter((a) => a.state === s)
                  .map((a) => (
                    <li key={a.address_id}>
                      <Link to="/address/$id" params={{ id: a.address_id }} className="hover:text-primary hover:underline">
                        {a.street_address}
                        <span className="text-muted-foreground"> · {a.postal_city}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
