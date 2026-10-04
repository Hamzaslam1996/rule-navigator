# Implement Statute Street design brief v2

## Scope
Rebuild the product as a public door at `/` and a dated compliance workspace under `/app`, while preserving the existing bundled data and pure resolution logic.

## Pages and navigation
- Replace the current shared public header with a persistent disclaimer plus two shells: a restrained public header/footer and an institutional workspace shell.
- Build `/app` portfolio, `/app/address/$id`, `/app/check`, `/app/record/$id`, `/app/changes`, `/app/review`, `/app/evidence`, `/app/notice/$id`, and `/app/method`.
- Keep legacy URLs working through redirects to their new workspace equivalents.
- Add the request access modal wherever the brief calls for it.

## Shared workspace behavior
- Add a global as-of date controlled by `?asof=YYYY-MM-DD`, including quick dates and a date input in the workspace top bar.
- Add responsive sidebar navigation, becoming bottom navigation on small screens.
- Show the dataset date and the version/count stamp on every workspace screen.
- Reuse one compact expandable determination row across address, action check, and evidence-linked review flows.
- Add the specified one-time status pulse and temporary Changed marker when date changes alter a determination.

## Screen implementation
- Public door: exact seven-section information hierarchy, search into the workspace, proof counts, early-access band, and no address directory.
- Portfolio: sortable, filterable address ledger with summary counts and row navigation.
- Address: record header, action-grouped determinations, clickable verdict filters, evidence details, and monitor rail.
- Action check: address/action form and verdict computed only from mapped rule categories.
- Reliance record and tenant notice: printable A4 layouts using current determinations, versions, citations, and bilingual fallbacks.
- Change register, review queue, evidence register, and method: dense tables and exact brief content, with only in-memory review state.

## Data, language, and safety
- Do not change any `src/data/*.json` file.
- Extend only `ruleSchema` in `src/data/index.ts` with optional nullable `requirement_es`.
- Read metadata directly through the data module and derive every count/result from validated bundled data.
- Add complete English and Spanish interface dictionaries. Keep legal quotations and citations in English.
- Preserve existing note filtering and never invent legal facts or missing dates.

## Validation
- Keep the current test suite passing and add focused tests only where shared helper logic warrants it.
- Check build diagnostics and exercise public, workspace, determination, modal, print, empty-state, language, and mobile flows in the preview.
