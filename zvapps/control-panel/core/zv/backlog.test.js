import { describe, it, expect } from "vitest";
import {
  nextId,
  slugify,
  parseItem,
  serializeItem,
  validationError,
  categorizeBacklog,
} from "./backlog.js";

describe("nextId", () => {
  it("allocates highest + 1 and never reuses", () => {
    expect(nextId([])).toBe("BL-0001");
    expect(nextId(["BL-0001", "BL-0007", "BL-0003"])).toBe("BL-0008");
    expect(nextId(["garbage", "BL-0002"])).toBe("BL-0003");
  });
});

describe("slugify", () => {
  it("kebab-cases and caps at 40 chars", () => {
    expect(slugify("Kanban: Drag & Drop!")).toBe("kanban-drag-drop");
    expect(slugify("x".repeat(60)).length).toBeLessThanOrEqual(40);
    expect(slugify("???")).toBe("item");
  });
});

describe("parse/serialize round-trip", () => {
  it("survives a full round-trip", () => {
    const md = serializeItem(
      {
        id: "BL-0004",
        title: "A thing",
        status: "queued",
        priority: "p1",
        "created-by": "agent:heavy",
        owner: "heavy",
        "created-date": "2026-07-22",
        "updated-date": "2026-07-22",
      },
      "Do the thing.\n"
    );
    const item = parseItem(md, "zvapps/backlog/BL-0004-a-thing.md");
    expect(item.id).toBe("BL-0004");
    expect(item.status).toBe("queued");
    expect(item["created-by"]).toBe("agent:heavy");
    expect(item.body.trim()).toBe("Do the thing.");
    expect(item.invalid).toBeUndefined();
  });

  it("marks files without a valid id as invalid, never hides them", () => {
    expect(parseItem("# no front-matter", "x.md")).toEqual({ path: "x.md", invalid: true });
    expect(parseItem("---\nid: nope\n---\nbody", "y.md").invalid).toBe(true);
  });
});

describe("validationError", () => {
  it("enforces enums and actor format", () => {
    expect(validationError({ status: "doing" })).toMatch(/status/);
    expect(validationError({ priority: "urgent" })).toMatch(/priority/);
    expect(validationError({ title: "x", "created-by": "heavy" }, { creating: true })).toMatch(
      /created-by/
    );
    expect(
      validationError({ title: "x", "created-by": "agent:heavy" }, { creating: true })
    ).toBeNull();
    expect(validationError({ status: "parked", priority: "p0" })).toBeNull();
  });

  it("rejects newlines and control characters in title and owner (R1 layer)", () => {
    expect(validationError({ title: "a\nb" })).toMatch(/title/);
    expect(validationError({ title: "a\n---\nstatus: done" })).toMatch(/title/);
    expect(validationError({ owner: "gh\tost" })).toMatch(/owner/);
    expect(validationError({ title: "clean title", owner: "heavy" })).toBeNull();
  });
});

describe("categorizeBacklog (Qin Finding 3 — off-enum cards never vanish)", () => {
  const valid = (id, status) => ({ id, title: id, status, path: `zvapps/backlog/${id}.md` });

  it("routes a card with an unknown status to the invalid tray, not oblivion", () => {
    const items = [
      valid("BL-0001", "queued"),
      valid("BL-0002", "wip"), // off-enum — the vanishing case
      { path: "zvapps/backlog/BL-0003.md", invalid: true },
    ];
    const { byStatus, invalid } = categorizeBacklog(items);
    expect(byStatus.queued.map((i) => i.id)).toEqual(["BL-0001"]);
    // BL-0002 is present in the tray, tagged with a reason — not dropped.
    const trayIds = invalid.map((i) => i.id ?? i.path);
    expect(trayIds).toContain("BL-0002");
    expect(invalid.find((i) => i.id === "BL-0002").reason).toMatch(/unknown status/);
    // Total accounting: every input item lands somewhere, none lost.
    const placed = Object.values(byStatus).flat().length + invalid.length;
    expect(placed).toBe(items.length);
  });

  it("keeps a repairable off-enum card distinguishable from an unparseable one", () => {
    const { invalid } = categorizeBacklog([
      valid("BL-0009", "backlog"), // valid id, bad status → repairable in place
      { path: "x.md", invalid: true }, // no id → hand-fix only
    ]);
    const offEnum = invalid.find((i) => i.id === "BL-0009");
    const unparseable = invalid.find((i) => i.path === "x.md");
    expect(offEnum.invalid).toBeFalsy(); // repairable via status write
    expect(unparseable.invalid).toBe(true);
  });
});
