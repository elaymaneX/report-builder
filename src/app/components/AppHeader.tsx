"use client";

import { ThemeToggle } from "@/app/components/ThemeToggle";
import { mappaBrand } from "@/lib/branding/mappa";

export function AppHeader() {
  return (
    <header className="app-header shrink-0 border-b px-5 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="app-muted text-[10px] font-semibold uppercase tracking-[0.2em]">
            {mappaBrand.name}
          </p>
          <h1 className="mappa-gradient-text mt-0.5 text-xl font-bold sm:text-2xl">
            {mappaBrand.productName}
          </h1>
          <p className="app-muted mt-2 max-w-2xl text-xs sm:text-sm">
            Upload PCF data, configure your report, or describe changes in the AI
            editor — then generate your ISO 14067 PDF.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ThemeToggle />
          <div className="hidden w-20 sm:block">
            <div className="mappa-gradient-bar" />
          </div>
        </div>
      </div>
    </header>
  );
}
