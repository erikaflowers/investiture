import { describe, it, expect } from "vitest";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses flat scalars, booleans, and quoted values", () => {
    const { data, body } = parseFrontmatter(
      `---\nid: BL-0001\ntitle: "Fix: the thing"\nonboarded: true\n---\n\nBody here.`
    );
    expect(data).toEqual({ id: "BL-0001", title: "Fix: the thing", onboarded: true });
    expect(body).toBe("Body here.");
  });

  it("returns data null when there is no front-matter", () => {
    expect(parseFrontmatter("# Just markdown").data).toBeNull();
    expect(parseFrontmatter("---\nnever closed").data).toBeNull();
    expect(parseFrontmatter("").data).toBeNull();
  });
});

describe("round-trip", () => {
  it("serialize → parse preserves values and key order", () => {
    const data = {
      id: "BL-0002",
      title: "Colon: and true",
      status: "queued",
      onboarded: false,
    };
    const out = serializeFrontmatter(data, "The body.\n", ["id", "title", "status"]);
    const back = parseFrontmatter(out);
    expect(back.data).toEqual(data);
    expect(back.body.trim()).toBe("The body.");
    expect(out.indexOf("id:")).toBeLessThan(out.indexOf("title:"));
  });

  it("quotes values that would misparse", () => {
    const out = serializeFrontmatter({ title: "true" }, "");
    expect(parseFrontmatter(out).data.title).toBe("true");
  });
});
