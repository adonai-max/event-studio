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
        { href: "/events/" + eventId, label: "Vue événement", shortLabel: "Vue", icon: "⌂", step: "01", exact: true },
        { href: "/events/" + eventId + "/invitation", label: "Invitation", shortLabel: "Invitation", icon: "✦", step: "02", exact: false },
        { href: "/events/" + eventId + "/guests", label: "Invités", shortLabel: "Invités", icon: "◎", step: "03", exact: false },
        { href: "/events/" + eventId + "/control", label: "Event Control", shortLabel: "Control", icon: "⌁", step: "04", exact: false },
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
          z-index: 30;
          margin-bottom: 1.25rem;
          animation: navReveal .7s cubic-bezier(.22,1,.36,1) both;
        }
        .event-navigation {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(148,163,184,.20);
          background: linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.92));
          box-shadow: 0 18px 48px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.95);
          backdrop-filter: blur(22px);
          isolation: isolate;
        }
        .event-navigation::before {
          content: "";
          position: absolute;
          inset: -70%;
          z-index: -2;
          pointer-events: none;
          background:
            radial-gradient(circle at 12% 20%,rgba(56,189,248,.16),transparent 24%),
            radial-gradient(circle at 88% 80%,rgba(99,102,241,.13),transparent 25%);
          animation: ambientDrift 12s ease-in-out infinite alternate;
        }
        .event-navigation::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -28%;
          width: 18%;
          z-index: -1;
          pointer-events: none;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
          transform: skewX(-18deg);
          animation: lightSweep 9s ease-in-out infinite;
        }
        .nav-scroll {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          align-items: stretch;
          gap: .5rem;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: .1rem;
        }
        .nav-scroll::-webkit-scrollbar { width:0;height:0;display:none; }
        .nav-item {
          position: relative;
          display: flex;
          min-width: 0;
          align-items: center;
          justify-content: center;
          gap: .65rem;
          min-height: 3.85rem;
          border: 1px solid rgba(226,232,240,.88);
          border-radius: 1.05rem;
          color: #0f172a !important;
          background: rgba(248,250,252,.68);
          overflow: hidden;
          transform: translateZ(0);
          transition: transform 300ms cubic-bezier(.22,1,.36,1),background 260ms ease,border-color 260ms ease,box-shadow 300ms ease;
        }
        .nav-item::before {
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:linear-gradient(110deg,transparent 22%,rgba(255,255,255,.9) 48%,transparent 72%);
          transform:translateX(-125%);
          transition:transform 800ms cubic-bezier(.22,1,.36,1);
        }
        .nav-item::after {
          content:"";
          position:absolute;
          left:12%;
          right:12%;
          bottom:-5px;
          height:3px;
          border-radius:999px;
          background:linear-gradient(90deg,#38bdf8,#2563eb,#818cf8);
          opacity:0;
          transform:scaleX(.35);
          transition:opacity 250ms ease,transform 350ms cubic-bezier(.22,1,.36,1);
        }
        .nav-item:hover {
          transform:translateY(-3px);
          background:rgba(239,249,255,.98);
          border-color:rgba(56,189,248,.30);
          box-shadow:0 14px 28px rgba(37,99,235,.11);
        }
        .nav-item:hover::before { transform:translateX(125%); }
        .nav-item:focus-visible { outline:2px solid rgba(37,99,235,.55);outline-offset:2px; }
        .nav-item-active {
          color:#0b3b82 !important;
          background:linear-gradient(145deg,#ffffff 0%,#eff8ff 52%,#dbeafe 100%);
          border-color:rgba(37,99,235,.38);
          box-shadow:0 16px 32px rgba(37,99,235,.16),inset 0 1px 0 rgba(255,255,255,1);
        }
        .nav-item-active::after {
          opacity:1;
          transform:scaleX(1);
          animation:navActive .45s cubic-bezier(.22,1,.36,1) both;
        }
        .nav-icon {
          position:relative;
          display:inline-flex;
          width:2.25rem;
          height:2.25rem;
          flex:0 0 auto;
          align-items:center;
          justify-content:center;
          border-radius:.72rem;
          font-size:.9rem;
          background:#f1f5f9;
          color:#0f172a !important;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.8);
          transition:transform 320ms cubic-bezier(.22,1,.36,1),background 260ms ease,color 260ms ease,box-shadow 320ms ease;
        }
        .nav-step {
          position:absolute;
          right:.42rem;
          top:.38rem;
          font-size:7px;
          font-weight:900;
          letter-spacing:.08em;
          color:#94a3b8;
          opacity:.75;
        }
        .nav-item:hover .nav-icon { transform:translateY(-2px) rotate(-4deg) scale(1.08);background:rgba(14,165,233,.12);color:#000 !important;box-shadow:0 5px 12px rgba(14,165,233,.12); }
        .nav-item-active .nav-icon { background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff !important;box-shadow:0 7px 16px rgba(37,99,235,.25);animation:iconFloat 2.8s ease-in-out infinite; }
        .nav-item-active .nav-step { color:#2563eb;opacity:1; }
        .back-button,.dashboard-link {
          display:inline-flex;
          align-items:center;
          gap:.45rem;
          flex:0 0 auto;
          border-radius:.82rem;
          color:#0f172a !important;
          background:rgba(248,250,252,.9);
          transition:transform 260ms cubic-bezier(.22,1,.36,1),color 240ms ease,background 240ms ease,box-shadow 240ms ease;
        }
        .back-button:hover { transform:translateX(-3px);color:#1d4ed8 !important;background:rgba(219,234,254,.7); }
        .dashboard-link:hover { transform:translateY(-2px);color:#1d4ed8 !important;background:rgba(219,234,254,.8);box-shadow:0 8px 18px rgba(37,99,235,.1); }
        .dashboard-icon {
          display:inline-flex;
          width:1.85rem;
          height:1.85rem;
          align-items:center;
          justify-content:center;
          border-radius:.62rem;
          color:#fff !important;
          background:linear-gradient(135deg,#0ea5e9,#2563eb);
          box-shadow:0 5px 13px rgba(37,99,235,.22);
        }
        .event-name { color:#0f172a !important;animation:nameIn .7s .15s cubic-bezier(.22,1,.36,1) both; }
        :global(.event-page-motion){animation:pageEnter .58s cubic-bezier(.22,1,.36,1) both;}
        :global(.event-page-motion .event-motion-card){animation:cardEnter .62s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--motion-delay,80ms);}
        :global(.event-page-motion .event-motion-card:nth-child(2)){--motion-delay:130ms;}
        :global(.event-page-motion .event-motion-card:nth-child(3)){--motion-delay:180ms;}
        :global(.event-page-motion .event-motion-card:nth-child(4)){--motion-delay:230ms;}
        :global(.event-page-motion .event-motion-card:nth-child(5)){--motion-delay:280ms;}
        :global(.event-page-motion .event-motion-card:hover){transform:translateY(-3px);transition:transform 280ms cubic-bezier(.22,1,.36,1),box-shadow 280ms ease;}
        :global(.event-page-motion .event-motion-interactive){transition:transform 260ms cubic-bezier(.22,1,.36,1),box-shadow 260ms ease,border-color 260ms ease;}
        :global(.event-page-motion .event-motion-interactive:hover){transform:translateY(-2px);}
        :global(.event-page-motion section),:global(.event-page-motion article){animation:contentRise .62s cubic-bezier(.22,1,.36,1) both;}
        :global(.event-page-motion section:nth-of-type(2)),:global(.event-page-motion article:nth-of-type(2)){animation-delay:90ms;}
        :global(.event-page-motion section:nth-of-type(3)),:global(.event-page-motion article:nth-of-type(3)){animation-delay:150ms;}
        :global(.event-page-motion section:nth-of-type(4)),:global(.event-page-motion article:nth-of-type(4)){animation-delay:210ms;}
        :global(.event-page-motion section:nth-of-type(5)),:global(.event-page-motion article:nth-of-type(5)){animation-delay:270ms;}
        :global(.event-page-motion input),:global(.event-page-motion textarea),:global(.event-page-motion select),:global(.event-page-motion button){transition-timing-function:cubic-bezier(.22,1,.36,1);}
        :global(.event-page-motion input:focus),:global(.event-page-motion textarea:focus),:global(.event-page-motion select:focus){transform:translateY(-1px);}
        @keyframes navReveal{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ambientDrift{from{transform:translate3d(-1%,-1%,0) scale(1)}to{transform:translate3d(2%,2%,0) scale(1.04)}}
        @keyframes lightSweep{0%,18%{transform:translateX(-170%) skewX(-18deg);opacity:0}35%{opacity:.78}62%,100%{transform:translateX(470%) skewX(-18deg);opacity:0}}
        @keyframes navActive{from{opacity:0;transform:scaleX(.45)}to{opacity:1;transform:scaleX(1)}}
        @keyframes iconFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
        @keyframes nameIn{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pageEnter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes contentRise{from{opacity:0;transform:translateY(12px) scale(.995)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes cardEnter{from{opacity:0;transform:translateY(10px) scale(.992)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media (max-width:767px){
          .nav-scroll{grid-template-columns:repeat(4,minmax(148px,1fr));}
          .nav-item{min-height:3.45rem;justify-content:flex-start;padding-left:.8rem!important;}
          .nav-step{display:none;}
          .event-navigation{border-radius:20px;}
        }
        @media (prefers-reduced-motion:reduce){
          .event-navigation-wrap,.event-navigation::before,.event-navigation::after,.nav-item,.nav-icon,.back-button,.dashboard-link,.event-name,:global(.event-page-motion),:global(.event-page-motion .event-motion-card),:global(.event-page-motion section),:global(.event-page-motion article){animation:none!important;transition:none!important;}
          .nav-item:hover,.back-button:hover,.dashboard-link:hover,:global(.event-page-motion .event-motion-card:hover),:global(.event-page-motion .event-motion-interactive:hover){transform:none;}
        }
      `}</style>

      <div className="event-navigation rounded-[22px] px-2.5 py-2.5 sm:px-3.5">
        <div className="relative flex items-center gap-2">
          <button type="button" onClick={handleBack} className="back-button px-3 py-2.5 text-[11px] font-bold" aria-label="Retour à la page précédente" title="Retour à la page précédente">
            <span className="text-base">←</span>
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="mx-0.5 hidden h-7 w-px shrink-0 bg-zinc-200 sm:block" />

          <div className="hidden shrink-0 px-1 sm:block">
            <span className="text-[8px] font-black uppercase tracking-[.16em] text-zinc-900">Navigation</span>
          </div>

          <nav className="nav-scroll min-w-0 flex-1 px-0.5 py-1" aria-label="Navigation de l'événement">
            {tabs.map((tab) => {
              const active = isActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "nav-item px-3 sm:px-4",
                    active ? "nav-item-active font-black" : "font-bold",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {tab.icon}
                    <span className="nav-step">{tab.step}</span>
                  </span>
                  <span className="truncate text-[11px] tracking-[-.01em] sm:text-[12px]">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden h-6 w-px shrink-0 bg-zinc-200 lg:block" />

          <Link href="/dashboard" className="dashboard-link hidden px-3 py-2.5 text-[11px] font-bold lg:inline-flex" title="Retour au Dashboard">
            <span className="dashboard-icon" aria-hidden="true">⌂</span>
            <span>Dashboard</span>
          </Link>
        </div>

        {eventName && (
          <div className="mt-1 flex items-center gap-2 border-t border-zinc-100 px-2.5 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,.08)]" />
            <span className="event-name truncate text-[9px] font-bold uppercase tracking-[.16em]">{eventName}</span>
          </div>
        )}
      </div>
    </div>
  );
}