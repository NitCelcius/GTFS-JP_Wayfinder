"use client";

import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 w-full flex justify-center bg-white">
        <div className="w-full max-w-[var(--max-w-mobile)] mx-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
