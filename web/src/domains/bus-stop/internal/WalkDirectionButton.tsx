import styles from "./WalkDirectionButton.module.css";

interface WalkDirectionButtonProps {
  lat: number;
  lon: number;
}

function WalkIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8a2 2 0 11-4 0 2 2 0 014 0zM10 20l1.5-6L10 12V8l4-1 2 3h3M7 20l1-5-3-1"
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
    if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
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
