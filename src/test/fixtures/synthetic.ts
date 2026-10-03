/** Synthetic, invented fixtures — no real rule text. Used instead of src/data in tests. */
import type { RawData } from "@/data";

const base = {
  key_value: null,
  coverage_conditions: null,
  exemptions: null,
  citation: "Test Code § 1",
  source_doc_id: null,
  source_url: "https://example.test/doc",
  quoted_span: "Invented quoted text.",
  confidence: 0.9,
  conflict_flag: false,
  conflict_note: null,
  negative_finding: false,
};

export const rules = [
  { ...base, team_rule_id: "TEST-STATE-RENT", jurisdiction: "TS", level: "state", category: "rent_increase_limits", status: "in_force", title: "Test rent cap", requirement: "Invented cap.", effective_date: "2026-01-01" },
  { ...base, team_rule_id: "TEST-STATE-ALG", jurisdiction: "TS", level: "state", category: "algorithmic_rent_setting", status: "not_yet_effective", title: "Test algorithm ban", requirement: "Invented ban.", effective_date: "2027-03-01", conflict_flag: true, conflict_note: "Possible preemption." },
  { ...base, team_rule_id: "TEST-STATE-NEG", jurisdiction: "TS", level: "state", category: "just_cause_eviction", status: "in_force", title: "No test eviction rule", requirement: "Invented reason there is none.", effective_date: null, negative_finding: true },
  { ...base, team_rule_id: "TEST-STATE-PEND", jurisdiction: "TS", level: "state", category: "security_deposits", status: "pending", title: "Test pending bill", requirement: "Invented bill.", effective_date: null },
  { ...base, team_rule_id: "TEST-STATE-FAIL", jurisdiction: "TS", level: "state", category: "screening_restrictions", status: "failed", title: "Test failed measure", requirement: "Invented failure.", effective_date: null },
  { ...base, team_rule_id: "TEST-CITY-ALG", jurisdiction: "Testville, TS", level: "city", category: "application_screening_fees", status: "in_force", title: "Test city fee rule", requirement: "Invented fee rule.", effective_date: "2026-06-01" },
];

export const raw: RawData = {
  rules: { rules },
  lookups: {
    as_of: "2026-10-01",
    lookups: {
      T001: [
        { team_rule_id: "TEST-STATE-RENT", result: "applies", explanation: null },
        { team_rule_id: "TEST-STATE-ALG", result: "not_yet_effective", explanation: null, conflict_flag: true },
        { team_rule_id: "TEST-CITY-ALG", result: "applies", explanation: "Decided by reviewer (Q3)" },
        { team_rule_id: "TEST-STATE-PEND", result: "applies", explanation: null },
        { team_rule_id: "TEST-STATE-FAIL", result: "applies", explanation: null },
      ],
    },
  },
  changes: { TX1: { affected_address_ids: ["T001"], conflict_flag_address_ids: ["T001"], notes: "Invented change note." } },
  addresses: {
    addresses: [
      { address_id: "T001", street_address: "1 TEST ST", postal_city: "North Neighborhood", state: "TS", zip: "00000", year_built: "", units: "" },
      { address_id: "T002", street_address: "2 TEST ST", postal_city: "Otherplace", state: "TS", zip: "", year_built: "1950", units: "4" },
    ],
  },
  sources: { sources: [{ source_id: "S-TEST", url: "example.test/doc", retrieved_at: "2026-10-01T00:00Z", sha256: "a".repeat(64) }] },
};
