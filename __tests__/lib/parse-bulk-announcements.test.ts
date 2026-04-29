import { describe, it, expect } from "vitest";
import { parseBulkAnnouncements } from "@/lib/announcements/parse-bulk";

describe("parseBulkAnnouncements — paragraph mode", () => {
  it("splits blocks separated by blank lines", () => {
    const text = "Sunday Service\nJoin us at 9 AM\n\nYouth Meet\nFriday 6 PM";
    const r = parseBulkAnnouncements(text);
    expect(r.mode).toBe("paragraph");
    expect(r.items).toHaveLength(2);
    expect(r.items[0].title).toBe("Sunday Service");
    expect(r.items[0].content).toBe("Join us at 9 AM");
    expect(r.items[1].title).toBe("Youth Meet");
  });

  it("treats a line of dashes as a block separator", () => {
    const text = "A\nbody a\n---\nB\nbody b";
    const r = parseBulkAnnouncements(text);
    expect(r.items).toHaveLength(2);
    expect(r.items[1].title).toBe("B");
  });

  it("flags blocks missing a title or content", () => {
    const text = "OnlyTitle\n\nAnother\nWith content";
    const r = parseBulkAnnouncements(text);
    expect(r.items[0].errors).toContain("Content is required");
    expect(r.items[1].errors).toHaveLength(0);
  });
});

describe("parseBulkAnnouncements — tabular mode", () => {
  it("auto-detects TSV with header row", () => {
    const text = [
      "title\tcontent\tpriority\texpiry",
      "Sunday\tJoin us\t1\t2026-05-31",
      "Youth\tFriday 6 PM\t0\t",
    ].join("\n");
    const r = parseBulkAnnouncements(text);
    expect(r.mode).toBe("tabular");
    expect(r.delimiter).toBe("\t");
    expect(r.hadHeader).toBe(true);
    expect(r.items).toHaveLength(2);
    expect(r.items[0]).toMatchObject({
      title: "Sunday",
      content: "Join us",
      priority: 1,
      expiryDate: "2026-05-31",
    });
    expect(r.items[1].priority).toBe(0);
    expect(r.items[1].expiryDate).toBeUndefined();
  });

  it("falls back to positional columns when header is missing", () => {
    const text = "Sunday\tJoin us\t2\nYouth\tFriday 6 PM\t0";
    const r = parseBulkAnnouncements(text, "tabular");
    expect(r.hadHeader).toBe(false);
    expect(r.items[0]).toMatchObject({ title: "Sunday", content: "Join us", priority: 2 });
  });

  it("parses simple CSV with quoted commas", () => {
    const text = ['title,content,priority', 'Sunday,"Join us, please",1'].join("\n");
    const r = parseBulkAnnouncements(text);
    expect(r.mode).toBe("tabular");
    expect(r.delimiter).toBe(",");
    expect(r.items[0].content).toBe("Join us, please");
  });

  it("collects coercion errors instead of throwing", () => {
    const text = "title\tcontent\tpriority\nA\tok\tnot-a-number";
    const r = parseBulkAnnouncements(text);
    expect(r.items[0].errors.some((e) => e.includes("priority"))).toBe(true);
  });
});

describe("parseBulkAnnouncements — empty input", () => {
  it("returns no items for blank text", () => {
    expect(parseBulkAnnouncements("   \n\n").items).toEqual([]);
  });
});
