import { Analytics } from "@vercel/analytics/next";

import React from "react";

import type { Metadata } from "next";

import "@/lib/initializeApiClient";

import AppLayout from "./App";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTFS JP Wayfinder",
  description: "A small bus route helper",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Analytics />
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
