import Image from "next/image";

export function MapIcon() {
  return (
    <Image
      src="/icons/map.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      style={{ width: "auto", height: "auto" }}
    />
  );
}
