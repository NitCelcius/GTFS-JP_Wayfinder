import svgPaths from "../../../imports/svg-uqfc70duf5";
import styles from "./MapSearchIcon.module.css";

export function MapSearchIcon() {
  return (
    <div className={styles.icon} data-name="map_search">
      <svg
        className={styles.svg}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 40"
      >
        <g id="map_search">
          <mask
            height="40"
            id="mask0_1_333"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
            width="40"
            x="0"
            y="0"
          >
            <rect
              fill="var(--fill-0, #D9D9D9)"
              height="40"
              id="Bounding box"
              width="40"
            />
          </mask>
          <g mask="url(#mask0_1_333)">
            <path
              d={svgPaths.p2c2bfc00}
              fill="var(--fill-0, #1C1B1F)"
              id="map_search_2"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
