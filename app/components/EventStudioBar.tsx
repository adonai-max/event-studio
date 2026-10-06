"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../context/ThemeContext";

export default function EventStudioBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [userName, setUserName] = useState("Adonaï");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      themeHydrated &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const firstName =
        user.user_metadata?.first_name ||
        user.user_metadata?.full_name?.trim().split(/\\s+/)[0] ||
        user.user_metadata?.name?.trim().split(/\\s+/)[0] ||
        user.email?.split("@")[0];

      setUserName(firstName || "Adonaï");
      setUserEmail(user.email ?? "");
      setAvatarUrl(user.user_metadata?.avatar_url ?? "");
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[90] overflow-visible border-b border-sky-400/30 bg-gradient-to-r from-sky-300 via-sky-600 to-blue-700 text-white shadow-[0_10px_30px_rgba(14,116,144,0.18)]">
      <style jsx>{`
        @keyframes eventStudioBarShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .event-studio-bar-shift {
          background-size: 200% 200%;
          animation: eventStudioBarShift 16s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .event-studio-bar-shift {
            animation: none;
          }
        }
      `}</style>

      <div className="event-studio-bar-shift pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-300/40 via-sky-500/10 to-blue-700/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/50" />
      <div className="pointer-events-none absolute -inset-x-20 top-0 h-16 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl motion-safe:animate-pulse motion-reduce:animate-none" />

      <div className="relative mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="group flex min-w-0 items-center gap-3"
          aria-label="Event Studio — Centre de pilotage"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 text-xs font-black text-white shadow-lg ring-1 ring-white/20 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:ring-white/40 motion-reduce:transition-none">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100 motion-reduce:transition-none" />
            <span className="relative">ES</span>
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-black tracking-tight text-white">
              Event Studio
            </p>
            <p className="text-[11px] font-medium text-white/70">
              Centre de pilotage
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark ? "Passer en mode lumière" : "Passer en mode sombre"
            }
            title={isDark ? "Mode lumière" : "Mode sombre"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-base shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-md motion-reduce:transition-none"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-md motion-reduce:transition-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-sky-600 bg-red-400" />
          </button>

          <div className="hidden h-8 w-px bg-white/30 sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-blue-950/45 p-1 shadow-md shadow-blue-950/20 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:bg-blue-950/60 motion-reduce:transition-none"
              aria-label={`Profil de ${userName}`}
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              title={userName}
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/15 text-xs font-black ring-1 ring-white/25">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">AD</span>
                )}
              </div>
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-[120] mt-2 w-64 overflow-hidden rounded-2xl border border-sky-100 bg-white p-2 text-slate-800 shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {userName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {userEmail || "Profil"}
                  </p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-sky-50 hover:text-sky-800 dark:hover:bg-slate-800"
                >
                  👤 Mon profil
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-sky-50 hover:text-sky-800 dark:hover:bg-slate-800"
                >
                  ⚙️ Paramètres
                </Link>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  ↪ Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
