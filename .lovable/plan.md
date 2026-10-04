# Implement UI fixes 01 and 02

## Scope
Implement every requirement in `docs/UI_FIXES_01.md`, then the two copy additions in `docs/UI_FIXES_02.md`, without changing any JSON data file.

## Implementation

1. **Data contract and shared formatting**
   - Add only the permitted optional fields to the Zod schemas: address `use_description`, rule `key_value_short`, and lookup `governed_by`.
   - Add a validated loader for `change_register.json`, using `changes.json` only when the register is unavailable.
   - Standardize all visible dates as `1 Oct 2026` style, leaving ISO only in evidence blocks and the footer stamp.

2. **Workspace navigation and global date control**
   - Replace the sidebar and mobile navigation with the exact seven destinations and labels from the brief.
   - Add the dedicated `/app/search` route containing only the address typeahead and three example links.
   - Ensure exact active matching so only one navigation item highlights.
   - Replace the native date field with a formatted button, calendar popover, and the three required quick dates.

3. **Address determination**
   - Add the facts strip and the two lead panels: key obligations today, plus coming up and unresolved.
   - Keep status counts as filters and preserve the five action groups beneath the lead panels.
   - Rework determination rows into the requested three-column layout, including shortened key values, expanded full values, quiet negative findings, conflict notes, and governed-by links that open and scroll to the governing row.
   - Replace inferred provenance claims with quote verification, source evidence basis, confidence, retrieval date, and fingerprint.

4. **Portfolio and action check**
   - Use the new Use field, required determination order, quiet negative findings, summary definitions, and sortable Next change date.
   - Reuse the address typeahead in Action check, default to Raise the rent, and show results immediately with the requested verdict, binding values, upcoming items, rows, caption, and action-name reliance link.

5. **Reliance record, changes, review, notice, and footer**
   - Rebuild the reliance record header and three result sections with governing rules, assumptions, unresolved facts, version stamp, print treatment, disclaimer, signature, and storage note.
   - Render the change register’s complete columns and full summaries from `change_register.json`.
   - Add Review queue filters, exact reason wording, zero-address behavior, and in-memory status, assignee, and note values.
   - Make tenant notice copy jurisdiction-aware, add issuer and date lines, and retain Spanish requirement handling.
   - Build the footer stamp from metadata with computed fallbacks.

6. **UI fixes 02 copy**
   - Add the bilingual “Where it fits” Method section with its three-item list before repositories.
   - Replace the bilingual early-access heading with the supplied operator-system copy.

7. **Tests and verification**
   - Add or update tests for navigation active state, determination lead/row behavior, Action check output, and change-register loading/rendering, while preserving synthetic resolver tests.
   - Run the full Vitest suite.
   - Verify the main routes and the central address/action flows in English and Spanish at desktop and mobile widths.
   - Confirm the latest preview build and runtime logs are clean and report every brief item as done or not done with its reason.

## Constraints
- Do not modify `src/data/*.json`.
- Keep all new UI strings in both translation dictionaries.
- Use no dash punctuation in new UI copy.
- Preserve the front-end-only architecture and existing design system.
