# Statute Street: product and design brief, v2 (4 Oct 2026)

Owner: Hamza Aslam. This brief governs every UI change and replaces v1 in full.
Hard rules: read data only from src/data (via src/data/index.ts); never edit src/data/*.json or index.ts; never invent legal facts; no dashes as punctuation in UI text (use commas, colons, full stops); no emoji, illustrations, gradients or stock imagery; Spanish strings for all new interface text (rule quotes and citations stay in English).

## 1. What the product is
Statute Street is a compliance ledger for rental housing. It compiles primary law into verified rules, resolves every address to its legal jurisdiction, and issues a dated determination for each rule at each address, with the quoted source text behind it. It closes a loop that today lives in memos and spreadsheets: Check, Decide, Record, Watch.

Primary user: compliance and operations leads at property management companies running buildings across several cities and states. Secondary: leasing staff before an action, and tenants.

## 2. Design language: institutional
Reference points: a legal publisher and a financial terminal. Trust through restraint, typography, density and evidence.
- Fonts (keep existing tokens): Source Serif 4 for headings and quoted law; IBM Plex Sans for interface; IBM Plex Mono for citations, dates, ids, section numbers, counts and version stamps.
- Colour: ink on paper, existing green primary used sparingly (primary buttons, active nav). Hairline rules (1px), faint card borders only, no shadows, no gradients.
- Status chips: colour plus icon plus word, never colour alone, AA contrast.
  - Applies: solid green, check icon.
  - Applies unless: green outline, check icon (a lookup row whose explanation starts "Applies unless").
  - Unknown: amber outline, question icon; the row names the missing fact.
  - Superseded: grey, arrow icon; names the governing rule.
  - Not yet effective: blue outline, clock icon, with start date.
  - Pending: violet outline, document icon, "Bill, not law".
  - Needs review: small amber flag beside the chip when conflict_flag is true.
- Data screens are tables: 13 to 14px, mono numerals, sticky headers, hairline rows, hover state, small chips, compact padding. Cards and white space belong on the public door only.
- Motion: when the as-of date changes, chips that change state pulse once (300ms) and show "Changed" for 3 seconds. Nothing else animates.
- Every workspace screen shows the global as-of date and a footer version stamp: "Rules <meta.rules_version> · Engine <meta.engine_commit> · <n> rules · <n> addresses · As of <date>". Read src/data/meta.json when present; if absent show "Engine version: see README" and compute counts from the data.
- Writing: plain English, sentence case, numerals, no hype. Page titles "Statute Street: <screen>".

## 3. Structure: a public door and a workspace
Public door at `/`. Workspace under `/app`. Keep the existing routes working by redirecting `/address/$id` to `/app/address/$id`, `/audit` to `/app/evidence`, `/about` to `/app/method`.

Disclaimer banner above everything on every page: "Legal information, not legal advice. Check the source or ask a lawyer before acting."

## 4. Public door ( / )
Single page, left aligned, generous spacing, serif H1. Sections, in order:
1. Eyebrow "Rental housing compliance, address by address". H1 "Which housing rules apply to this apartment?" Lead: "Statute Street turns state and city law into dated, evidence-backed determinations for every address you manage." Two buttons: primary "Open demo workspace" (to /app), secondary "Request access".
2. Search field, placeholder "Street, city, ZIP or address ID", typeahead as now (address_id, street, postal city, legal city, ZIP), opening /app/address/$id. Caption "As of 1 Oct 2026". Under it three "Try" links: San Francisco, 3515 Fillmore St: "Local rent control overrides the state cap" (A0016); Hoboken, 1031 Clinton St: "Algorithm ban, and a new state law in July 2027" (A0002); Cambridge, 134 Oxford St: "Two bills pending, no rent cap" (A0010).
3. "The problem", three short columns: "Wrong actions: a rent increase above a local cap, a banned screening question, a fee where none is allowed." "Algorithm exposure: nine jurisdictions in our corpus now restrict rent-setting software, building by building." "No audit trail: nobody can show which rule applied at an address on a date, and from which text."
4. "The loop", four steps in a row with mono numbers: Check (which rules bind this address today), Decide (check an action before you take it), Record (keep a reliance record with the quoted law), Watch (see what changes and when).
5. Proof line in mono: "<n> addresses · <n> cities in 3 states · <n> rules quoted from the law · 5 of 5 change tests passed" (counts from data; the 5 of 5 may be a constant).
6. Early access band (ink background, paper text): "For property managers and operators", three benefits: "Portfolio check", "Change alerts", "Audit-ready evidence", button "Request access". Label "Early access".
7. Footer: disclaimer, Method, Evidence register, "Prototype built for Hack-Nation 2026, RealPage challenge. Data as of 1 Oct 2026."
No address list and no other content.

## 5. Workspace shell ( /app )
Left sidebar (collapsible to icons on mobile, bottom nav under 768px): Portfolio, Address check, Action check, Change register, Review queue, Evidence register, Tenant notice, Method. Top bar: workspace label "Demo portfolio: <n> addresses", global as-of date control (date input plus quick chips "1 Oct 2026", "1 Jan 2026", "2 Jul 2027"), EN/ES toggle, "Request access" button. The as-of date is global state shared by every workspace screen and reflected in the URL (?asof=YYYY-MM-DD).

Date logic (keep the existing behaviour): results are computed for the dataset date; moving the date only changes status by effective date (not_yet_effective becomes applies on or after its effective date; applies with a known effective date after the chosen date shows as not_yet_effective). Never invent new results.

## 6. Portfolio ( /app )
The centrepiece. A dense table of all addresses: Address, Legal jurisdiction (city, state; show "mailing city differs" marker when postal_city differs), Year built, Units, Use, Determinations (small chips with counts by status at the current as-of date), Flags (count of conflict rows), Last change (latest effective date among that address's rules that falls within 12 months either side of the as-of date, or blank). Filters: state, city, status present, flagged only; text search. Sortable columns. Row click opens the determination. Summary bar above the table: total addresses, addresses with unknowns, addresses flagged for review, rules in force today.

## 7. Address determination ( /app/address/$id )
A record, not a page.
1. Record header: street address (serif H1); legal city and state; "Mailing city: X" only if different; building facts in mono with "not in data" where missing; as-of date; "Record id A0016"; buttons "Check an action", "Record reliance", "Tenant notice".
2. Verdict strip: counts by status for this address and date, each clickable to filter the rows.
3. Determinations grouped by operator action, in this order, each with a count: Raising rent (rent_increase_limits); Using pricing software (algorithmic_rent_setting); Screening applicants (screening_restrictions, application_screening_fees); Deposits (security_deposits); Ending a tenancy (just_cause_eviction).
4. Row (collapsed): status chip, rule title, level tag (State or City) with jurisdiction, key value in mono. One plain sentence under the title: the explanation (which already says "Applies unless", the missing fact, or the governing rule).
   Expanded: requirement; Evidence block styled as a citation: quoted text in serif inside a left rule, citation in mono, source link, retrieved date, evidence basis from sources.json via source_doc_id ("Supplied corpus", "Official capture", "Primary text"), confidence, conflict note if flagged, and a provenance line "Lawyer reviewed" when the rule's confidence is 0.8 or above, else "Machine extracted, quote verified".
5. Right rail (below content on mobile): "Monitor this property. Get notified when any of these rules change." Button "Request access".

## 8. Action check ( /app/check )
Form: address (typeahead), action (select: Raise the rent; Use rent-setting software; Screen an applicant; Charge an application or broker fee; Take or return a deposit; End a tenancy or not renew), as-of date (global). Result: a verdict line computed only from the determinations in the mapped categories at that date:
- "Restricted: <n> rules bind this action" when any row is applies or applies unless;
- "Unknown: a missing fact decides" when no applies row and at least one unknown;
- "No rule found at this level" when the category has only negative findings;
- "Not yet in force" or "Pending" shown as secondary lines when such rows exist.
Then the rows themselves (same row component), with key values prominent (for example "Cap: lesser of 5% or CPI"). Caption: "This check lists the rules that bind the action. It does not compute a specific amount or decide a specific case." Buttons: "Record reliance", "Open full determination".

## 9. Reliance record ( /app/record/$id?asof=&action= )
A printable document (print stylesheet, A4, serif body): title "Reliance record"; address and jurisdiction; action (if any); as-of date; generated timestamp; engine and rules version from meta.json; the determinations relied on with status, requirement, citation, quoted text, source URL, retrieved date; the disclaimer; a signature line "Reviewed by" (blank). Button "Print or save as PDF". Nothing is stored; say so in a small note.

## 10. Change register ( /app/changes )
Table built from src/data/changes.json and rules.json: Change, Instrument, Jurisdiction, Enacted, Effective, Status chip, Addresses affected (count from affected_address_ids), Review needed (count from conflict_flag_address_ids), Actions ("Example address", "Watch"). Rows: T1 CA AB 325 (effective 1 Jan 2026); T2 Hoboken and Jersey City algorithm bans (boundary); T3 NJ FAIR Act (enacted 20 Jul 2026, effective 1 Jul 2027, possible preemption flagged); T4 MA S.2983 and H.5222 (pending); T5 MA rent control ballot question (struck 23 Jun 2026, affected set empty). Use the notes text from changes.json; do not invent dates. "Watch" opens the request access modal with the change pre-filled, labelled early access.

## 11. Review queue ( /app/review )
Items: (a) each rule that has conflict_flag true in any lookup row, one item per rule, with the number of addresses carrying the flag and the conflict note; (b) each rule with confidence below 0.7, item "Low confidence extraction". Columns: Item, Jurisdiction, Reason, Addresses, Status (Open, Reviewed, Resolved: in-memory only), Assignee (free text, in-memory), Note. A banner: "Prototype: review status is not saved." Clicking an item opens the rule's evidence.

## 12. Evidence register ( /app/evidence )
The existing audit page, restyled as a table of sources.json: Source id, Title, Jurisdiction, Citation, Retrieved, Fingerprint (sha256, truncated, full on hover), Evidence basis, Rules citing it (count, from rules.json source_doc_id). Keep the data issues list at the bottom ("Skipped records: 0").

## 13. Tenant notice ( /app/notice/$id )
A printable notice for an address: "Your rights at <address>", as-of date, then the rules that apply (status applies or applies unless) grouped by: Rent, Deposits, Ending a tenancy, Screening and fees. Each as plain English using the rule's requirement text, with citation in mono. If a rule record has a `requirement_es` field, use it in Spanish mode; otherwise show the English requirement with the note "Spanish text pending" in Spanish mode. Explain on the page why this exists: Boston and Cambridge require landlords to give tenants a notice of rights. Print button. Disclaimer at the foot.

## 14. Method ( /app/method )
Four short sections: Sources; Extraction and quote verification; Address resolution; Validation. Validation table: Module A dev split 39/39; seed60 569/569; seed20 190/190; blind holdout20 192/192 (single run); change tests T1 to T5 5/5; unknown rate 27.3%. Then: "These figures measure our engine against an independently built key that applies the same reviewed legal rulings; the organisers' hidden key is the real test." Note that quotes and citations are shown in English in both languages. Link to the public GitHub repositories (placeholders until public).

## 15. Request access modal
Fields: name, work email, company, units managed (select), message. Submit shows: "Thanks. This is a prototype. We will contact you. Nothing is stored and no payment is taken." Do not send or store data. No pricing, no checkout.

## 16. Quality bar
375px mobile first, no horizontal scroll; keyboard navigable with visible focus; AA contrast; empty states never blank ("not in data"); address not found message as in i18n; all new strings in both en.ts and es.ts; existing tests keep passing; no new dependencies unless essential.
