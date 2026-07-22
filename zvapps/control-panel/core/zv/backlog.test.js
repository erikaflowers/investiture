import { describe, it, expect } from "vitest";
import {
  nextId,
  slugify,
  parseItem,
  serializeItem,
  validationError,
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
});
