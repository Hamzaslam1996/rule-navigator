# UI fixes 01, v2 (Hamza, 4 Oct). Implement everything below in one pass.

Rules: do not edit src/data/*.json. Permitted changes to src/data/index.ts: add optional nullable string `use_description` to addressSchema; optional nullable string `key_value_short` to ruleSchema (keep `requirement_es`); optional nullable string `governed_by` to lookupRowSchema. All new strings in en.ts and es.ts. No dashes as punctuation. Existing tests must pass; add tests for items 1, 3, 6 and 8.

The user is a compliance lead at a property operator. On every screen they want, in this order: what binds this building today, what is about to change, what we could not decide and which fact would decide it, and the evidence. Build for that.

## 1. Navigation (fixes the double highlight)
Sidebar items and routes, exactly: Portfolio (/app), Find address (/app/search, new: the home typeahead with the three "Try" links, nothing else), Action check (/app/check), Change register (/app/changes), Review queue (/app/review), Evidence register (/app/evidence), Method (/app/method). Remove Tenant notice from the sidebar; it stays as a button on the address page. Exactly one item is active, matched on the current route.

## 2. Dates everywhere
Never show locale numeric dates. The as-of control is a button showing "1 Oct 2026" that opens the date picker; quick chips "1 Oct 2026", "1 Jan 2026", "2 Jul 2027". Tables and records use the same "1 Oct 2026" format; ISO only inside mono evidence blocks and the footer stamp.

## 3. Address determination page: lead with the answer
Above the grouped rows add two panels, side by side on desktop:
- "Key obligations today": one line per rule with badge Applies or Applies unless and a key_value, grouped by the five actions, showing the key value in mono and the rule title small under it (for example "Rent increase cap: 1.6% annual allowable increase (3/1/2026 to 2/28/2027)"). Rules without a key value are listed by title only. This is the panel an operator reads first.
- "Coming up and unresolved": (a) every rule with status not yet effective, with its start date ("NJ FAIR Act, from 1 Jul 2027"); (b) every unknown, as "Needs: <missing fact>" using the engine explanation's missing fact (year built, units, owner identity, funding status); (c) pending bills, labelled "Bill, not law". If all empty: "Nothing scheduled and nothing unresolved."
Building facts become a proper facts strip under the address: Legal jurisdiction, Year built, Units, Use, Mailing city (only if different), each "Not in data" when missing. Keep the status count strip as filters. Keep the grouped rows as they are.

## 3b. Determination row layout
Three columns on desktop: status chips (fixed width), then title and one explanation line, then a key value column that is LEFT aligned, at most two lines, showing `key_value_short` (fall back to key_value truncated to 70 characters with a title attribute for the full text). The full key_value appears inside the expanded panel under its own eyebrow "Key value". Superseded rows: when `governed_by` is present render "Governed instead by <title of that rule>" as a link that expands and scrolls to that row. Negative findings ("No rule at this level") render as a single quiet grey line, no chip and no key value column, placed last in their group. Rows with the review flag show the conflict_note in an amber left bordered paragraph inside the expanded panel.

## 4. Row provenance: honest labels
Remove the "Lawyer reviewed" and "Machine extracted" labels (they were derived from confidence and are not true provenance). Replace with: "Quote verified against source" (always true for rules with a quoted_span), the evidence basis from sources.json ("Supplied corpus", "Official capture", "Primary text"), and "Confidence 0.9". Keep the retrieved date and fingerprint.

## 5. Portfolio
Use column reads address.use_description. "Not in data" is the single wording for missing facts everywhere (replace "not in records"). Determinations cell: chips in the order Applies, Applies unless, Unknown, Superseded, Not yet effective, Pending; "No rule at this level" as quiet grey text after the chips, not a chip. Rename "Last change" to "Next change" and show the nearest effective date after the as-of date among the address's rules (blank if none); add a sortable column. Summary tiles: Total addresses; Addresses with unknowns; Flagged for review (addresses with at least one conflict_flag row); Rules in force today. Row click opens the determination.

## 6. Action check
Address field is the same typeahead as Find address (matches address_id, street, legal city, ZIP); prefilled when opened from an address page; default action "Raise the rent"; result appears as soon as both are set. Result layout: a verdict line in plain words ("3 rules apply to raising the rent at 3515 Fillmore St on 1 Oct 2026"; "A missing fact decides: units not in data"; "No rule at this level"), then a "What binds" list of key values (as in item 3), then "Coming up" if any, then the rows, then the caption that no amount is computed and no case is decided. The reliance record link must carry the action name, not an index.

## 7. Reliance record
Field labels: "Address" (never "Apartment address"), "Legal jurisdiction", "Record id", "As of", "Action", "Generated", "Rules and engine". Group into three sections: "Relied on" (applies, applies unless, with any assumption sentence shown), "Not applicable on this date" (superseded with the governing rule named, not yet effective with its date, pending), "Unresolved" (unknown, with the missing fact). Header shows address, legal jurisdiction, as-of date, action (name, never an index), generated timestamp, and "Rules <rules_version> · Engine <engine_commit>" from meta.json. Keep print styling, signature line, disclaimer, and the "nothing is stored" note.

## 8. Change register
Read src/data/change_register.json when present (fields: test_id, title, instrument, jurisdiction, enacted, effective, status, summary, addresses_affected, review_needed). Columns: Change (title in serif, instrument in mono under it), Jurisdiction, Enacted, Effective, Status chip, Summary (full sentences, never truncated), Addresses affected, Review needed, Actions (Example address, Watch). Fall back to changes.json only if the file is missing.

## 9. Review queue
Reason shows the rule's conflict_note verbatim; otherwise "Low confidence extraction (confidence 0.55)". Remove "Flagged by our team for a second look". Filter: "Open questions" (conflict_flag) and "Low confidence" (confidence below 0.7); default to Open questions. Hide rows with 0 addresses unless Open question. Status, assignee and note stay in memory with the existing banner.

## 10. Tenant notice
The sentence under the title must be jurisdiction aware: for Boston addresses "Boston requires landlords to give tenants a notice of rights (Housing Stability Notification Act)."; for Cambridge "Cambridge requires landlords to give tenants a notice of rights (Cambridge M.C. ch. 8.71)."; everywhere else "A plain language summary of the rules that protect tenants at this address, with the law behind each one." Add under the title: "Issued by: ______________ (landlord or agent)" and "Date: <as-of date>". Group headings and section order unchanged. In Spanish mode use requirement_es; English citations stay as they are.

## 11. Footer stamp
"Rules <rules_version> · Engine <engine_commit> · <rules_in_force> rules · <negative_findings> negative findings · <addresses> addresses · As of <date>" from meta.json; fall back to computed counts.

## 12. Report
List each item as done or not done, with the reason, and the test results.
