/**
 * Single data swap point. Every screen reads bundled JSON through this module.
 * Replace the JSON imports (or buildData input) with real back-end output later.
 */
import { z } from "zod";
import rulesRaw from "./rules.json";
import lookupsRaw from "./lookups.json";
import changesRaw from "./changes.json";
import addressesRaw from "./addresses.json";
import sourcesRaw from "./sources.json";

export const CATEGORIES = [
  "rent_increase_limits",
  "just_cause_eviction",
  "security_deposits",
  "application_screening_fees",
  "screening_restrictions",
  "algorithmic_rent_setting",
] as const;
export type Category = (typeof CATEGORIES)[number];

const nstr = z
  .string()
  .nullish()
  .transform((v) => v ?? null);
const blank = z
  .string()
  .nullish()
  .transform((v) => (v ?? "").trim());

export const ruleSchema = z.object({
  team_rule_id: z.string().min(1),
  jurisdiction: z.string().min(1),
  level: z.enum(["state", "city"]),
  category: z.enum(CATEGORIES),
  status: z.enum(["in_force", "not_yet_effective", "pending", "failed"]),
  title: z.string().min(1),
  requirement: z.string().min(1),
  requirement_es: nstr.optional(),
  key_value: nstr,
  coverage_conditions: nstr,
  exemptions: nstr,
  effective_date: nstr,
  citation: nstr,
  source_doc_id: nstr,
  source_url: nstr,
  quoted_span: nstr,
  confidence: z.number().min(0).max(1),
  conflict_flag: z.boolean(),
  conflict_note: nstr,
  negative_finding: z.boolean(),
});
export type Rule = z.infer<typeof ruleSchema>;

export const lookupRowSchema = z.object({
  team_rule_id: z.string().min(1),
  result: z.enum(["applies", "unknown", "superseded", "not_yet_effective", "pending"]),
  explanation: nstr,
  conflict_flag: z.boolean().default(false),
});
export type LookupRow = z.infer<typeof lookupRowSchema>;

export const addressSchema = z.object({
  address_id: z.string().min(1),
  street_address: z.string().min(1),
  postal_city: blank,
  state: z.string().min(2),
  zip: blank,
  year_built: blank,
  units: blank,
  // Geocoded legal jurisdiction (Census incorporated place); the mailing city above may differ.
  legal_city: blank,
  legal_state: blank,
  jurisdiction_method: blank,
});
export type Address = z.infer<typeof addressSchema>;

export const sourceSchema = z.object({
  source_id: z.string().min(1),
  jurisdiction: nstr,
  title: nstr,
  citation: nstr,
  url: nstr,
  retrieved_at: nstr,
  sha256: nstr,
});
export type Source = z.infer<typeof sourceSchema>;

export const changeSchema = z.object({
  affected_address_ids: z.array(z.string()),
  conflict_flag_address_ids: z.array(z.string()).default([]),
  notes: z.string().default(""),
});
export type ChangeTest = z.infer<typeof changeSchema> & { test_id: string };

export interface DataIssue {
  file: string;
  record: string;
  message: string;
}

export interface DataBundle {
  rules: Rule[];
  rulesById: Map<string, Rule>;
  addresses: Address[];
  lookupsAsOf: string;
  lookups: Record<string, LookupRow[]>;
  changes: ChangeTest[];
  sources: Source[];
  issues: DataIssue[];
}

export interface RawData {
  rules: unknown;
  lookups: unknown;
  changes: unknown;
  addresses: unknown;
  sources: unknown;
}

export function normalizeUrl(u: string | null | undefined): string {
  if (!u) return "";
  return u
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

function asArray(v: unknown, key: string): unknown[] {
  if (v && typeof v === "object" && Array.isArray((v as Record<string, unknown>)[key])) {
    return (v as Record<string, unknown[]>)[key] ?? [];
  }
  return [];
}

function issueMsg(e: z.ZodError) {
  return e.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

/** Pure: validates raw JSON, skips malformed records and records each problem. */
export function buildData(raw: RawData): DataBundle {
  const issues: DataIssue[] = [];

  const rules: Rule[] = [];
  const rulesById = new Map<string, Rule>();
  asArray(raw.rules, "rules").forEach((r, i) => {
    const p = ruleSchema.safeParse(r);
    const id = (r as { team_rule_id?: string })?.team_rule_id ?? `#${i}`;
    if (!p.success) return void issues.push({ file: "rules.json", record: id, message: issueMsg(p.error) });
    if (rulesById.has(p.data.team_rule_id))
      return void issues.push({ file: "rules.json", record: id, message: "Duplicate team_rule_id" });
    rules.push(p.data);
    rulesById.set(p.data.team_rule_id, p.data);
  });

  const addresses: Address[] = [];
  asArray(raw.addresses, "addresses").forEach((a, i) => {
    const p = addressSchema.safeParse(a);
    const id = (a as { address_id?: string })?.address_id ?? `#${i}`;
    if (!p.success) return void issues.push({ file: "addresses.json", record: id, message: issueMsg(p.error) });
    addresses.push(p.data);
  });

  const sources: Source[] = [];
  asArray(raw.sources, "sources").forEach((s, i) => {
    const p = sourceSchema.safeParse(s);
    const id = (s as { source_id?: string })?.source_id ?? `#${i}`;
    if (!p.success) return void issues.push({ file: "sources.json", record: id, message: issueMsg(p.error) });
    sources.push(p.data);
  });

  const lk = (raw.lookups ?? {}) as { as_of?: unknown; lookups?: unknown };
  const lookupsAsOf =
    typeof lk.as_of === "string" && /^\d{4}-\d{2}-\d{2}$/.test(lk.as_of) ? lk.as_of : "2026-10-01";
  if (lookupsAsOf !== lk.as_of)
    issues.push({ file: "lookups.json", record: "as_of", message: "Missing or invalid as_of; using 2026-10-01" });
  const lookups: Record<string, LookupRow[]> = {};
  if (lk.lookups && typeof lk.lookups === "object") {
    for (const [addrId, rows] of Object.entries(lk.lookups as Record<string, unknown>)) {
      if (!Array.isArray(rows)) {
        issues.push({ file: "lookups.json", record: addrId, message: "Expected an array of rows" });
        continue;
      }
      lookups[addrId] = [];
      rows.forEach((row, i) => {
        const p = lookupRowSchema.safeParse(row);
        const rec = `${addrId}[${i}]`;
        if (!p.success) return void issues.push({ file: "lookups.json", record: rec, message: issueMsg(p.error) });
        if (!rulesById.has(p.data.team_rule_id))
          return void issues.push({
            file: "lookups.json",
            record: rec,
            message: `References unknown rule ${p.data.team_rule_id}`,
          });
        lookups[addrId]!.push(p.data);
      });
    }
  }

  const changes: ChangeTest[] = [];
  if (raw.changes && typeof raw.changes === "object") {
    for (const [testId, c] of Object.entries(raw.changes as Record<string, unknown>)) {
      const p = changeSchema.safeParse(c);
      if (!p.success) {
        issues.push({ file: "changes.json", record: testId, message: issueMsg(p.error) });
        continue;
      }
      changes.push({ test_id: testId, ...p.data });
    }
  }

  return { rules, rulesById, addresses, lookupsAsOf, lookups, changes, sources, issues };
}

export const data: DataBundle = buildData({
  rules: rulesRaw as unknown,
  lookups: lookupsRaw as unknown,
  changes: changesRaw as unknown,
  addresses: addressesRaw as unknown,
  sources: sourcesRaw as unknown,
});

if (data.issues.length > 0) {
  console.warn(`[Statute Street] ${data.issues.length} data issue(s) — malformed records skipped:`, data.issues);
}

export const getAddresses = () => data.addresses;
export const getAddress = (id: string) => data.addresses.find((a) => a.address_id === id);
export const getRules = () => data.rules;
export const getRule = (id: string) => data.rulesById.get(id);
export const getLookups = (id: string) => data.lookups[id] ?? [];
export const lookupsAsOf = data.lookupsAsOf;
export const getChanges = () => data.changes;
export const getSources = () => data.sources;
export const getDataIssues = () => data.issues;
export function getSourceByUrl(url: string | null | undefined): Source | undefined {
  const n = normalizeUrl(url);
  if (!n) return undefined;
  return data.sources.find((s) => normalizeUrl(s.url) === n);
}
export function getRulesCitingSource(s: Source): Rule[] {
  const n = normalizeUrl(s.url);
  return data.rules.filter((r) => (n && normalizeUrl(r.source_url) === n) || (r.source_doc_id && r.source_doc_id === s.source_id));
}
