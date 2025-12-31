import {
  DEFAULT_HASH_BASE,
  lchToRgb,
  textToColor,
  textToDualColor,
  textToLch,
  weightedTextHash,
} from "../colorGenerator";

describe("weightedTextHash", () => {
  it("should return 0 for empty string", () => {
    expect(weightedTextHash("")).toBe(0);
  });

  it("should return value in [0, 1) range", () => {
    const testCases = ["1", "123", "abc", "五城目線_A", "桜ガ丘線(42401)"];
    testCases.forEach((text) => {
      const hash = weightedTextHash(text);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThan(1);
    });
  });

  it("should produce same hash for same input", () => {
    expect(weightedTextHash("五城目線_A")).toBe(weightedTextHash("五城目線_A"));
    expect(weightedTextHash("桜ガ丘線(42401)")).toBe(
      weightedTextHash("桜ガ丘線(42401)")
    );
  });

  it("should produce different hashes for different inputs", () => {
    expect(weightedTextHash("五城目線_A")).not.toBe(
      weightedTextHash("追分線_A")
    );
  });

  it("should produce similar hashes for similar prefixes", () => {
    const hash1 = weightedTextHash("桜ガ丘線(42401)");
    const hash2 = weightedTextHash("桜ガ丘線(42402)");
    // Same prefix should produce similar hashes
    expect(Math.abs(hash1 - hash2)).toBeLessThan(0.1);
  });

  it("should produce different hashes for different first characters", () => {
    const hash1 = weightedTextHash("五城目線_A");
    const hash2 = weightedTextHash("追分線_A");
    // Different first chars should produce noticeably different hashes
    expect(Math.abs(hash1 - hash2)).toBeGreaterThan(0.01);
  });

  it("should respect base parameter", () => {
    const base4 = weightedTextHash("test", 4);
    const base8 = weightedTextHash("test", 8);
    const base16 = weightedTextHash("test", 16);
    // Different bases produce different hashes
    expect(base4).not.toBe(base8);
    expect(base8).not.toBe(base16);
  });

  it("should throw error for zero base", () => {
    expect(() => weightedTextHash("test", 0)).toThrow("base must be positive");
  });

  it("should throw error for negative base", () => {
    expect(() => weightedTextHash("test", -5)).toThrow("base must be positive");
  });

  it("should handle very long strings without overflow", () => {
    // 100 character string should not cause overflow
    const longText = "あ".repeat(100);
    const hash = weightedTextHash(longText);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThan(1);
    expect(Number.isFinite(hash)).toBe(true);
  });
});

describe("textToLch", () => {
  it("should return gray for empty string", () => {
    const lch = textToLch("");
    expect(lch.c).toBe(0);
    expect(lch.h).toBe(0);
  });

  it("should return correct lightness for each mode", () => {
    expect(textToLch("test", "light").l).toBe(70);
    expect(textToLch("test", "dark").l).toBe(40);
    expect(textToLch("test", "auto").l).toBe(55);
  });

  it("should have consistent chroma", () => {
    const lch = textToLch("五城目線_A");
    expect(lch.c).toBe(65);
  });

  it("should produce hue in valid range", () => {
    const testCases = ["1", "abc", "五城目線_A", "桜ガ丘線(42401)"];
    testCases.forEach((text) => {
      const lch = textToLch(text);
      expect(lch.h).toBeGreaterThanOrEqual(0);
      expect(lch.h).toBeLessThan(360);
    });
  });

  it("should produce similar hues for routes with same prefix", () => {
    const lch1 = textToLch("桜ガ丘線(42401)");
    const lch2 = textToLch("桜ガ丘線(42402)");
    const hueDiff = Math.abs(lch1.h - lch2.h);
    // Allow for wrap-around at 360
    const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
    expect(normalizedDiff).toBeLessThan(30); // Within 30 degrees
  });

  it("should produce different hues for different first characters", () => {
    const lch1 = textToLch("五城目線_A");
    const lch2 = textToLch("追分線_A");
    const hueDiff = Math.abs(lch1.h - lch2.h);
    const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
    expect(normalizedDiff).toBeGreaterThan(5);
  });
});

describe("textToColor", () => {
  it("should return complete color information", () => {
    const color = textToColor("五城目線_A");
    expect(color).toHaveProperty("lch");
    expect(color).toHaveProperty("rgb");
    expect(color).toHaveProperty("hex");
    expect(color).toHaveProperty("css");
    expect(color).toHaveProperty("textColor");
  });

  it("should produce consistent results for same input", () => {
    const color1 = textToColor("桜ガ丘線(42401)");
    const color2 = textToColor("桜ガ丘線(42401)");
    expect(color1.hex).toBe(color2.hex);
    expect(color1.lch).toEqual(color2.lch);
  });

  it("should return valid hex color", () => {
    const color = textToColor("五城目線_A");
    expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("should return valid CSS rgb string", () => {
    const color = textToColor("五城目線_A");
    expect(color.css).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it("should return appropriate text color for contrast", () => {
    const lightColor = textToColor("test", "light");
    const darkColor = textToColor("test", "dark");
    expect(lightColor.textColor).toBe("black"); // Light bg needs dark text
    expect(darkColor.textColor).toBe("white"); // Dark bg needs light text
  });
});

describe("textToDualColor", () => {
  it("should return both light and dark variants", () => {
    const dual = textToDualColor("五城目線_A");
    expect(dual).toHaveProperty("light");
    expect(dual).toHaveProperty("dark");
    expect(dual.light.lch.l).toBe(70);
    expect(dual.dark.lch.l).toBe(40);
  });

  it("should have same hue for light and dark", () => {
    const dual = textToDualColor("五城目線_A");
    expect(dual.light.lch.h).toBe(dual.dark.lch.h);
  });
});

describe("lchToRgb", () => {
  it("should return valid RGB values (0-255)", () => {
    const rgb = lchToRgb({ l: 70, c: 65, h: 180 });
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.g).toBeLessThanOrEqual(255);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });

  it("should return gray for zero chroma", () => {
    const rgb = lchToRgb({ l: 50, c: 0, h: 0 });
    // With zero chroma, R, G, B should be equal (gray)
    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });
});

describe("DEFAULT_HASH_BASE", () => {
  it("should be 8", () => {
    expect(DEFAULT_HASH_BASE).toBe(8);
  });
});

describe("real GTFS route examples", () => {
  it("should handle Akita Chuo Kotsu routes", () => {
    const routes = [
      "五城目線_A",
      "追分線_A",
      "泉八橋環状線_A",
      "桜ガ丘線(42401)",
      "桜ガ丘線(42402)",
    ];
    routes.forEach((route) => {
      const color = textToColor(route);
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("should handle Toei Bus routes", () => {
    const routes = ["都０１", "都０２", "錦１１", "梅７０"];
    routes.forEach((route) => {
      const color = textToColor(route);
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("should handle Tokachi Bus routes", () => {
    const routes = ["1 循環線_A", "45 十勝川温泉線_A", "70 大空団地線_A"];
    routes.forEach((route) => {
      const color = textToColor(route);
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("should cluster similar routes", () => {
    // 桜ガ丘線 variants should have similar colors
    const h1 = textToLch("桜ガ丘線(42401)").h;
    const h2 = textToLch("桜ガ丘線(42402)").h;
    const h3 = textToLch("桜ガ丘線(42201)").h;
    const h4 = textToLch("桜ガ丘線(42202)").h;

    const hues = [h1, h2, h3, h4];
    const maxHue = Math.max(...hues);
    const minHue = Math.min(...hues);
    const spread = maxHue - minHue;

    expect(spread).toBeLessThan(30); // All within 30 degrees
  });

  it("should differentiate routes with different first characters", () => {
    const h1 = textToLch("五城目線_A").h;
    const h2 = textToLch("追分線_A").h;
    const h3 = textToLch("セリオン線_A").h;

    // Should be noticeably different (not clustering)
    const diff12 = Math.abs(h1 - h2);
    const diff23 = Math.abs(h2 - h3);
    const diff13 = Math.abs(h1 - h3);

    // At least one pair should be >20 degrees apart
    expect(Math.max(diff12, diff23, diff13)).toBeGreaterThan(20);
  });
});
