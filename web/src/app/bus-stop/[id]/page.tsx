"use client";

import { useParams, useRouter } from "next/navigation";

import { BusStopInfoV2Container } from "@/domains/bus-stop";

export default function BusStopInfoPageRoute() {
  const router = useRouter();
  const params = useParams();
  const busStopId = typeof params?.id === "string" ? params.id : undefined;

  return (
    <BusStopInfoV2Container
      busStopId={busStopId}
      onBack={() => router.push("/bus-stop")}
      onNavigateToRoute={() => router.push("/")}
    />
  );
}
