"use client";

import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col relative min-h-screen">
      <main className="flex-1 w-full flex justify-center bg-white pt-[calc(3.3125rem+var(--size-spacing-sm))] pb-[calc(var(--size-container-md)+var(--size-spacing-sm))]">
        <div className="w-full max-w-[var(--max-w-mobile)] mx-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
