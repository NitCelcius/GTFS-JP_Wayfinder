"use client";

import { BusStopInfoPage } from "../../components/page/BusStopInfoPage/BusStopInfoPage";
import { useRouter, useParams } from "next/navigation";

export default function BusStopInfoPageRoute() {
  const router = useRouter();
  const params = useParams();
  const busStopId = typeof params?.id === "string" ? params.id : undefined;

  return (
    <BusStopInfoPage
      busStopId={busStopId}
      onBack={() => router.push("/bus-stop")}
      onNavigateToRoute={() => router.push("/")}
      onNavigateToRecent={() => router.push("/recent")}
    />
  );
}
