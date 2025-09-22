import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results | GTFS JP Wayfinder",
  description: "View your bus route search results",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
