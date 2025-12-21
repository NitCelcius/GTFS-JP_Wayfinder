import Image from "next/image";

export function ChevronRight() {
  return (
    <Image
      src="/icons/chevron-right.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      style={{ width: "auto", height: "auto" }}
    />
  );
}
