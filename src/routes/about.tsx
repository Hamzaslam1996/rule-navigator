import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & method — Statute Street" },
      { name: "description", content: "How Statute Street produces results, what “Unknown” means, its limits, and how to report an error." },
      { property: "og:title", content: "About & method — Statute Street" },
      { property: "og:description", content: "How results are produced, what Unknown means, and the limits of the data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-semibold">{t.about.title}</h1>
      <p className="mt-4 font-serif text-xl text-muted-foreground">{t.about.lead}</p>
      {t.about.sections.map((s) => (
        <section key={s.h} className="hairline mt-8 pt-6">
          <h2 className="text-2xl font-semibold">{s.h}</h2>
          <p className="mt-2">{s.p}</p>
        </section>
      ))}
    </div>
  );
}
