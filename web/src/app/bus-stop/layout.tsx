import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Stop Search | GTFS JP Wayfinder",
  description: "Search for bus stops and view schedules",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
