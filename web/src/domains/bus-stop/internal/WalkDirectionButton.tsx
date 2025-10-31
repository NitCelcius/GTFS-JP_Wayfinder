import styles from "./WalkDirectionButton.module.css";

interface WalkDirectionButtonProps {
  lat: number;
  lon: number;
}

function WalkIcon() {
  return (
    <svg
      className="block size-full"
      fill="currentColor"
      viewBox="0 -960 960 960"
      width="24px"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m280-40 112-564-72 28v136h-80v-188l202-86q14-6 29.5-7t29.5 4q14 5 26.5 14t20.5 23l40 64q26 42 70.5 69T760-520v80q-70 0-125-29t-94-74l-25 123 84 80v300h-80v-260l-84-64-72 324h-84Zm260-700q-33 0-56.5-23.5T460-820q0-33 23.5-56.5T540-900q33 0 56.5 23.5T620-820q0 33-23.5 56.5T540-740Z"
      />
    </svg>
  );
}

/**
 * Button that opens Google Maps (or default map app) with walking directions
 * to the specified coordinates.
 */
export function WalkDirectionButton({ lat, lon }: WalkDirectionButtonProps) {
  const handleClick = () => {
    // Validate coordinates are within valid geographic ranges
    if (
      !isFinite(lat) ||
      !isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      console.error("Invalid coordinates:", { lat, lon });
      return;
    }

    // Google Maps URL with walking directions from current location
    // On mobile devices, this will typically open the native maps app
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button className={styles.button} onClick={handleClick}>
      <div className={styles.icon}>
        <WalkIcon />
      </div>
      <span className={styles.text}>徒歩で行く</span>
    </button>
  );
}
