"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../context/ThemeContext";

export default function GlobalNavigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // La barre globale Event Studio reste visible sur toutes les pages.
  // Les pages d'événement peuvent conserver en plus leur navigation contextuelle.
  const showNavigation = true;

  return (
    <header className="sticky top-0 z-[100] border-b border-sky-200/70 bg-white/95 shadow-sm backdrop-blur-xl transition-colors dark:border-sky-900/70 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3"
          aria-label="Event Studio"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-sm font-black text-white shadow-md shadow-sky-500/20 transition-transform duration-300 group-hover:scale-105">
            <span className="relative z-10">ES</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">
              Event Studio
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Centre de pilotage
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="hidden rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 sm:inline-flex dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
          >
            🎨 Personnaliser
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Passer en mode lumière" : "Passer en mode sombre"}
            title={isDark ? "Mode lumière" : "Mode sombre"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-lg text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
          </button>

          <Link
            href="/profile"
            className="group flex items-center gap-2 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-700 to-blue-800 px-2.5 py-1.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:from-sky-600 hover:to-indigo-700 dark:border-sky-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-xs font-black ring-1 ring-white/20">
              AD
            </div>
            <span className="hidden max-w-28 truncate text-xs font-bold sm:block">
              Profil
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
