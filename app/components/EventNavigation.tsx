"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

type EventNavigationProps = {
  eventId?: string;
  eventName?: string;
  backHref?: string;
};

const iconMap = {
  overview: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  ),
  invitation: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
  ),
  guests: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.5" /><path d="M15 19a4 4 0 0 1 5.5-3.7" /></svg>
  ),
  control: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" /><circle cx="8" cy="7" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="10" cy="17" r="2" /></svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5" /><path d="M6.5 9.5V20h11V9.5M10 20v-5h4v5" /></svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
  ),
};

export default function EventNavigation({ eventId, eventName, backHref = "/dashboard" }: EventNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hoverAnimations = useRef(new Map<string, Animation>());
  const backAnimation = useRef<Animation | null>(null);

  function animateHover(key: string, element: HTMLElement | null, type: "tab" | "back") {
    if (!element || typeof element.animate !== "function") return;
    const current = type === "back" ? backAnimation.current : hoverAnimations.current.get(key);
    current?.cancel();
    const animation = element.animate(
      type === "back"
        ? [
            { transform: "translate3d(0,0,0) scale(1)" },
            { transform: "translate3d(-5px,-3px,0) scale(1.06)", offset: 0.5 },
            { transform: "translate3d(0,0,0) scale(1)" },
          ]
        : [
            { transform: "translate3d(0,0,0) scale(1)" },
            { transform: "translate3d(0,-10px,0) scale(1.08)", offset: 0.45 },
            { transform: "translate3d(0,-6px,0) scale(1.05)", offset: 0.7 },
            { transform: "translate3d(0,-8px,0) scale(1.07)" },
          ],
      { duration: type === "back" ? 1500 : 1800, iterations: Infinity, easing: "cubic-bezier(.22,1,.36,1)" }
    );
    if (type === "back") backAnimation.current = animation;
    else hoverAnimations.current.set(key, animation);
  }

  function stopHover(key: string, type: "tab" | "back") {
    if (type === "back") {
      backAnimation.current?.cancel();
      backAnimation.current = null;
    } else {
      hoverAnimations.current.get(key)?.cancel();
      hoverAnimations.current.delete(key);
    }
  }

  const tabs = eventId
    ? [
        { href: "/events/" + eventId, label: "Vue événement", shortLabel: "Vue", icon: iconMap.overview, exact: true },
        { href: "/events/" + eventId + "/invitation", label: "Invitation", shortLabel: "Invitation", icon: iconMap.invitation, exact: false },
        { href: "/events/" + eventId + "/guests", label: "Invités", shortLabel: "Invités", icon: iconMap.guests, exact: false },
        { href: "/events/" + eventId + "/control", label: "Event Control", shortLabel: "Control", icon: iconMap.control, exact: false },
      ]
    : [];

  const isActive = (tab: (typeof tabs)[number]) => tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  function handleBack() {
    if (window.history.length > 1) router.back();
    else router.push(backHref);
  }

  return (
    <div className="event-navigation-wrap">
      <style jsx>{`
        .event-navigation-wrap{position:relative;z-index:30;margin-bottom:1.25rem;animation:navReveal .7s cubic-bezier(.22,1,.36,1) both}
        .event-navigation{position:relative;overflow:visible;border:1px solid rgba(148,163,184,.2);background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.92));box-shadow:0 18px 48px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.95);backdrop-filter:blur(22px);isolation:isolate}
        .event-navigation::before{content:"";position:absolute;inset:-70%;z-index:-2;pointer-events:none;background:radial-gradient(circle at 12% 20%,rgba(56,189,248,.16),transparent 24%),radial-gradient(circle at 88% 80%,rgba(99,102,241,.13),transparent 25%);animation:ambientDrift 12s ease-in-out infinite alternate}
        .event-navigation::after{content:"";position:absolute;top:0;bottom:0;left:-28%;width:18%;z-index:-1;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);transform:skewX(-18deg);animation:lightSweep 9s ease-in-out infinite}
        .nav-scroll{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:stretch;gap:.6rem;overflow-x:visible;scrollbar-width:none;-ms-overflow-style:none;padding:.1rem}
        .nav-scroll::-webkit-scrollbar{width:0;height:0;display:none}
        .nav-item{position:relative;z-index:1;display:flex;will-change:transform;min-width:0;align-items:center;justify-content:center;gap:.62rem;min-height:3.8rem;border:1px solid rgba(226,232,240,.9);border-radius:1rem;color:#0f172a!important;background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(241,245,249,.78));overflow:hidden;transform:translateZ(0);transition:transform 420ms cubic-bezier(.16,1,.3,1),background 260ms ease,border-color 260ms ease,box-shadow 320ms ease;transform-origin:center center}
        .nav-item::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 22%,rgba(255,255,255,.9) 48%,transparent 72%);transform:translateX(-125%);transition:transform 800ms cubic-bezier(.22,1,.36,1)}
        .nav-item::after{content:"";position:absolute;left:12%;right:12%;bottom:-5px;height:3px;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#2563eb,#818cf8);opacity:0;transform:scaleX(.35);transition:opacity 250ms ease,transform 350ms cubic-bezier(.22,1,.36,1)}
        .nav-item:hover{z-index:50;animation:tabWonderLoop 1.9s cubic-bezier(.22,1,.36,1) infinite;background:linear-gradient(145deg,#ffffff 0%,#effaff 55%,#e0f2fe 100%);border-color:rgba(14,165,233,.72);box-shadow:0 20px 42px rgba(14,165,233,.24),0 0 0 3px rgba(56,189,248,.08),inset 0 1px 0 #fff}
        .nav-item:hover::before{transform:translateX(125%)}
        .nav-item:hover .truncate{transform:translateX(2px) scale(1.035);transition:transform 260ms cubic-bezier(.22,1,.36,1)}
        .nav-item:focus-visible{outline:2px solid rgba(37,99,235,.55);outline-offset:2px}
        .nav-item-active{color:#075985!important;background:linear-gradient(135deg,#ecfeff 0%,#e0f2fe 48%,#dbeafe 100%);border-color:rgba(14,165,233,.48);box-shadow:0 18px 36px rgba(14,165,233,.17),inset 0 1px 0 #fff;animation:activeTabBreath 3.2s ease-in-out infinite}
        .nav-item-active::after{opacity:1;transform:scaleX(1);animation:navActive .45s cubic-bezier(.22,1,.36,1) both}
        .nav-icon{position:relative;display:inline-flex;width:2.05rem;height:2.05rem;flex:0 0 auto;align-items:center;justify-content:center;border-radius:.7rem;font-size:.98rem;background:#f1f5f9;color:#0f172a!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.8);transition:transform 320ms cubic-bezier(.22,1,.36,1),background 260ms ease,color 260ms ease,box-shadow 320ms ease}
        .nav-icon svg{width:1.05rem;height:1.05rem;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .nav-item:hover .nav-icon{animation:iconWonder .9s cubic-bezier(.16,1,.3,1) both;background:rgba(14,165,233,.12);color:#0369a1!important;box-shadow:0 5px 12px rgba(14,165,233,.12)}
        .nav-item-active .nav-icon{background:linear-gradient(135deg,#06b6d4,#2563eb);color:#fff!important;box-shadow:0 8px 18px rgba(37,99,235,.28);animation:iconFloat 2.4s ease-in-out infinite}
        .back-button{position:relative;display:inline-flex;align-items:center;gap:.5rem;border:1px solid rgba(186,230,253,.95);padding:.46rem .78rem .46rem .5rem;border-radius:1rem;background:linear-gradient(145deg,#ffffff,#f0f9ff);color:#0f3f67!important;box-shadow:0 8px 20px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.95);white-space:nowrap;overflow:hidden;transition:transform 280ms cubic-bezier(.22,1,.36,1),box-shadow 280ms ease,border-color 220ms ease,background 220ms ease}
        .back-button::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.9) 48%,transparent 70%);transform:translateX(-120%);transition:transform 650ms cubic-bezier(.16,1,.3,1)}\n        .back-button:hover{animation:backWonder 1.7s cubic-bezier(.22,1,.36,1) infinite;color:#075985!important;background:linear-gradient(145deg,#fff,#e0f2fe);border-color:rgba(14,165,233,.48);box-shadow:0 12px 26px rgba(37,99,235,.14),inset 0 1px 0 #fff}\n        .back-button:hover::before{transform:translateX(120%)}
        .back-icon{display:inline-flex;width:2rem;height:2rem;align-items:center;justify-content:center;border-radius:.72rem;background:linear-gradient(135deg,#e0f2fe,#dbeafe);color:#2563eb;box-shadow:inset 0 0 0 1px rgba(147,197,253,.55),0 4px 10px rgba(37,99,235,.1);transition:transform 300ms cubic-bezier(.22,1,.36,1),background 220ms ease,box-shadow 220ms ease}
        .back-icon svg{width:1.08rem;height:1.08rem;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform 300ms cubic-bezier(.22,1,.36,1)}\n        .back-button:hover .back-icon{transform:translateX(-2px) scale(1.05);background:linear-gradient(135deg,#bae6fd,#bfdbfe);box-shadow:inset 0 0 0 1px rgba(96,165,250,.5),0 6px 14px rgba(37,99,235,.15)}\n        .back-button:hover .back-icon svg{transform:translateX(-2px)}
        .dashboard-link{position:relative;display:inline-flex;align-items:center;gap:.62rem;overflow:hidden;isolation:isolate;animation:dashboardFloat 3.8s ease-in-out infinite;transition:transform 800ms cubic-bezier(.16,1,.3,1),color 420ms ease,background 420ms ease,box-shadow 520ms ease,border-color 420ms ease;border-radius:1rem;border:1px solid rgba(147,197,253,.28);padding-left:.78rem!important;padding-right:.9rem!important;color:#0f3f67!important;will-change:transform}.dashboard-link::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(110deg,transparent 14%,rgba(255,255,255,.88) 46%,transparent 78%);transform:translateX(-130%);animation:dashboardSweep 4.6s ease-in-out infinite}.dashboard-link::after{content:"";position:absolute;left:9%;right:9%;bottom:2px;height:2px;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#2563eb,#818cf8);transform:scaleX(.2);transform-origin:center;opacity:.45;animation:dashboardLine 3.8s ease-in-out infinite}.dashboard-link:hover{transform:translateY(-3px) scale(1.045);color:#1d4ed8!important;background:linear-gradient(145deg,rgba(255,255,255,.99),rgba(219,234,254,.88));border-color:rgba(96,165,250,.5);box-shadow:0 14px 30px rgba(37,99,235,.17),0 0 0 2px rgba(96,165,250,.1)}
        .dashboard-icon{display:inline-flex;width:1.85rem;height:1.85rem;align-items:center;justify-content:center;border-radius:.62rem;color:#fff!important;background:linear-gradient(135deg,#0ea5e9,#2563eb);box-shadow:0 5px 13px rgba(37,99,235,.22);animation:dashboardIconFloat 2.8s ease-in-out infinite;transition:transform 520ms cubic-bezier(.16,1,.3,1),box-shadow 420ms ease}.dashboard-link:hover .dashboard-icon{transform:translateY(-1px) scale(1.05) rotate(-2deg);box-shadow:0 8px 18px rgba(37,99,235,.24)}
        .dashboard-icon svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.dashboard-title{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:5.5rem;font-size:.76rem;line-height:1;font-weight:900;letter-spacing:.055em;color:#1e40af!important;text-align:center;white-space:nowrap;transform-origin:center;animation:dashboardTitleFloat 3.4s cubic-bezier(.45,0,.55,1) infinite;transition:transform 700ms cubic-bezier(.16,1,.3,1),letter-spacing 500ms ease,text-shadow 500ms ease}.dashboard-title::after{content:"";position:absolute;left:7%;right:7%;bottom:-5px;height:2px;border-radius:999px;background:linear-gradient(90deg,transparent,#38bdf8 25%,#2563eb 50%,#818cf8 75%,transparent);transform:scaleX(.15);transform-origin:center;opacity:.35;animation:dashboardTitleLine 3.4s ease-in-out infinite}.dashboard-link:hover .dashboard-title{transform:translateY(-2px) scale(1.045);letter-spacing:.075em;text-shadow:0 5px 15px rgba(37,99,235,.22)}
        .event-name{color:#0f172a!important;animation:nameIn .7s .15s cubic-bezier(.22,1,.36,1) both}
        :global(.event-page-motion){animation:pageEnter .58s cubic-bezier(.22,1,.36,1) both}
        :global(.event-page-motion .event-motion-card){animation:cardEnter .62s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--motion-delay,80ms)}
        :global(.event-page-motion .event-motion-card:nth-child(2)){--motion-delay:130ms}
        :global(.event-page-motion .event-motion-card:nth-child(3)){--motion-delay:180ms}
        :global(.event-page-motion .event-motion-card:nth-child(4)){--motion-delay:230ms}
        :global(.event-page-motion .event-motion-card:nth-child(5)){--motion-delay:280ms}
        :global(.event-page-motion .event-motion-card:hover){transform:translateY(-3px);transition:transform 280ms cubic-bezier(.22,1,.36,1),box-shadow 280ms ease}
        :global(.event-page-motion .event-motion-interactive){transition:transform 260ms cubic-bezier(.22,1,.36,1),box-shadow 260ms ease,border-color 260ms ease}
        :global(.event-page-motion .event-motion-interactive:hover){transform:translateY(-2px)}
        :global(.event-page-motion section),:global(.event-page-motion article){animation:contentRise .62s cubic-bezier(.22,1,.36,1) both}
        :global(.event-page-motion section:nth-of-type(2)),:global(.event-page-motion article:nth-of-type(2)){animation-delay:90ms}
        :global(.event-page-motion section:nth-of-type(3)),:global(.event-page-motion article:nth-of-type(3)){animation-delay:150ms}
        :global(.event-page-motion section:nth-of-type(4)),:global(.event-page-motion article:nth-of-type(4)){animation-delay:210ms}
        :global(.event-page-motion section:nth-of-type(5)),:global(.event-page-motion article:nth-of-type(5)){animation-delay:270ms}
        :global(.event-page-motion input),:global(.event-page-motion textarea),:global(.event-page-motion select),:global(.event-page-motion button){transition-timing-function:cubic-bezier(.22,1,.36,1)}
        :global(.event-page-motion input:focus),:global(.event-page-motion textarea:focus),:global(.event-page-motion select:focus){transform:translateY(-1px)}
        @keyframes navReveal{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tabWonder{0%{transform:translate3d(0,0,0) scale(1)}45%{transform:translate3d(0,-9px,0) scale(1.09) rotateX(1deg)}70%{transform:translate3d(0,-6px,0) scale(1.07)}100%{transform:translate3d(0,-7px,0) scale(1.08)}}
        @keyframes tabWonderLoop{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-4px,0) scale(1.035)}}
        @keyframes backWonder{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-2px,-1px,0) scale(1.025)}}
        @keyframes ambientDrift{from{transform:translate3d(-1%,-1%,0) scale(1)}to{transform:translate3d(2%,2%,0) scale(1.04)}}
        @keyframes lightSweep{0%,18%{transform:translateX(-170%) skewX(-18deg);opacity:0}35%{opacity:.78}62%,100%{transform:translateX(470%) skewX(-18deg);opacity:0}}
        @keyframes navActive{0%{opacity:0;transform:scaleX(.35)}60%{opacity:1;transform:scaleX(1.06)}100%{opacity:1;transform:scaleX(1)}}
        @keyframes activeTabBreath{0%,100%{box-shadow:0 18px 36px rgba(14,165,233,.14),inset 0 1px 0 #fff}50%{box-shadow:0 21px 42px rgba(37,99,235,.22),inset 0 1px 0 #fff}}
        @keyframes iconFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
        @keyframes iconWonder{0%{transform:translateY(0) scale(1) rotate(0)}55%{transform:translateY(-2px) scale(1.08) rotate(-2deg)}100%{transform:translateY(-1px) scale(1.05) rotate(-1deg)}}
        @keyframes dashboardFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1.5px) scale(1.012)}}
        @keyframes dashboardSweep{0%,18%{transform:translateX(-130%);opacity:0}35%{opacity:.8}58%,100%{transform:translateX(130%);opacity:0}}
        @keyframes dashboardTitleFloat{0%,100%{transform:translate3d(0,0,0) scale(1);text-shadow:0 0 0 rgba(37,99,235,0)}25%{transform:translate3d(0,-1px,0) scale(1.018);text-shadow:0 2px 8px rgba(37,99,235,.1)}50%{transform:translate3d(0,-3px,0) scale(1.045);text-shadow:0 6px 16px rgba(37,99,235,.2)}75%{transform:translate3d(0,-1px,0) scale(1.018);text-shadow:0 2px 8px rgba(37,99,235,.1)}}
        @keyframes dashboardTitleLine{0%,100%{transform:scaleX(.2);opacity:.25}50%{transform:scaleX(1);opacity:.95}}
        @keyframes dashboardLine{0%,100%{transform:scaleX(.2);opacity:.25}50%{transform:scaleX(1);opacity:.8}}
        @keyframes dashboardIconFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.045)}}
        @keyframes nameIn{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pageEnter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes contentRise{from{opacity:0;transform:translateY(12px) scale(.995)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes cardEnter{from{opacity:0;transform:translateY(10px) scale(.992)}to{opacity:1;transform:translateY(0) scale(1)}}
        @media (max-width:767px){
          .nav-scroll{grid-template-columns:repeat(4,minmax(148px,1fr));overflow-x:auto}
          .nav-item{min-height:3.35rem;justify-content:flex-start;padding-left:.75rem!important}
          .event-navigation{border-radius:20px}
          .back-button{padding:.5rem .62rem}
        }
        @media (prefers-reduced-motion:reduce){
          .event-navigation-wrap,.event-navigation::before,.event-navigation::after,.event-name,:global(.event-page-motion),:global(.event-page-motion .event-motion-card),:global(.event-page-motion section),:global(.event-page-motion article){animation:none!important;transition:none!important}
          /* Interactive navigation motion stays enabled: these controls are intentionally animated. */
          .nav-item,.nav-icon,.back-button,.dashboard-link{transition:transform 220ms ease,background 220ms ease,box-shadow 220ms ease,border-color 220ms ease!important}
        }
      `}</style>

      <div className="event-navigation rounded-[22px] px-2.5 py-2.5 sm:px-3.5">
        <div className="relative flex items-center gap-2">
          <button type="button" onClick={handleBack} onMouseEnter={(event) => animateHover("back", event.currentTarget, "back")} onMouseLeave={() => stopHover("back", "back")} className="back-button text-[11px] font-bold" aria-label="Retour à la page précédente" title="Retour à la page précédente">
            <span className="back-icon">{iconMap.back}</span>
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="mx-0.5 hidden h-7 w-px shrink-0 bg-zinc-200 sm:block" />

          <nav className="nav-scroll min-w-0 flex-1 px-0.5 py-1" aria-label="Navigation de l'événement">
            {tabs.map((tab) => {
              const active = isActive(tab);
              return (
                <Link key={tab.href} href={tab.href} onMouseEnter={(event) => animateHover(tab.href, event.currentTarget, "tab")} onMouseLeave={() => stopHover(tab.href, "tab")} className={[`nav-item px-3 sm:px-4`, active ? "nav-item-active font-black" : "font-semibold"].join(" ")} aria-current={active ? "page" : undefined}>
                  <span className="nav-icon">{tab.icon}</span>
                  <span className="truncate text-[11px] tracking-[-.01em] sm:text-[13px]">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden h-6 w-px shrink-0 bg-zinc-200 lg:block" />

          <Link href="/dashboard" className="dashboard-link hidden px-3 py-2.5 text-[11px] font-bold lg:inline-flex" title="Retour au Dashboard">
            <span className="dashboard-icon">{iconMap.dashboard}</span>
            <span className="dashboard-title">Dashboard</span>
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