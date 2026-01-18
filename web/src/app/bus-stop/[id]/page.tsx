"use client";

import { useParams, useRouter } from "next/navigation";

import { BusStopInfoV2Container } from "@/domains/bus-stop";

export default function BusStopInfoPageRoute() {
  const router = useRouter();
  const params = useParams();

  // Next.js useParams() should automatically decode URL parameters,
  // but ensure we have the decoded value
  let busStopId: string | undefined;
  if (typeof params?.id === "string") {
    // Decode the parameter to ensure spaces are handled correctly
    // (in case useParams() doesn't decode it properly in some cases)
    busStopId = decodeURIComponent(params.id);
  }

  return (
    <BusStopInfoV2Container
      busStopId={busStopId}
      onBack={() => router.push("/bus-stop")}
      onNavigateToRoute={() => router.push("/")}
    />
  );
}
