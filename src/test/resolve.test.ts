import { describe, expect, it } from "vitest";
import { buildData, data, getAddress } from "@/data";
import { resolveAddress, resolveRow } from "@/lib/resolve";

const silent = () => {};
const find = (id: string, date: string, ruleId: string) => {
  const r = resolveAddress(getAddress(id)!, date, data, silent);
  return { r, item: Object.values(r.byCategory).flat().find((i) => i.rule.team_rule_id === ruleId) };
};

describe("data module", () => {
  it("loads all 81 rules without issues", () => {
    expect(data.rules.length).toBe(81);
    expect(data.issues).toEqual([]);
  });
  it("skips malformed records", () => {
    const d = buildData({ rules: { rules: [{ team_rule_id: "X" }] }, lookups: {}, changes: {}, addresses: { addresses: [] }, sources: { sources: [] } });
    expect(d.rules.length).toBe(0);
    expect(d.issues.length).toBeGreaterThan(0);
  });
});

describe("date adjustment", () => {
  it("CA-ALG-01 flips on 2026-01-01 for A0016", () => {
    expect(find("A0016", "2025-12-15", "CA-ALG-01").item?.badge).toBe("not_yet_effective");
    expect(find("A0016", "2026-10-01", "CA-ALG-01").item?.badge).toBe("applies");
  });
  it("NJ-ALG-01 flips on 2027-07-01 for A0227 with review flag", () => {
    const before = find("A0227", "2026-10-01", "NJ-ALG-01").item!;
    expect(before.badge).toBe("not_yet_effective");
    expect(before.review).toBe(true);
    expect(find("A0227", "2027-07-02", "NJ-ALG-01").item?.badge).toBe("applies");
  });
});

describe("stack and guardrails", () => {
  it("A0065 Dorchester resolves to Boston, pending bill and negative findings", () => {
    const { r } = find("A0065", "2026-10-01", "MA-ALG-P1");
    expect(r.stack.city).toBe("Boston");
    expect(r.stack.inferred).toBe(false);
    expect(find("A0065", "2026-10-01", "MA-ALG-P1").item?.badge).toBe("pending");
    expect(find("A0065", "2026-10-01", "MA-RENT-00").item?.badge).toBe("none");
    expect(find("A0065", "2026-10-01", "BOS-RENT-00").item?.badge).toBe("none");
    expect(r.failed.map((f) => f.team_rule_id)).toContain("MA-RENT-P1");
  });
  it("downgrades forced 'applies' for negative, pending and failed rules", () => {
    const warns: string[] = [];
    const w = (m: string) => warns.push(m);
    const row = (id: string) => ({ team_rule_id: id, result: "applies" as const, explanation: null, conflict_flag: false });
    expect(resolveRow(row("MA-RENT-00"), data.rulesById.get("MA-RENT-00")!, "2026-10-01", w).badge).toBe("none");
    expect(resolveRow(row("MA-ALG-P1"), data.rulesById.get("MA-ALG-P1")!, "2026-10-01", w).badge).toBe("pending");
    expect(resolveRow(row("MA-RENT-P1"), data.rulesById.get("MA-RENT-P1")!, "2026-10-01", w).badge).toBe("failed");
    expect(warns.length).toBe(3);
  });
});

describe("what's changing follows the date", () => {
  it("moves the FAIR Act to now-in-effect at 2027-07-01 for A0227", () => {
    const before = resolveAddress(getAddress("A0227")!, "2026-10-01", data, silent);
    expect(before.upcoming.map((r) => r.team_rule_id)).toContain("NJ-ALG-01");
    const after = resolveAddress(getAddress("A0227")!, "2027-07-01", data, silent);
    expect(after.upcoming.map((r) => r.team_rule_id)).not.toContain("NJ-ALG-01");
    expect(after.nowInEffect.map((r) => r.team_rule_id)).toContain("NJ-ALG-01");
  });
  it("keeps pending bills pending at any date", () => {
    const r = resolveAddress(getAddress("A0065")!, "2027-12-31", data, silent);
    expect(r.upcoming.map((x) => x.team_rule_id)).toContain("MA-ALG-P1");
  });
});
