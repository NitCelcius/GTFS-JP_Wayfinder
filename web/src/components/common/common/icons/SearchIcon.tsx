import svgPaths from "../../../imports/svg-uqfc70duf5";
import styles from "./SearchIcon.module.css";

export function SearchIcon() {
  return (
    <div className={styles.icon} data-name="Icon">
      <svg
        className={styles.svg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 44 44"
      >
        <g id="Icon">
          <mask
            height="44"
            id="mask0_1_323"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
            width="44"
            x="0"
            y="0"
          >
            <rect
              fill="var(--fill-0, #D9D9D9)"
              height="44"
              id="Bounding box"
              width="44"
            />
          </mask>
          <g mask="url(#mask0_1_323)">
            <path
              d={svgPaths.p2f1d7300}
              fill="var(--fill-0, #1C1B1F)"
              id="search"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
