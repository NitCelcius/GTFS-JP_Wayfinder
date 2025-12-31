/**
 * Route color generator using LCh color space.
 * Generates distinct colors based on route text - similar text gets similar colors.
 *
 * Uses weighted hash algorithm where earlier characters have more influence.
 * Base 8 provides good balance between differentiation and prefix clustering.
 */

export interface LchColor {
  l: number; // Lightness: 0-100
  c: number; // Chroma: 0-150+
  h: number; // Hue: 0-360°
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface RouteColorResult {
  lch: LchColor;
  rgb: RgbColor;
  hex: string;
  css: string;
  textColor: "white" | "black";
}

/** Result containing both light and dark mode colors */
export interface DualModeColorResult {
  light: RouteColorResult;
  dark: RouteColorResult;
}

// Color generation constants
const LIGHTNESS_LIGHT = 70; // Light mode: brighter background, dark text
const LIGHTNESS_DARK = 40; // Dark mode: darker background, light text
const LIGHTNESS_DEFAULT = 55; // Legacy default
const CHROMA = 65;
const HUE_RANGE = 360;

export type ColorMode = "light" | "dark" | "auto";

// Color space conversion constants
// CIE 1931 2° standard illuminant D65 white point (normalized so Y = 100).
const D65_WHITE = { x: 95.047, y: 100.0, z: 108.883 };
// Standard linear sRGB → XYZ conversion matrix for D65 white point.
const SRGB_MATRIX = {
  r: [3.2406, -1.5372, -0.4986],
  g: [-0.9689, 1.8758, 0.0415],
  b: [0.0557, -0.204, 1.057],
};
// 6/29 is the breakpoint used in the CIE Lab non-linear f(t) function.
const LAB_DELTA = 6 / 29;
// sRGB transfer function breakpoint between linear and gamma-encoded segments.
// See IEC 61966-2-1:2003, section 4.2 (value ≈ 0.0031308).
const SRGB_LINEAR_THRESHOLD = 0.0031308;
// Relative luminance threshold for choosing light/dark text to satisfy WCAG contrast.
// A luminance of ~0.179 gives a contrast ratio of ≥ 4.5:1 between text and background.
const WCAG_LUMINANCE_THRESHOLD = 0.179;
export const DEFAULT_HASH_BASE = 8;

// ============================================================================
// Core weighted hash color generation
// ============================================================================

/** Get lightness value for color mode */
function getLightness(mode: ColorMode): number {
  switch (mode) {
    case "light":
      return LIGHTNESS_LIGHT;
    case "dark":
      return LIGHTNESS_DARK;
    default:
      return LIGHTNESS_DEFAULT;
  }
}

/**
 * Compute a weighted hash from text where earlier characters have more influence.
 *
 * Algorithm:
 * - For each character at position i, compute: (charCode % base) * (1 / base^(i+1))
 * - Sum all contributions to get a value in range [0, 1)
 *
 * Example with base=8, text="12":
 * - char '1' (code 49): (49 % 8) / 8 = 1/8 = 0.125
 * - char '2' (code 50): (50 % 8) / 64 = 2/64 = 0.031
 * - Total: 0.156
 *
 * @param text - Input string (any characters including Japanese)
 * @param base - Decay base (default 8). Higher = steeper decay. Must be positive.
 * @returns Hash value in range [0, 1)
 * @throws Error if base is not positive
 */
export function weightedTextHash(
  text: string,
  base: number = DEFAULT_HASH_BASE
): number {
  if (base <= 0) {
    throw new Error("base must be positive");
  }

  if (!text || text.length === 0) {
    return 0;
  }

  let hash = 0;
  let divisor = base;
  const maxDivisor = Number.MAX_SAFE_INTEGER / base;

  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    const value = codePoint % base;
    hash += value / divisor;

    // Stop increasing divisor once it would exceed Number.MAX_SAFE_INTEGER.
    if (divisor > maxDivisor) {
      break;
    }
    divisor *= base;
  }

  return hash;
}

// ============================================================================
// Color space conversion (LCh → Lab → XYZ → RGB)
// ============================================================================

/** LCh → Lab (polar to cartesian) */
function lchToLab(lch: LchColor) {
  const hRad = (lch.h * Math.PI) / 180;
  return {
    l: lch.l,
    a: lch.c * Math.cos(hRad),
    b: lch.c * Math.sin(hRad),
  };
}

/** Lab → XYZ (D65 illuminant) */
function labToXyz(lab: { l: number; a: number; b: number }) {
  const fy = (lab.l + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;

  const fToRatio = (f: number) =>
    f > LAB_DELTA ? f ** 3 : (f - 16 / 116) * 3 * LAB_DELTA ** 2;

  return {
    x: fToRatio(fx) * D65_WHITE.x,
    y: (lab.l > 8 ? ((lab.l + 16) / 116) ** 3 : lab.l / 903.3) * D65_WHITE.y,
    z: fToRatio(fz) * D65_WHITE.z,
  };
}

/** XYZ → linear RGB (sRGB matrix) */
function xyzToLinearRgb(xyz: { x: number; y: number; z: number }) {
  const [x, y, z] = [xyz.x / 100, xyz.y / 100, xyz.z / 100];
  return {
    r: SRGB_MATRIX.r[0] * x + SRGB_MATRIX.r[1] * y + SRGB_MATRIX.r[2] * z,
    g: SRGB_MATRIX.g[0] * x + SRGB_MATRIX.g[1] * y + SRGB_MATRIX.g[2] * z,
    b: SRGB_MATRIX.b[0] * x + SRGB_MATRIX.b[1] * y + SRGB_MATRIX.b[2] * z,
  };
}

/** Linear → sRGB gamma correction */
function linearToSrgb(v: number): number {
  return v <= SRGB_LINEAR_THRESHOLD
    ? v * 12.92
    : 1.055 * v ** (1 / 2.4) - 0.055;
}

/** Clamp value to [min, max] */
function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** LCh → RGB */
export function lchToRgb(lch: LchColor): RgbColor {
  const linear = xyzToLinearRgb(labToXyz(lchToLab(lch)));
  return {
    r: Math.round(clamp(linearToSrgb(linear.r), 0, 1) * 255),
    g: Math.round(clamp(linearToSrgb(linear.g), 0, 1) * 255),
    b: Math.round(clamp(linearToSrgb(linear.b), 0, 1) * 255),
  };
}

// ============================================================================
// RGB utilities
// ============================================================================

/** RGB → hex string */
function rgbToHex(rgb: RgbColor): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`;
}

/** RGB → css rgb() string */
function rgbToCss(rgb: RgbColor): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/** Calculate relative luminance (WCAG) */
function getRelativeLuminance(rgb: RgbColor): number {
  const toLinear = (v: number) => {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(rgb.r) +
    0.7152 * toLinear(rgb.g) +
    0.0722 * toLinear(rgb.b)
  );
}

/** Get contrasting text color */
function getTextColor(rgb: RgbColor): "white" | "black" {
  return getRelativeLuminance(rgb) > WCAG_LUMINANCE_THRESHOLD
    ? "black"
    : "white";
}

/** Build RouteColorResult from LCh */
function buildColorResult(lch: LchColor): RouteColorResult {
  const rgb = lchToRgb(lch);
  return {
    lch,
    rgb,
    hex: rgbToHex(rgb),
    css: rgbToCss(rgb),
    textColor: getTextColor(rgb),
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Convert text to LCh color using weighted hash algorithm.
 *
 * @param text - Input string (route_id, route_short_name, etc.)
 * @param mode - Color mode for lightness
 * @param base - Hash base (default 8). Try 4-16 for different clustering
 */
export function textToLch(
  text: string,
  mode: ColorMode = "auto",
  base: number = DEFAULT_HASH_BASE
): LchColor {
  const lightness = getLightness(mode);

  if (!text || text.length === 0) {
    return { l: lightness, c: 0, h: 0 };
  }

  const hash = weightedTextHash(text, base);
  const hue = hash * HUE_RANGE;

  return {
    l: lightness,
    c: CHROMA,
    h: hue,
  };
}

/**
 * Generate complete color from text using weighted hash.
 *
 * @param text - Input string (route_id, route_short_name, etc.)
 * @param mode - Color mode: "light" (L=70), "dark" (L=40), or "auto" (L=55)
 * @param base - Hash base (default 8)
 */
export function textToColor(
  text: string,
  mode: ColorMode = "auto",
  base: number = DEFAULT_HASH_BASE
): RouteColorResult {
  return buildColorResult(textToLch(text, mode, base));
}

/**
 * Generate both light and dark mode colors from text.
 *
 * @param text - Input string (route_id, route_short_name, etc.)
 * @param base - Hash base (default 8)
 */
export function textToDualColor(
  text: string,
  base: number = DEFAULT_HASH_BASE
): DualModeColorResult {
  return {
    light: textToColor(text, "light", base),
    dark: textToColor(text, "dark", base),
  };
}
