import { describe, expect, it } from "vitest";
import { buildData } from "@/data";
import { resolveAddress, resolveRow } from "@/lib/resolve";
import { hideInternalNote } from "@/lib/format";
import { raw } from "./fixtures/synthetic";

const silent = () => {};
const data = buildData(raw);
const addr = (id: string) => data.addresses.find((a) => a.address_id === id)!;
const find = (id: string, date: string, ruleId: string) => {
  const r = resolveAddress(addr(id), date, data, silent);
  return { r, item: Object.values(r.byCategory).flat().find((i) => i.rule.team_rule_id === ruleId) };
};

describe("data module", () => {
  it("loads synthetic fixtures without issues", () => {
    expect(data.rules.length).toBe(6);
    expect(data.addresses.length).toBe(2);
    expect(data.issues).toEqual([]);
  });
  it("skips malformed records", () => {
    const d = buildData({ ...raw, rules: { rules: [...(raw.rules as { rules: unknown[] }).rules, { team_rule_id: "TEST-BROKEN" }] } });
    expect(d.rules.length).toBe(6);
    expect(d.issues.some((i) => i.record === "TEST-BROKEN")).toBe(true);
  });
});

describe("date adjustment", () => {
  it("flips a not_yet_effective rule to applies on its effective date", () => {
    const before = find("T001", "2026-10-01", "TEST-STATE-ALG").item!;
    expect(before.badge).toBe("not_yet_effective");
    expect(before.review).toBe(true);
    expect(find("T001", "2027-03-01", "TEST-STATE-ALG").item?.badge).toBe("applies");
  });
  it("shows applies as not_yet_effective before the effective date", () => {
    expect(find("T001", "2026-03-01", "TEST-CITY-ALG").item?.badge).toBe("not_yet_effective");
    expect(find("T001", "2026-10-01", "TEST-CITY-ALG").item?.badge).toBe("applies");
  });
});

describe("stack and guardrails", () => {
  it("infers city from a city-level rule when postal_city is a neighbourhood", () => {
    const { r } = find("T001", "2026-10-01", "TEST-CITY-ALG");
    expect(r.stack.city).toBe("Testville");
    expect(r.stack.inferred).toBe(false);
  });
  it("never shows negative, pending or failed as Applies", () => {
    const { r } = find("T001", "2026-10-01", "TEST-STATE-NEG");
    expect(find("T001", "2026-10-01", "TEST-STATE-NEG").item?.badge).toBe("none");
    expect(find("T001", "2026-10-01", "TEST-STATE-PEND").item?.badge).toBe("pending");
    expect(r.failed.map((f) => f.team_rule_id)).toContain("TEST-STATE-FAIL");
  });
  it("downgrades a forced 'applies' with a warning", () => {
    const warns: string[] = [];
    const w = (m: string) => warns.push(m);
    const row = (id: string) => ({ team_rule_id: id, result: "applies" as const, explanation: null, conflict_flag: false });
    const rule = (id: string) => data.rulesById.get(id)!;
    expect(resolveRow(row("TEST-STATE-NEG"), rule("TEST-STATE-NEG"), "2026-10-01", w).badge).toBe("none");
    expect(resolveRow(row("TEST-STATE-PEND"), rule("TEST-STATE-PEND"), "2026-10-01", w).badge).toBe("pending");
    expect(resolveRow(row("TEST-STATE-FAIL"), rule("TEST-STATE-FAIL"), "2026-10-01", w).badge).toBe("failed");
    expect(warns.length).toBe(3);
  });
});

describe("what's changing follows the date", () => {
  it("moves a rule to now-in-effect at a later date", () => {
    const before = resolveAddress(addr("T001"), "2026-10-01", data, silent);
    expect(before.upcoming.map((r) => r.team_rule_id)).toContain("TEST-STATE-ALG");
    const after = resolveAddress(addr("T001"), "2027-03-01", data, silent);
    expect(after.upcoming.map((r) => r.team_rule_id)).not.toContain("TEST-STATE-ALG");
    expect(after.nowInEffect.map((r) => r.team_rule_id)).toContain("TEST-STATE-ALG");
  });
  it("keeps pending bills pending at any date", () => {
    const r = resolveAddress(addr("T001"), "2027-12-31", data, silent);
    expect(r.upcoming.map((x) => x.team_rule_id)).toContain("TEST-STATE-PEND");
  });
});

describe("hideInternalNote", () => {
  it("hides 'Decided by' notes, case-insensitive and trimmed", () => {
    expect(hideInternalNote("Decided by the team")).toBeNull();
    expect(hideInternalNote("  decided BY x")).toBeNull();
  });
  it("hides notes with a (Q<digit> id", () => {
    expect(hideInternalNote("See answer (Q12) above")).toBeNull();
    expect(hideInternalNote("ref (q3")).toBeNull();
  });
  it("keeps public notes and handles empty input", () => {
    expect(hideInternalNote("Possible preemption.")).toBe("Possible preemption.");
    expect(hideInternalNote("Questions (QA team)")).toBe("Questions (QA team)");
    expect(hideInternalNote(null)).toBeNull();
    expect(hideInternalNote("   ")).toBeNull();
  });
});
