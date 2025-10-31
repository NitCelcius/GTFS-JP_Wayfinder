"use client";

import React from "react";

import { ErrorBoundary } from "@/components/common";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const contactEmail = process.env.NEXT_ERROR_CONTACT_EMAIL;

  return (
    <ErrorBoundary contactEmail={contactEmail}>
      <div className="min-h-screen flex flex-col relative">
        <main className="flex-1 w-full flex justify-center bg-white">
          <div className="w-full max-w-[var(--max-w-mobile)] mx-auto relative">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
