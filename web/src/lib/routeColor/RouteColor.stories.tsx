import type { Meta, StoryObj } from "@storybook/react";

import {
  type ColorMode,
  DEFAULT_HASH_BASE,
  type RouteColorResult,
  textToColor,
  textToDualColor,
  weightedTextHash,
} from "./colorGenerator";

const MUTED_TEXT = "var(--muted-foreground)";

// Sample routes from different GTFS datasets for comparison
const TOKACHI_ROUTES = [
  "1 循環線_A",
  "2 循環線_B",
  "3 南商線_A",
  "6 東8条線_A",
  "7 水光線_A",
  "10 幕別線_A",
  "21 南商あかしや線_A",
  "31 芽室線_A",
  "32 清水帯広線_A",
  "36 新町線_A",
  "41 音更線_A",
  "45 十勝川温泉線_A",
  "45 十勝川温泉線(4501)",
  "49 上士幌線_A",
  "51 ぬかびら線_A",
  "60 広尾線_A",
  "61 大正小学校線(6100)",
  "70 大空団地線_A",
  "70 大空団地線(7004)",
  "72 大空団地（白樺通経由線）(7200)",
  "73 自衛隊稲田線_A",
];

const TOEI_ROUTES = [
  "2",
  "3",
  "6",
  "8",
  "10",
  "波０１（ＮＭ０１）",
  "市０１",
  "都０１（Ｔ０１）",
  "都０２",
  "都０２乙",
  "都０３",
  "都０４",
  "錦１１",
  "錦１３",
  "錦２５",
  "錦２７",
  "錦２７－２",
  "錦２７－３",
  "梅７０",
  "梅７４甲",
  "梅７４乙",
  "梅７７甲",
  "梅７７乙",
];

// Real route_ids from Akita Chuo Kotsu GTFS data (routes.txt) - 20 routes
const AKITA_ROUTES = [
  "五城目線_A",
  "追分線_A",
  "泉八橋環状線_A",
  "新国道・土崎線_A",
  "セリオン線_A",
  "寺内経由土崎線_A",
  "手形山経由大学病院線_A",
  "国際教養大学線_A",
  "中央交通線_A",
  "松崎団地線_A",
  "牛島経由御野場団地線_A",
  "広面御所野線_A",
  "将軍野線_A",
  "柳原経由御野場団地線_A",
  "桜ガ丘線(42401)",
  "桜ガ丘線(42402)",
  "秋田高校線_A",
  "大住・みなみ野団地線_A",
  "太平線(30201)",
  "南ヶ丘線_A",
];

const meta: Meta = {
  title: "Lib/RouteColor",
  parameters: {
    layout: "padded",
    // Disable Chromatic snapshots - this is a utility library visualization, not UI to test
    chromatic: { disableSnapshot: true },
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Helper Components
// ============================================================================

interface ColorChipProps {
  text: string;
  color: RouteColorResult;
  showDetails?: boolean;
}

function ColorChip({ text, color, showDetails = false }: ColorChipProps) {
  return (
    <div
      style={{
        backgroundColor: color.hex,
        color: color.textColor,
        padding: "10px 14px",
        borderRadius: "8px",
        minWidth: "80px",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "2px" }}>
        {text}
      </div>
      {showDetails && (
        <div style={{ fontSize: "9px", opacity: 0.8 }}>
          <div>H: {color.lch.h.toFixed(1)}°</div>
          <div>{color.hex}</div>
        </div>
      )}
    </div>
  );
}

interface DualColorChipProps {
  text: string;
  base?: number;
}

function DualColorChip({ text, base = DEFAULT_HASH_BASE }: DualColorChipProps) {
  const dual = textToDualColor(text, base);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      <ColorChip text={text} color={dual.light} />
      <ColorChip text={text} color={dual.dark} />
    </div>
  );
}

interface WeightedHashChipProps {
  text: string;
  base: number;
  mode?: ColorMode;
  showDetails?: boolean;
}

function WeightedHashChip({
  text,
  base,
  mode = "auto",
  showDetails = true,
}: WeightedHashChipProps) {
  const color = textToColor(text, mode, base);
  const hash = weightedTextHash(text, base);
  return (
    <div
      style={{
        backgroundColor: color.hex,
        color: color.textColor,
        padding: "10px 14px",
        borderRadius: "8px",
        minWidth: "100px",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "4px" }}>
        {text}
      </div>
      {showDetails && (
        <div style={{ fontSize: "9px", opacity: 0.8 }}>
          <div>hash: {hash.toFixed(4)}</div>
          <div>hue: {color.lch.h.toFixed(1)}°</div>
        </div>
      )}
    </div>
  );
}

interface BaseComparisonRowProps {
  title: string;
  texts: string[];
  bases: number[];
}

function BaseComparisonRow({ title, texts, bases }: BaseComparisonRowProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: MUTED_TEXT }}>
        {title}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {bases.map((base) => (
          <div key={base}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "6px",
                color: MUTED_TEXT,
              }}
            >
              Base {base}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {texts.map((text) => (
                <WeightedHashChip key={text} text={text} base={base} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LightDarkComparisonRowProps {
  title: string;
  texts: string[];
  base?: number;
}

function LightDarkComparisonRow({
  title,
  texts,
  base = DEFAULT_HASH_BASE,
}: LightDarkComparisonRowProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: MUTED_TEXT }}>
        {title}
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "8px",
              color: MUTED_TEXT,
            }}
          >
            Light Mode (L=70)
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              padding: "16px",
              backgroundColor: "var(--background, white)",
              borderRadius: "8px",
            }}
          >
            {texts.map((text) => (
              <WeightedHashChip
                key={text}
                text={text}
                base={base}
                mode="light"
              />
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "8px",
              color: MUTED_TEXT,
            }}
          >
            Dark Mode (L=40)
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              padding: "16px",
              backgroundColor: "var(--background-dark, #1a1a1a)",
              borderRadius: "8px",
            }}
          >
            {texts.map((text) => (
              <WeightedHashChip
                key={text}
                text={text}
                base={base}
                mode="dark"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stories: Base Comparison
// ============================================================================

export const BaseComparison: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Weighted Hash: Base Value Comparison</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "24px" }}>
        Compare how different base values affect color clustering.
        <br />
        Lower base = more characters contribute → better differentiation
        <br />
        Higher base = earlier characters dominate → stronger prefix clustering
        <br />
        <strong>Default: Base 8</strong>
      </p>

      <BaseComparisonRow
        title="Single digits (worst case for similarity)"
        texts={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        bases={[4, 5, 6, 7, 8, 16]}
      />

      <BaseComparisonRow
        title="Toei-style numeric route IDs"
        texts={["2", "3", "6", "8", "10", "14", "15", "17", "18", "19", "20"]}
        bases={[4, 5, 6, 7, 8, 16]}
      />

      <BaseComparisonRow
        title="Tokachi-style (number + name)"
        texts={[
          "1 循環線_A",
          "2 循環線_B",
          "3 南商線_A",
          "6 東8条線_A",
          "7 水光線_A",
        ]}
        bases={[4, 5, 6, 7, 8, 16]}
      />

      <BaseComparisonRow
        title="Similar prefixes (should cluster)"
        texts={[
          "70 大空団地線_A",
          "70 大空団地線(7004)",
          "72 大空団地（白樺通経由線）(7200)",
          "73 自衛隊稲田線_A",
        ]}
        bases={[4, 5, 6, 7, 8, 16]}
      />

      <BaseComparisonRow
        title="Akita Chuo Kotsu style (Japanese name + suffix)"
        texts={AKITA_ROUTES.slice(0, 10)}
        bases={[4, 5, 6, 7, 8, 16]}
      />
    </div>
  ),
};

// ============================================================================
// Stories: Light/Dark Mode Comparison
// ============================================================================

export const LightDarkComparison: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Light/Dark Mode Comparison</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "24px" }}>
        Same hue, different lightness for light/dark mode support.
        <br />
        Light mode: L=70 (brighter, dark text)
        <br />
        Dark mode: L=40 (darker, light text)
      </p>

      <LightDarkComparisonRow
        title="Tokachi Bus Routes"
        texts={TOKACHI_ROUTES.slice(0, 8)}
      />

      <LightDarkComparisonRow
        title="Toei Bus Routes"
        texts={TOEI_ROUTES.slice(0, 8)}
      />

      <LightDarkComparisonRow
        title="Akita Chuo Kotsu Routes"
        texts={AKITA_ROUTES.slice(0, 8)}
      />
    </div>
  ),
};

export const LightDarkSideBySide: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Light/Dark Side by Side</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "24px" }}>
        Each route shown with light (left) and dark (right) variant.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {[...TOKACHI_ROUTES.slice(0, 6), ...AKITA_ROUTES.slice(0, 6)].map(
          (text) => (
            <DualColorChip key={text} text={text} />
          )
        )}
      </div>
    </div>
  ),
};

// ============================================================================
// Stories: Dataset-specific
// ============================================================================

export const ToeiRoutes: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Toei Bus Routes</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "16px" }}>
        Testing with Tokyo Toei Bus route naming patterns
      </p>

      <BaseComparisonRow
        title="都 (Miyako) series variants"
        texts={[
          "都０１",
          "都０２",
          "都０２乙",
          "都０３",
          "都０４",
          "都０５－１",
          "都０５－２",
        ]}
        bases={[8]}
      />

      <BaseComparisonRow
        title="錦 (Nishiki) series variants"
        texts={[
          "錦１１",
          "錦１３",
          "錦２５",
          "錦２７",
          "錦２７－２",
          "錦２７－３",
          "錦２８",
        ]}
        bases={[8]}
      />

      <BaseComparisonRow
        title="梅 (Ume) series variants"
        texts={[
          "梅０１",
          "梅７０",
          "梅７４甲",
          "梅７４乙",
          "梅７７甲",
          "梅７７乙",
          "梅７７丙",
        ]}
        bases={[8]}
      />

      <BaseComparisonRow
        title="Mixed first characters (should be different)"
        texts={[
          "波０１",
          "市０１",
          "都０１",
          "錦１１",
          "梅７０",
          "草３９",
          "王４０",
        ]}
        bases={[8]}
      />
    </div>
  ),
};

export const TokachiBus: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Tokachi Bus Routes</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "16px" }}>
        Testing with Tokachi Bus route naming patterns (number prefix style)
      </p>

      <BaseComparisonRow
        title="All Tokachi routes"
        texts={TOKACHI_ROUTES}
        bases={[8]}
      />

      <BaseComparisonRow
        title="循環線 variants (should be similar)"
        texts={["1 循環線_A", "2 循環線_B"]}
        bases={[4, 8, 16]}
      />

      <BaseComparisonRow
        title="十勝川温泉線 variants (should be similar)"
        texts={["45 十勝川温泉線_A", "45 十勝川温泉線(4501)"]}
        bases={[4, 8, 16]}
      />

      <BaseComparisonRow
        title="大空団地線 variants (should cluster)"
        texts={[
          "70 大空団地線_A",
          "70 大空団地線(7004)",
          "72 大空団地（白樺通経由線）(7200)",
        ]}
        bases={[4, 8, 16]}
      />
    </div>
  ),
};

export const AkitaRoutes: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>Akita Chuo Kotsu Routes</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "16px" }}>
        Testing with Akita Chuo Kotsu route naming patterns (Japanese name
        style)
      </p>

      <BaseComparisonRow
        title="桜ガ丘線 variants (should be very similar)"
        texts={[
          "桜ガ丘線(42401)",
          "桜ガ丘線(42402)",
          "桜ガ丘線(42201)",
          "桜ガ丘線(42202)",
        ]}
        bases={[4, 8, 16]}
      />

      <BaseComparisonRow
        title="新屋 prefix routes (should be somewhat similar)"
        texts={["新屋線_A", "新屋高校線_A", "新屋西線_A"]}
        bases={[4, 8, 16]}
      />

      <BaseComparisonRow
        title="経由 (via) routes"
        texts={[
          "寺内経由土崎線_A",
          "牛島経由御野場団地線_A",
          "柳原経由御野場団地線_A",
          "手形山経由大学病院線_A",
        ]}
        bases={[4, 8, 16]}
      />

      <BaseComparisonRow
        title="Different first characters (should be different)"
        texts={[
          "五城目線_A",
          "追分線_A",
          "泉八橋環状線_A",
          "新国道・土崎線_A",
          "セリオン線_A",
        ]}
        bases={[8]}
      />
    </div>
  ),
};

// ============================================================================
// Stories: All Routes Overview
// ============================================================================

export const AllRoutes: Story = {
  render: () => (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2>All Sample Routes - Full Overview</h2>
      <p style={{ color: MUTED_TEXT, marginBottom: "24px" }}>
        Complete visualization of all sample routes with Base 8 (default)
      </p>

      <BaseComparisonRow
        title="Tokachi Bus Routes (21 routes)"
        texts={TOKACHI_ROUTES}
        bases={[8]}
      />

      <BaseComparisonRow
        title="Toei Bus Routes (23 routes)"
        texts={TOEI_ROUTES}
        bases={[8]}
      />

      <BaseComparisonRow
        title="Akita Chuo Kotsu Routes (20 routes)"
        texts={AKITA_ROUTES}
        bases={[8]}
      />
    </div>
  ),
};
