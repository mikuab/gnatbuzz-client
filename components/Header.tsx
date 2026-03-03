"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Filter from "./Filter";
import type { Category } from "@/lib/games";

type HeaderProps = {
  categories: Category[];
};

export default function Header({ categories }: HeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (value: string) => {
    const query = value.trim();
    if (!query) return;

    const params = new URLSearchParams({ q: query });
    router.push(`/browse?${params.toString()}`);
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[var(--color-primary-light)] backdrop-blur">
        <div className="mx-auto flex items-center gap-4 px-4 py-3">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-[var(--color-primary)]"
          >
            GnatBuzz
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 justify-center md:flex">
            <div className="relative w-full max-w-xl">
              <input
                type="search"
                placeholder="Search games or categories"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const target = event.target as HTMLInputElement;
                    handleSearchSubmit(target.value);
                  }
                }}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                <span className="iconfont icon-Search" />
              </span>
            </div>
          </div>

          {/* Mobile search button */}
          <button
            type="button"
            aria-label="Open search"
            className="ml-auto inline-flex items-center justify-center rounded-full border border-transparent p-2 text-[var(--color-primary)] md:hidden"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <span className="iconfont icon-Search" />
          </button>
        </div>
      </header>

      {/* Mobile search & filter overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-primary-light)] md:hidden">
          <div className="sticky top-0 border-b border-orange-100 bg-[var(--color-primary-light)]">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
              <button
                type="button"
                aria-label="Back"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm"
                onClick={() => setIsMobileSearchOpen(false)}
              >
                ←
              </button>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search games or categories"
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const target = event.target as HTMLInputElement;
                        handleSearchSubmit(target.value);
                      }
                    }}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                    <span className="iconfont icon-Search" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 py-4">
            <Filter categories={categories} variant="mobile" />
          </div>
        </div>
      )}
    </>
  );
}

