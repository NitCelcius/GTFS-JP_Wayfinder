import Image from "next/image";

export function WalkIcon() {
  return (
    <Image
      src="/icons/walk.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      style={{ width: "auto", height: "auto" }}
    />
  );
}
