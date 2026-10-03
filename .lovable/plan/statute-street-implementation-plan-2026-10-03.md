# Statute Street — Implementation Plan

Front end only. Bundled JSON, no backend, no external calls. Code starts after you send the data files.

## Pages (TanStack file routes)
- `/` (index.tsx) — headline, one-line explainer, address combobox. Unknown typed address shows: "We don't have this address yet. We show no result rather than guess."
- `/address/$id` — header (street, State > City chips, building facts), as-of control, summary strip, six category sections, "What's changing" side panel (stacks under content below 768px). Bad id shows a not-found card, no guessing.
- `/audit` — sources table, search box, dataset date, rules citing each source, copy button for sha256.
- `/about` — method, what "Unknown" means, limits, how to report an error.
- Each route gets its own head() title/description/og tags.

## Shared layout (__root.tsx)
- Persistent, non-dismissible legal banner (top).
- Header: street-sign wordmark, nav (Search, Audit, About), EN/ES toggle.
- Language held in a React context (memory only, no storage).

## Components
AddressCombobox (ARIA combobox, keyboard), JurisdictionStack, BuildingFacts, AsOfControl (native range input + date input, tick marks at effective dates, reset link), SummaryStrip, CategorySection, RuleCard, StatusBadge (icon + word + tint), EvidencePanel (terracotta blockquote, citation, link, retrieval date + fingerprint, confidence in words), MissingFactChips, NegativeFindingCard, ChangesPanel, SourcesTable, ListenButton (behind FEATURE_TTS=false, not rendered).

## Data module — src/data/index.ts (single swap point)
- Imports the five JSON files and validates each record with zod (only the contract fields).
- Malformed records are skipped and collected into `dataIssues[]`, with a console.warn. The audit page lists them.
- Exports typed getters: getAddresses, getAddress(id), getRules, getRule(id), getLookups(id), lookupsAsOf, getChanges, getSources, getSourceByUrl, getDataIssues.

## Result logic — src/lib/resolve.ts (pure)
- `resolveAddress(address, date, data)` returns the stack, rows grouped by category, negative findings, changes, and badge counts.
- Steps, in order:
  1. Start from lookup rows.
  2. Date adjustment by effective_date.
  3. Guardrails: negative_finding never Applies, pending → Pending bill, failed → history only. Every downgrade logs a console.warn.
  4. Stack: state from address.state; city from city-level rules in the rows. If none, fall back to postal_city with the "confirm" label.
  5. Negative findings filtered to the stack.
- Separate helpers: `badgeFor`, `confidenceLabel` (≥0.85 High, ≥0.6 Medium, else Low), `missingFacts(address)`, `changesFor(address, date)`.
- Vitest tests cover:
  - CA-ALG-01 flips on 2026-01-01
  - NJ-ALG-01 flips on 2027-07-01
  - negative/pending/failed guardrails
  - city inference fallback
  - malformed record skip

## i18n
- `src/i18n/en.ts` and `es.ts` hold typed dictionaries (es must match en's keys), read through a `useT()` hook.
- All UI text goes through the dictionaries. Rule content stays in English, with the note "El texto de las normas se muestra en inglés original" in Spanish mode.
- Dates are formatted with Intl for each language.

## TTS hook
- `src/lib/tts.ts` exports `speak(text, lang)` as a no-op.
- `src/lib/features.ts` holds `FEATURE_TTS = false`.

## Design system (src/styles.css)
- oklch tokens:
  - ink #17212B
  - paper #F7F5F0
  - terracotta accent #A8461F
  - sign-green primary #1F5E43
- Status tokens (applies, unknown, superseded, future, pending, none, review), each with a tint and foreground that pass AA.
- Fonts: Source Serif 4 for headings, IBM Plex Sans for body, loaded via `<link>` in root.
- Thin rule dividers, visible focus rings, mobile-first single column, two columns (content + side panel) at md and up.

## Risks / assumptions
- **Joining rules to sources:** source_url → sources.url needs an exact match. I'll normalize trailing slashes and protocol. If there's still no match: "Retrieval date not recorded".
- **Missing rules:** lookup rows may reference rules absent from rules.json. Those rows are skipped and logged as data issues.
- **City inference:** a city-level jurisdiction string ("San Francisco, CA") is parsed to its city name for the chip.
- **Rule referenced twice:** a rule in both the lookups and the negative findings is shown once, as the negative-finding card.
- **Slider ticks:** effective dates outside 2025-12-01..2027-12-31 are clamped or omitted from the tick marks.
- **Status of "unknown" results:** "unknown" is never changed by the date. Its explanation is always shown, plus missing-fact chips.
- **Blank strings:** blank address fields are treated as "not in records", never 0.
- **Changes panel:** a changes.json entry is shown only when the address is in affected_address_ids.
