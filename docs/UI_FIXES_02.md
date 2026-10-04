# UI fixes 02: where it fits (for Lovable)

Two copy changes. No data contract change. No company names or logos in the UI.

## 1. Method page: new paragraph "Where it fits"

The Method page takes its text from `src/i18n/en.ts` and `src/i18n/es.ts` (`v2.method.sections`), not from a data file, so add one section to each. Place it after the existing sections, before the repositories block.

English (`en.ts`):

```
{ h: "Where it fits", p: "Statute Street is the legal layer for a property operating system: dated, evidence-backed determinations for every address, so pricing, leasing and screening act within local, state and federal law.", lines: [
  "Pricing gate: before a rent recommendation is issued, the pricing engine queries the determination for that address and date; the operator keeps the final say.",
  "Property record: determinations are stored against the unit with their as-of date, citation and quoted text, and refreshed when the change register posts a new effective date.",
  "Lease administration: a reliance record is generated at each lease event and kept with the lease, so an audit shows what was known on the day."
] }
```

Spanish (`es.ts`):

```
{ h: "Dónde encaja", p: "Statute Street es la capa legal de un sistema operativo inmobiliario: determinaciones fechadas y respaldadas por evidencia para cada dirección, para que la fijación de precios, el arrendamiento y la evaluación de solicitantes actúen dentro de la ley local, estatal y federal.", lines: [
  "Puerta de precios: antes de emitir una recomendación de renta, el motor de precios consulta la determinación para esa dirección y fecha; el operador conserva la decisión final.",
  "Expediente del inmueble: las determinaciones se guardan junto a la unidad con su fecha de referencia, cita y texto citado, y se actualizan cuando el registro de cambios publica una nueva fecha de vigencia.",
  "Administración de contratos: en cada evento del contrato se genera un registro de confianza que se conserva con el contrato, de modo que una auditoría muestra lo que se sabía ese día."
] }
```

If the `sections` type has no `lines` field, render the three lines as a short list under the paragraph (add an optional `lines?: string[]` to the section type and map it to a `<ul>`).

## 2. Public door: early-access band label

In `src/routes/index.tsx` the band shows `t.v2.public.early` as the eyebrow and `t.v2.public.operators` as the heading. Change the heading line (`v2.public.operators`) to:

- `en.ts`: "Built to sit inside the systems operators already run: a compliance gate for pricing, a legal layer for the property record."
- `es.ts`: "Hecho para integrarse en los sistemas que los operadores ya usan: una puerta de cumplimiento para los precios, una capa legal para el expediente del inmueble."

Keep the eyebrow "Early access" / "Acceso anticipado" as it is. No dashes as punctuation in either language.
