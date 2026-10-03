"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type EventNavigationProps = {
  eventId: string;
};

export default function EventNavigation({
  eventId,
}: EventNavigationProps) {
  const pathname = usePathname();

  const basePath = `/events/${eventId}`;

  const tabs = [
    {
      href: basePath,
      label: "Vue générale",
      icon: "🏠",
    },
    {
      href: `${basePath}/invitation`,
      label: "Invitation",
      icon: "💌",
    },
    {
      href: `${basePath}/guests`,
      label: "Invités",
      icon: "👥",
    },
    {
      href: `${basePath}/control`,
      label: "Event Control",
      icon: "🎛️",
    },
  ];

  return (
    <nav className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <span className="text-lg">←</span>
            Retour au tableau de bord
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
            ES
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-900">
              Event Studio
            </p>
            <p className="text-xs text-zinc-500">
              Gestion de votre événement
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1 px-3 py-3 sm:px-5">
          {tabs.map((tab) => {
            const isActive =
              tab.href === basePath
                ? pathname === basePath
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "group inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-base transition-transform",
                    isActive ? "" : "group-hover:scale-110",
                  ].join(" ")}
                >
                  {tab.icon}
                </span>

                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
