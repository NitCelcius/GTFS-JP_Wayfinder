import Image from "next/image";

export function TransferIcon() {
  return (
    <Image
      src="/icons/transfer.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      style={{ width: "auto", height: "auto" }}
    />
  );
}
