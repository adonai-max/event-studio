"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type EventNavigationProps = {
  eventId?: string;
  eventName?: string;
  backHref?: string;
};

export default function EventNavigation({
  eventId,
  eventName,
  backHref = "/dashboard",
}: EventNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = eventId
    ? [
        {
          href: "/events/" + eventId,
          label: "Vue événement",
          icon: "⌂",
          exact: true,
        },
        {
          href: "/events/" + eventId + "/invitation",
          label: "Invitation",
          icon: "✦",
          exact: false,
        },
        {
          href: "/events/" + eventId + "/guests",
          label: "Invités",
          icon: "◎",
          exact: false,
        },
        {
          href: "/events/" + eventId + "/control",
          label: "Event Control",
          icon: "⌁",
          exact: false,
        },
      ]
    : [];

  const isActive = (tab: (typeof tabs)[number]) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref);
    }
  }

  return (
    <div className="event-navigation-wrap">
      <style jsx>{`
        .event-navigation-wrap {
          position: relative;
          z-index: 20;
          margin-bottom: 1.25rem;
        }

        .event-navigation {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.20);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.96),
              rgba(248,250,252,.90)
            );
          box-shadow:
            0 12px 35px rgba(15,23,42,.07),
            inset 0 1px 0 rgba(255,255,255,.90);
          backdrop-filter: blur(18px);
        }

        .event-navigation::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(56,189,248,.10),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 100%,
              rgba(37,99,235,.08),
              transparent 30%
            );
        }

        .nav-scroll {
          position: relative;
          display: flex;
          align-items: center;
          gap: .5rem;
          overflow-x: auto;
          scrollbar-width: none;
          padding: .1rem;
        }

        .nav-scroll::-webkit-scrollbar {
          display: none;
        }

        .nav-item {
          position: relative;
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: .5rem;
          min-height: 2.85rem;
          border: 1px solid transparent;
          border-radius: .85rem;
          color: rgb(0 0 0);
          background: rgba(248,250,252,.58);
          transition:
            transform 260ms cubic-bezier(.22,1,.36,1),
            color 260ms ease,
            background 260ms ease,
            border-color 260ms ease,
            box-shadow 260ms ease;
        }

        .nav-item:hover {
          transform: translateY(-1px);
          color: rgb(0 0 0);
          background: rgba(14,165,233,.06);
        }

        .nav-item-active {
          color: rgb(15 23 42);
          background: white;
          border-color: rgba(37,99,235,.30);
          box-shadow:
            0 3px 10px rgba(15,23,42,.07),
            inset 0 1px 0 rgba(255,255,255,.95);
        }

        .nav-item-active::after {
          content: "";
          position: absolute;
          left: 20%;
          right: 20%;
          bottom: -1px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgb(56 189 248), rgb(37 99 235));
          box-shadow: 0 0 7px rgba(37,99,235,.22);
          animation: navActive .35s cubic-bezier(.22,1,.36,1) both;
        }

        .nav-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.7rem;
          height: 1.7rem;
          border-radius: .55rem;
          font-size: .75rem;
          background: rgb(238 242 247);
          color: rgb(15 23 42);
          transition:
            transform 260ms ease,
            background 260ms ease,
            color 260ms ease,
            box-shadow 260ms ease;
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.08);
          background: rgba(14,165,233,.10);
        }

        .nav-item-active .nav-icon {
          background: linear-gradient(135deg, rgb(14 165 233), rgb(37 99 235));
          color: white;
          box-shadow: 0 4px 10px rgba(37,99,235,.18);
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          flex: 0 0 auto;
          border-radius: .8rem;
          color: rgb(71 85 105);
          transition:
            transform 240ms ease,
            color 240ms ease,
            background 240ms ease;
        }

        .back-button:hover {
          transform: translateX(-2px);
          color: rgb(0 76 153);
          background: rgba(14,165,233,.07);
        }

        .dashboard-link {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          flex: 0 0 auto;
          border-radius: .8rem;
          color: rgb(71 85 105);
          transition:
            transform 240ms ease,
            color 240ms ease,
            background 240ms ease;
        }

        .dashboard-link:hover {
          transform: translateY(-1px);
          color: rgb(3 105 161);
          background: rgba(14,165,233,.07);
        }

        @keyframes navActive {
          from {
            opacity: 0;
            transform: scaleX(.45);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-item,
          .nav-icon,
          .back-button,
          .dashboard-link {
            transition: none;
          }

          .nav-item:hover,
          .back-button:hover,
          .dashboard-link:hover {
            transform: none;
          }

          .nav-item-active::after {
            animation: none;
          }
        }
      `}</style>

      <div className="event-navigation rounded-[20px] px-2 py-2 sm:px-3">
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="back-button px-3 py-2.5 text-[11px] font-bold"
            aria-label="Retour à la page précédente"
            title="Retour à la page précédente"
          >
            <span className="text-base">←</span>
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="mx-0.5 hidden h-7 w-px shrink-0 bg-zinc-200 sm:block" />

          <div className="hidden shrink-0 px-1 sm:block"><span className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-900">Menu</span></div>

          <nav
            className="nav-scroll min-w-0 flex-1 px-0.5 py-1.5"
            aria-label="Navigation de l'événement"
          >
            {tabs.map((tab) => {
              const active = isActive(tab);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "nav-item px-3 py-2 sm:px-4",
                    active ? "nav-item-active font-black" : "font-semibold",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {tab.icon}
                  </span>
                  <span className="text-[10px] sm:text-[11px]">
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden h-6 w-px shrink-0 bg-zinc-200 md:block" />

          <Link
            href="/dashboard"
            className="dashboard-link hidden px-3 py-2.5 text-[11px] font-bold md:inline-flex"
            title="Retour au Dashboard"
          >
            <span aria-hidden="true">⌂</span>
            Dashboard
          </Link>
        </div>

        {eventName && (
          <div className="mt-1 flex items-center gap-2 border-t border-zinc-100 px-2.5 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,.08)]" />
            <span className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              {eventName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
