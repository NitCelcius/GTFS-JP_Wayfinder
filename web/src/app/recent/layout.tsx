import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Searches | GTFS JP Wayfinder",
  description: "View your recent route and bus stop searches",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
