# Statute Street — front-end data contract (src/data/)

The UI reads exactly five files from `src/data/`, all UTF-8 JSON, through `src/data/index.ts` (validated with zod).
Records that fail validation are skipped and listed under "Data issues" on /audit — they never crash the app.
Field names are exact and case-sensitive. "nullable" = the key should be present; `null` (or missing) is accepted.

## 1. rules.json
```json
{ "rules": [ Rule, ... ] }
```
| field | type | required | notes |
|---|---|---|---|
| team_rule_id | string | yes | unique across the file |
| jurisdiction | string | yes | state level: `"CA"`, `"NJ"`, `"MA"`; city level: `"<City>, <ST>"` e.g. `"Los Angeles, CA"`, `"Jersey City, NJ"` |
| level | `"state"` \| `"city"` | yes | |
| category | enum | yes | `rent_increase_limits`, `just_cause_eviction`, `security_deposits`, `application_screening_fees`, `screening_restrictions`, `algorithmic_rent_setting` |
| status | enum | yes | `in_force`, `not_yet_effective`, `pending`, `failed` |
| title | string | yes | shown as the card heading |
| requirement | string | yes, non-empty | plain-English rule; for negative findings put the plain reason here (e.g. "State law bars local rent control …") |
| key_value | string | nullable | |
| coverage_conditions | string | nullable | |
| exemptions | string | nullable | |
| effective_date | string | nullable | `YYYY-MM-DD` (or `YYYY-MM` if only month known) — drives the date slider |
| citation | string | nullable | |
| source_doc_id | string | nullable | |
| source_url | string | nullable | joined to sources.json `url` (protocol, `www.`, trailing `/` ignored) |
| quoted_span | string | nullable | exact text from the source |
| confidence | number 0–1 | yes | ≥0.85 High, ≥0.6 Medium, else Low |
| conflict_flag | boolean | yes | shows "Needs human review" |
| conflict_note | string | nullable | shown with the flag (public text — see note filter) |
| negative_finding | boolean | yes | `true` = "No rule at this level"; never shown as Applies |

## 2. lookups.json
```json
{ "as_of": "YYYY-MM-DD", "lookups": { "<address_id>": [ LookupRow, ... ] } }
```
| field | type | required | notes |
|---|---|---|---|
| team_rule_id | string | yes | must exist in rules.json, else the row is skipped |
| result | enum | yes | `applies`, `unknown`, `superseded`, `not_yet_effective`, `pending` |
| explanation | string | nullable | for `unknown`, name the missing fact |
| conflict_flag | boolean | optional (default false) | |

`as_of` must be `YYYY-MM-DD`; it is the default date of the slider.

## 3. changes.json
```json
{ "<test_id>": { "affected_address_ids": ["A0001"], "conflict_flag_address_ids": [], "notes": "..." } }
```
`affected_address_ids` required (array of strings); `conflict_flag_address_ids` optional (default `[]`); `notes` optional string.

## 4. addresses.json
```json
{ "addresses": [ { "address_id": "", "street_address": "", "postal_city": "", "state": "", "zip": "", "year_built": "", "units": "" } ] }
```
`address_id`, `street_address` (non-empty) and `state` (2+ chars) required. Others are strings; blank/null = "not in records". `year_built` and `units` are strings (e.g. `"1926"`, `"21"`), not numbers.
Every key in lookups.json should have a matching `address_id` here.

## 5. sources.json (audit log)
```json
{ "sources": [ { "source_id": "", "jurisdiction": "", "title": "", "citation": "", "url": "", "retrieved_at": "", "sha256": "" } ] }
```
`source_id` required; others nullable. `retrieved_at` ISO date/time (e.g. `2026-10-01T22:35Z`); blank shows "Retrieval date not recorded". `sha256` = 64-hex fingerprint of the captured copy.

## Note filter (UI)
Any `conflict_note`, lookup `explanation` or change `notes` text that starts with "Decided by" or contains a "(Q<number>" id is hidden; the review badge still shows.

## Optional fields added 4 Oct 2026 (rulings_12)
- rules.json: `key_value_short` (string, at most 70 characters, operator facing one line per positive rule; negative findings carry "No city rule; state law applies" or "No state rule"), `requirement_es` (Spanish summary).
- lookups.json rows: `governed_by` (team_rule_id of the governing rule on superseded rows), `assumptions` (array of strings: the exemptions presumed not to apply).
- addresses.json: `use_description`, `legal_city`, `legal_state`, `jurisdiction_method`.
- change_register.json: `{ "changes": [ { test_id, title, instrument, jurisdiction, enacted, effective, status, summary, addresses_affected, review_needed } ] }`; display rows for the five change tests, counts computed from changes.json.
- meta.json: `rules_version`, `engine_commit`, `rules`, `rules_in_force`, `negative_findings`, `addresses`, `as_of`, `generated_at`.
