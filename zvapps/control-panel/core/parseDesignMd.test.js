import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseDesignMd } from "./parseDesignMd.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presetsDir = join(__dirname, "..", "presets");

function loadPreset(slug) {
  return readFileSync(join(presetsDir, `${slug}.md`), "utf-8");
}

describe("parseDesignMd — null and edge cases", () => {
  it("returns null for empty input", () => {
    expect(parseDesignMd("")).toBeNull();
    expect(parseDesignMd(null)).toBeNull();
    expect(parseDesignMd(undefined)).toBeNull();
  });

  it("returns a structure for minimal input", () => {
    const result = parseDesignMd("# My System\n\n## 1. Visual Theme & Atmosphere\n\nA quiet system.");
    expect(result).not.toBeNull();
    expect(result.title).toBe("My System");
    expect(result.visualTheme.prose).toContain("A quiet system");
    expect(result.colors.all).toEqual([]);
    expect(result.doDont.do).toEqual([]);
  });
});

describe("parseDesignMd — Stripe fixture", () => {
  let parsed;
  beforeAll(() => {
    parsed = parseDesignMd(loadPreset("stripe"));
  });

  it("extracts the title", () => {
    expect(parsed.title).toBe("Design System Inspired by Stripe");
  });

  it("extracts the visual theme prose", () => {
    expect(parsed.visualTheme.prose.length).toBeGreaterThan(200);
    expect(parsed.visualTheme.prose).toContain("Stripe");
  });

  it("extracts at least 5 key characteristics", () => {
    expect(parsed.visualTheme.keyCharacteristics.length).toBeGreaterThanOrEqual(5);
  });

  it("extracts at least 10 colors", () => {
    expect(parsed.colors.all.length).toBeGreaterThanOrEqual(10);
  });

  it("color entries have name, value, role", () => {
    const purple = parsed.colors.all.find((c) => c.name === "Stripe Purple");
    expect(purple).toBeDefined();
    expect(purple.value).toBe("#533afd");
    expect(purple.role).toMatch(/Primary brand color/);
  });

  it("groups colors into named subcategories", () => {
    const groupNames = parsed.colors.groups.map((g) => g.name);
    expect(groupNames).toContain("Primary");
    expect(groupNames.some((n) => /Accent/i.test(n))).toBe(true);
  });

  it("extracts typography fonts", () => {
    expect(parsed.typography.fonts.primary).toMatch(/sohne-var/i);
  });

  it("extracts the typography hierarchy table", () => {
    expect(parsed.typography.hierarchy.length).toBeGreaterThanOrEqual(5);
    const display = parsed.typography.hierarchy[0];
    expect(display).toBeDefined();
    expect(Object.keys(display).length).toBeGreaterThan(3);
  });

  it("extracts at least 1 component group with variants", () => {
    expect(parsed.components.groups.length).toBeGreaterThanOrEqual(1);
    const buttons = parsed.components.groups.find((g) => /button/i.test(g.name));
    expect(buttons).toBeDefined();
    expect(buttons.variants.length).toBeGreaterThanOrEqual(1);
    expect(buttons.variants[0].specs).toHaveProperty("Background");
  });

  it("extracts do and don't lists", () => {
    expect(parsed.doDont.do.length).toBeGreaterThanOrEqual(3);
    expect(parsed.doDont.dont.length).toBeGreaterThanOrEqual(3);
  });
});

describe("parseDesignMd — handles all 9 presets without throwing", () => {
  const presets = ["stripe", "linear", "notion", "vercel", "apple", "claude", "figma", "spotify", "supabase"];

  for (const slug of presets) {
    it(`parses ${slug}`, () => {
      const md = loadPreset(slug);
      const parsed = parseDesignMd(md);
      expect(parsed).not.toBeNull();
      expect(parsed.title).toMatch(/Design System/i);
      expect(parsed.colors.all.length).toBeGreaterThan(0);
    });
  }
});
