import { createFileRoute, Link } from "@tanstack/react-router";
import { AddressCombobox } from "@/components/AddressCombobox";
import { useAsOf } from "@/components/WorkspaceShell";
import { getAddresses } from "@/data";
import { useLang } from "@/i18n";

export const Route = createFileRoute("/app/search")({
  head: () => ({ meta: [{ title: "Statute Street: Find address" }, { name: "description", content: "Find an address determination." }, { property: "og:title", content: "Statute Street: Find address" }, { property: "og:description", content: "Find an address determination." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: FindAddress,
});

function FindAddress() {
  const { t } = useLang();
  const { date } = useAsOf();
  const addresses = getAddresses();
  return <div className="mx-auto max-w-3xl p-4 pb-24 lg:p-6"><h1 className="text-4xl font-semibold">{t.v2.search.title}</h1><div className="mt-6"><AddressCombobox addresses={addresses} target="workspace" /></div><ul className="mt-6 space-y-2">{["A0016", "A0002", "A0010"].map((id, index) => addresses.some((address) => address.address_id === id) && <li key={id}><Link to="/app/address/$id" params={{ id }} search={{ asof: date }} className="text-primary underline"><b>{t.v2.public.try}:</b> {t.v2.public.examples[index]}</Link></li>)}</ul></div>;
}