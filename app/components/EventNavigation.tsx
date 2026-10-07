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
        { href: "/events/" + eventId, label: "Vue événement", icon: "⌂", exact: true },
        { href: "/events/" + eventId + "/invitation", label: "Invitation", icon: "✦", exact: false },
        { href: "/events/" + eventId + "/guests", label: "Invités", icon: "◎", exact: false },
        { href: "/events/" + eventId + "/control", label: "Event Control", icon: "⌁", exact: false },
      ]
    : [];

  const isActive = (tab: (typeof tabs)[number]) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  function handleBack() {
    if (window.history.length > 1) router.back();
    else router.push(backHref);
  }

  return (
    <div className="event-navigation-wrap">
      <style jsx>{`
        .event-navigation-wrap {
          position: relative;
          z-index: 20;
          margin-bottom: 1.25rem;
          animation: navReveal .65s cubic-bezier(.22,1,.36,1) both;
        }
        .event-navigation {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.20);
          background: linear-gradient(135deg, rgba(255,255,255,.97), rgba(248,250,252,.92));
          box-shadow: 0 14px 38px rgba(15,23,42,.075), inset 0 1px 0 rgba(255,255,255,.92);
          backdrop-filter: blur(18px);
          isolation: isolate;
        }
        .event-navigation::before {
          content: "";
          position: absolute;
          inset: -45%;
          z-index: -2;
          pointer-events: none;
          background:
            radial-gradient(circle at 12% 18%, rgba(56,189,248,.15), transparent 25%),
            radial-gradient(circle at 86% 82%, rgba(37,99,235,.12), transparent 25%);
          animation: ambientDrift 10s ease-in-out infinite alternate;
        }
        .event-navigation::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -35%;
          width: 25%;
          z-index: -1;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.80), transparent);
          transform: skewX(-18deg);
          animation: lightSweep 8s ease-in-out infinite;
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
        .nav-scroll::-webkit-scrollbar { display: none; }

        .nav-item {
          position: relative;
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: .5rem;
          min-height: 2.85rem;
          border: 1px solid transparent;
          border-radius: .85rem;
          color: #000 !important;
          background: rgba(255,255,255,.88);
          overflow: hidden;
          transform: translateZ(0);
          transition:
            transform 300ms cubic-bezier(.22,1,.36,1),
            color 260ms ease,
            background 260ms ease,
            border-color 260ms ease,
            box-shadow 300ms ease;
        }
        .nav-item::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.82) 48%, transparent 70%);
          transform: translateX(-125%);
          transition: transform 700ms cubic-bezier(.22,1,.36,1);
        }
        .nav-item,
        .nav-item:visited,
        .nav-item:link,
        .nav-item:hover,
        .nav-item:focus,
        .nav-item:active {
          color: #000 !important;
        }
        .nav-item > span:last-child { color: #000 !important; }
        .nav-item:hover {
          transform: translateY(-2px) scale(1.015);
          background: rgba(239,249,255,.98);
          border-color: rgba(56,189,248,.28);
          box-shadow: 0 9px 20px rgba(14,165,233,.10);
        }
        .nav-item:hover::before { transform: translateX(125%); }
        .nav-item:focus-visible {
          outline: 2px solid rgba(37,99,235,.55);
          outline-offset: 2px;
        }
        .nav-item-active {
          color: #000 !important;
          background: linear-gradient(135deg, #ffffff, #eff8ff);
          border-color: rgba(37,99,235,.32);
          box-shadow: 0 6px 17px rgba(37,99,235,.11), inset 0 1px 0 rgba(255,255,255,.98);
        }
        .nav-item-active::after {
          content: "";
          position: absolute;
          left: 17%;
          right: 17%;
          bottom: -1px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgb(56 189 248), rgb(37 99 235), rgb(99 102 241));
          box-shadow: 0 0 10px rgba(37,99,235,.32);
          animation: navActive .45s cubic-bezier(.22,1,.36,1) both;
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
          color: #0f172a !important;
          transition: transform 320ms cubic-bezier(.22,1,.36,1), background 260ms ease, color 260ms ease, box-shadow 320ms ease;
        }
        .nav-item:hover .nav-icon {
          transform: rotate(-4deg) scale(1.10);
          background: rgba(14,165,233,.12);
          color: #000 !important;
          box-shadow: 0 4px 11px rgba(14,165,233,.11);
        }
        .nav-item-active .nav-icon {
          background: linear-gradient(135deg, rgb(14 165 233), rgb(37 99 235));
          color: #fff !important;
          box-shadow: 0 5px 13px rgba(37,99,235,.23);
          animation: iconFloat 2.8s ease-in-out infinite;
        }
        .back-button,
        .back-button:visited,
        .back-button:link,
        .back-button:hover,
        .back-button:focus,
        .back-button:active,
        .dashboard-link,
        .dashboard-link:visited,
        .dashboard-link:link,
        .dashboard-link:hover,
        .dashboard-link:focus,
        .dashboard-link:active {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          flex: 0 0 auto;
          border-radius: .8rem;
          color: #000 !important;
          transition: transform 260ms cubic-bezier(.22,1,.36,1), color 240ms ease, background 240ms ease;
        }
        .back-button:hover { transform: translateX(-3px); background: rgba(14,165,233,.07); }
        .dashboard-link:hover { transform: translateY(-2px); background: rgba(14,165,233,.07); }
        .event-name {
          color: #0f172a !important;
          animation: nameIn .7s .15s cubic-bezier(.22,1,.36,1) both;
        }

        /* Système Motion + Wonder partagé par toutes les pages événement. */
        :global(.event-page-motion) {
          animation: pageEnter .58s cubic-bezier(.22,1,.36,1) both;
        }
        :global(.event-page-motion .event-motion-card) {
          animation: cardEnter .62s cubic-bezier(.22,1,.36,1) both;
          animation-delay: var(--motion-delay, 80ms);
        }
        :global(.event-page-motion .event-motion-card:nth-child(2)) { --motion-delay: 130ms; }
        :global(.event-page-motion .event-motion-card:nth-child(3)) { --motion-delay: 180ms; }
        :global(.event-page-motion .event-motion-card:nth-child(4)) { --motion-delay: 230ms; }
        :global(.event-page-motion .event-motion-card:nth-child(5)) { --motion-delay: 280ms; }
        :global(.event-page-motion .event-motion-card:hover) {
          transform: translateY(-3px);
          transition: transform 280ms cubic-bezier(.22,1,.36,1), box-shadow 280ms ease;
        }
        :global(.event-page-motion .event-motion-interactive) {
          transition: transform 260ms cubic-bezier(.22,1,.36,1), box-shadow 260ms ease, border-color 260ms ease;
        }
        :global(.event-page-motion .event-motion-interactive:hover) {
          transform: translateY(-2px);
        }

        :global(.event-page-motion section),
        :global(.event-page-motion article) {
          animation: contentRise .62s cubic-bezier(.22,1,.36,1) both;
        }
        :global(.event-page-motion section:nth-of-type(2)),
        :global(.event-page-motion article:nth-of-type(2)) { animation-delay: 90ms; }
        :global(.event-page-motion section:nth-of-type(3)),
        :global(.event-page-motion article:nth-of-type(3)) { animation-delay: 150ms; }
        :global(.event-page-motion section:nth-of-type(4)),
        :global(.event-page-motion article:nth-of-type(4)) { animation-delay: 210ms; }
        :global(.event-page-motion section:nth-of-type(5)),
        :global(.event-page-motion article:nth-of-type(5)) { animation-delay: 270ms; }
        :global(.event-page-motion input),
        :global(.event-page-motion textarea),
        :global(.event-page-motion select),
        :global(.event-page-motion button) {
          transition-timing-function: cubic-bezier(.22,1,.36,1);
        }
        :global(.event-page-motion input:focus),
        :global(.event-page-motion textarea:focus),
        :global(.event-page-motion select:focus) {
          transform: translateY(-1px);
        }


        @keyframes navReveal {
          from { opacity: 0; transform: translateY(-7px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ambientDrift {
          from { transform: translate3d(-1%, -1%, 0) scale(1); }
          to { transform: translate3d(2%, 2%, 0) scale(1.04); }
        }
        @keyframes lightSweep {
          0%, 18% { transform: translateX(-170%) skewX(-18deg); opacity: 0; }
          35% { opacity: .78; }
          62%, 100% { transform: translateX(470%) skewX(-18deg); opacity: 0; }
        }
        @keyframes navActive {
          from { opacity: 0; transform: scaleX(.45); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes nameIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes contentRise {
          from { opacity: 0; transform: translateY(12px) scale(.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(10px) scale(.992); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .event-navigation-wrap,
          .event-navigation::before,
          .event-navigation::after,
          .nav-item,
          .nav-icon,
          .back-button,
          .dashboard-link,
          .event-name,
          :global(.event-page-motion),
          :global(.event-page-motion .event-motion-card),
          :global(.event-page-motion section),
          :global(.event-page-motion article) {
            animation: none !important;
            transition: none !important;
          }
          .nav-item:hover,
          .back-button:hover,
          .dashboard-link:hover,
          :global(.event-page-motion .event-motion-card:hover),
          :global(.event-page-motion .event-motion-interactive:hover) {
            transform: none;
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

          <div className="hidden shrink-0 px-1 sm:block">
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-900">Menu</span>
          </div>

          <nav className="nav-scroll min-w-0 flex-1 px-0.5 py-1.5" aria-label="Navigation de l'événement">
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
                  style={{ color: "#000000" }}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className="nav-icon"
                    style={{ color: active ? "#ffffff" : "#000000" }}
                    aria-hidden="true"
                  >
                    {tab.icon}
                  </span>
                  <span className="text-[10px] sm:text-[11px]" style={{ color: "#000000" }}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden h-6 w-px shrink-0 bg-zinc-200 md:block" />

          <Link
            href="/dashboard"
            className="dashboard-link hidden px-3 py-2.5 text-[11px] font-bold"
            title="Retour au Dashboard"
          >
            <span aria-hidden="true">⌂</span>
            Dashboard
          </Link>
        </div>

        {eventName && (
          <div className="mt-1 flex items-center gap-2 border-t border-zinc-100 px-2.5 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,.08)]" />
            <span className="event-name truncate text-[9px] font-bold uppercase tracking-[0.16em]">
              {eventName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}