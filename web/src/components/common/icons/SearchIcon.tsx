import Image from "next/image";

export function SearchIcon() {
  return (
    <Image
      src="/icons/search.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      style={{ width: "auto", height: "auto" }}
    />
  );
}
