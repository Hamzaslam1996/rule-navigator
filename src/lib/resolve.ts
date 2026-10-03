import { CATEGORIES, type Address, type Category, type DataBundle, type LookupRow, type Rule } from "@/data";

export const DATE_MIN = "2025-12-01";
export const DATE_MAX = "2027-12-31";

/** "2025-06" -> "2025-06-01"; "2025-06-21" unchanged; anything else -> null. */
export function normDate(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  if (/^\d{4}-\d{2}$/.test(t)) return `${t}-01`;
  return null;
}
export const isMonthPrecision = (s: string | null | undefined) => !!s && /^\d{4}-\d{2}$/.test(s.trim());

export type Badge = "applies" | "unknown" | "superseded" | "not_yet_effective" | "pending" | "none" | "failed";
export const BADGE_ORDER: Badge[] = ["applies", "unknown", "superseded", "not_yet_effective", "pending", "none"];

export interface ResolvedItem {
  rule: Rule;
  badge: Badge;
  review: boolean;
  reviewNote: string | null;
  explanation: string | null;
  /** Raw effective date string (may be month precision) when badge is not_yet_effective. */
  takesEffect: string | null;
  fromLookup: boolean;
  downgraded: boolean;
}

type Warn = (msg: string) => void;
const defaultWarn: Warn = (m) => console.warn(`[Statute Street] ${m}`);

export function resolveRow(row: LookupRow, rule: Rule, date: string, warn: Warn = defaultWarn): ResolvedItem {
  const E = normDate(rule.effective_date);
  const review = row.conflict_flag || rule.conflict_flag;
  const reviewNote = rule.conflict_note ?? (review ? row.explanation : null);
  let badge: Badge;
  let downgraded = false;
  const guard = (to: Badge, why: string) => {
    badge = to;
    if (row.result === "applies") {
      downgraded = true;
      warn(`Lookup said "applies" for ${rule.team_rule_id} but ${why}; downgraded to "${to}".`);
    }
  };

  if (rule.negative_finding) guard("none", "it is a negative finding");
  else if (rule.status === "pending") guard("pending", "it is a pending bill");
  else if (rule.status === "failed") guard("failed", "it did not become law");
  else {
    const r = row.result;
    if ((r === "applies" || r === "not_yet_effective") && E && date < E) badge = "not_yet_effective";
    else if (r === "not_yet_effective" && E && date >= E) badge = "applies";
    else badge = r;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const final = badge!;
  return {
    rule,
    badge: final,
    review,
    reviewNote,
    explanation: row.explanation,
    takesEffect: final === "not_yet_effective" ? rule.effective_date : null,
    fromLookup: true,
    downgraded,
  };
}

export interface JurisdictionStack {
  state: string;
  city: string | null;
  cityJurisdiction: string | null;
  inferred: boolean;
}

export function jurisdictionStack(address: Address, rows: LookupRow[], rulesById: Map<string, Rule>): JurisdictionStack {
  const cityRule = rows.map((r) => rulesById.get(r.team_rule_id)).find((r) => r?.level === "city");
  if (cityRule) {
    return {
      state: address.state,
      cityJurisdiction: cityRule.jurisdiction,
      city: cityRule.jurisdiction.split(",")[0].trim(),
      inferred: false,
    };
  }
  const pc = address.postal_city.trim();
  return { state: address.state, city: pc || null, cityJurisdiction: pc ? `${pc}, ${address.state}` : null, inferred: true };
}

export type MissingFact = "year_built" | "units";
export function missingFacts(address: Address): MissingFact[] {
  const out: MissingFact[] = [];
  if (!address.year_built.trim()) out.push("year_built");
  if (!address.units.trim()) out.push("units");
  return out;
}

export type ConfidenceLevel = "high" | "medium" | "low";
export function confidenceLabel(c: number): { level: ConfidenceLevel; value: string } {
  const level: ConfidenceLevel = c >= 0.85 ? "high" : c >= 0.6 ? "medium" : "low";
  return { level, value: c.toFixed(2) };
}

export interface ChangeNote {
  test_id: string;
  notes: string;
  review: boolean;
}

export interface AddressResult {
  stack: JurisdictionStack;
  hasLookups: boolean;
  byCategory: Record<Category, ResolvedItem[]>;
  counts: Record<Badge | "review", number>;
  upcoming: Rule[];
  failed: Rule[];
  changeNotes: ChangeNote[];
  tickDates: string[];
}

export function resolveAddress(address: Address, date: string, data: DataBundle, warn: Warn = defaultWarn): AddressResult {
  const rows = data.lookups[address.address_id] ?? [];
  const stack = jurisdictionStack(address, rows, data.rulesById);
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, [] as ResolvedItem[]])) as Record<
    Category,
    ResolvedItem[]
  >;
  const failedIds = new Set<string>();
  const seen = new Set<string>();

  for (const row of rows) {
    const rule = data.rulesById.get(row.team_rule_id);
    if (!rule || seen.has(rule.team_rule_id)) continue;
    seen.add(rule.team_rule_id);
    const item = resolveRow(row, rule, date, warn);
    if (item.badge === "failed") failedIds.add(rule.team_rule_id);
    else byCategory[rule.category].push(item);
  }

  // Negative findings: state always; city only when the city is confirmed by lookup rows.
  const negJur = new Set([stack.state, ...(stack.inferred || !stack.cityJurisdiction ? [] : [stack.cityJurisdiction])]);
  for (const rule of data.rules) {
    if (!rule.negative_finding || !negJur.has(rule.jurisdiction) || seen.has(rule.team_rule_id)) continue;
    seen.add(rule.team_rule_id);
    byCategory[rule.category].push({
      rule,
      badge: "none",
      review: rule.conflict_flag,
      reviewNote: rule.conflict_note,
      explanation: null,
      takesEffect: null,
      fromLookup: false,
      downgraded: false,
    });
  }

  for (const c of CATEGORIES) {
    byCategory[c].sort((a, b) => (a.rule.level === b.rule.level ? 0 : a.rule.level === "state" ? -1 : 1));
  }

  const counts = { applies: 0, unknown: 0, superseded: 0, not_yet_effective: 0, pending: 0, none: 0, failed: 0, review: 0 };
  for (const c of CATEGORIES)
    for (const it of byCategory[c]) {
      counts[it.badge]++;
      if (it.review) counts.review++;
    }

  const stackJur = new Set([stack.state, ...(stack.cityJurisdiction ? [stack.cityJurisdiction] : [])]);
  const inStack = data.rules.filter((r) => stackJur.has(r.jurisdiction));
  const upcoming = inStack.filter((r) => {
    if (r.negative_finding || r.status === "failed") return false;
    const E = normDate(r.effective_date);
    return r.status === "pending" || r.status === "not_yet_effective" || (!!E && E > date);
  });
  const failed = [
    ...inStack.filter((r) => r.status === "failed"),
    ...[...failedIds].map((id) => data.rulesById.get(id)!).filter((r) => !stackJur.has(r.jurisdiction)),
  ];

  const changeNotes = data.changes
    .filter((c) => c.affected_address_ids.includes(address.address_id))
    .map((c) => ({ test_id: c.test_id, notes: c.notes, review: c.conflict_flag_address_ids.includes(address.address_id) }));

  const tickDates = [
    ...new Set(
      inStack
        .map((r) => normDate(r.effective_date))
        .filter((d): d is string => !!d && d >= DATE_MIN && d <= DATE_MAX),
    ),
  ].sort();

  return { stack, hasLookups: rows.length > 0, byCategory, counts, upcoming, failed, changeNotes, tickDates };
}
