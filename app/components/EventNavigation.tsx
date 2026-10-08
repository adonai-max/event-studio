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
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v10A1.5 1.5 0 0 1 20 18.5H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5Z" /><path d="m3.5 7 8.5 6 8.5-6" /><path d="M7.5 10.2 4 17M16.5 10.2 20 17" /></svg>
  ),
  guests: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="8" r="3" /><path d="M3 19.5a5.5 5.5 0 0 1 11 0" /><circle cx="17.2" cy="9" r="2.4" /><path d="M14.7 19.5a4.1 4.1 0 0 1 6.1-3.55" /><path d="M5.5 15.2c1.8.7 4.2.7 6 0" /></svg>
  ),
  control: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 8h10M7 12h10M7 16h6" /><circle cx="17" cy="16" r="1.6" /></svg>
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
            { transform: "translate3d(0,-3px,0) scale(1.02)", offset: 0.45 },
            { transform: "translate3d(0,-1px,0) scale(1.01)", offset: 0.72 },
            { transform: "translate3d(0,-2px,0) scale(1.015)" },
          ],
      { duration: type === "back" ? 1700 : 2400, iterations: Infinity, easing: "cubic-bezier(.22,1,.36,1)" }
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
        .nav-scroll{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:stretch;gap:.5rem;overflow-x:visible;scrollbar-width:none;-ms-overflow-style:none;padding:.1rem}
        .nav-scroll::-webkit-scrollbar{width:0;height:0;display:none}
        .nav-item{position:relative;z-index:1;display:flex;will-change:transform;min-width:0;align-items:center;justify-content:center;gap:.68rem;min-height:3.8rem;border:1px solid rgba(226,232,240,.9);border-radius:1rem;color:#0f172a!important;background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(241,245,249,.78));overflow:hidden;transform:translateZ(0);transition:transform 420ms cubic-bezier(.16,1,.3,1),background 260ms ease,border-color 260ms ease,box-shadow 320ms ease;transform-origin:center center}
        .nav-item::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 22%,rgba(255,255,255,.9) 48%,transparent 72%);transform:translateX(-125%);transition:transform 800ms cubic-bezier(.22,1,.36,1)}
        .nav-item::after{content:"";position:absolute;left:12%;right:12%;bottom:-5px;height:3px;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#2563eb,#818cf8);opacity:0;transform:scaleX(.35);transition:opacity 250ms ease,transform 350ms cubic-bezier(.22,1,.36,1)}
        .nav-item:hover{z-index:50;animation:tabWonderLoop 2.4s cubic-bezier(.22,1,.36,1) infinite;background:linear-gradient(145deg,#ffffff 0%,#effaff 55%,#e0f2fe 100%);border-color:rgba(14,165,233,.72);box-shadow:0 20px 42px rgba(14,165,233,.24),0 0 0 3px rgba(56,189,248,.08),inset 0 1px 0 #fff}
        .nav-item:hover::before{transform:translateX(125%)}
        .nav-item:hover .nav-label{transform:translateX(2px) scale(1.035);transition:transform 260ms cubic-bezier(.22,1,.36,1)}.nav-item:hover .nav-label{color:#075985!important;text-shadow:0 2px 8px rgba(14,165,233,.1)}
        .nav-item:focus-visible{outline:2px solid rgba(37,99,235,.55);outline-offset:2px}
        .nav-item-active{color:#0f172a!important;background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);border-color:rgba(148,163,184,.42);box-shadow:0 18px 36px rgba(15,23,42,.10),inset 0 1px 0 #fff;animation:activeTabBreath 3.6s ease-in-out infinite}
        .nav-item-active::after{opacity:1;transform:scaleX(1);animation:navActive .45s cubic-bezier(.22,1,.36,1) both}
        .nav-icon{position:relative;display:inline-flex;width:2.15rem;height:2.15rem;flex:0 0 auto;align-items:center;justify-content:center;border-radius:.72rem;font-size:.98rem;color:#334155!important;background:linear-gradient(145deg,#ffffff,#f1f5f9);border:1px solid rgba(226,232,240,.95);box-shadow:0 5px 12px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.98);transition:transform 320ms cubic-bezier(.22,1,.36,1),background 260ms ease,color 260ms ease,box-shadow 320ms ease,border-color 260ms ease}
        .nav-icon{transform-style:preserve-3d;perspective:700px;isolation:isolate;overflow:visible;box-shadow:inset 0 1px 0 rgba(255,255,255,.98),inset 0 -3px 0 rgba(15,23,42,.07),0 7px 0 rgba(15,23,42,.055),0 12px 20px rgba(15,23,42,.13)}
        .nav-icon::after{content:"";position:absolute;inset:1px 1px auto;height:44%;border-radius:.65rem .65rem .4rem .4rem;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,0));pointer-events:none;z-index:2}
        .nav-icon svg{filter:drop-shadow(0 2px 1px rgba(15,23,42,.22));transform:translateZ(8px);transition:transform 320ms cubic-bezier(.22,1,.36,1),filter 320ms ease}
        .nav-item:hover .nav-icon{transform:translateY(-3px) rotateX(9deg) rotateY(-7deg) scale(1.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.98),inset 0 -2px 0 rgba(15,23,42,.06),0 5px 0 rgba(15,23,42,.06),0 16px 25px rgba(15,23,42,.19)}
        .nav-item:hover .nav-icon svg{transform:translate3d(0,-1px,12px) scale(1.06);filter:drop-shadow(0 4px 2px rgba(15,23,42,.24))}
        .nav-item-active .nav-icon{box-shadow:inset 0 1px 0 rgba(255,255,255,.48),inset 0 -3px 0 rgba(15,23,42,.18),0 5px 0 rgba(15,23,42,.08),0 13px 24px rgba(15,23,42,.2)}
        .nav-icon::before{content:"";position:absolute;inset:2px;border-radius:.58rem;opacity:.12;pointer-events:none;background:currentColor;transition:opacity 260ms ease,transform 320ms ease}
        .nav-icon-halo{position:absolute;inset:-5px;border-radius:.9rem;border:1px solid currentColor;opacity:0;transform:scale(.82);pointer-events:none;transition:opacity 280ms ease,transform 420ms cubic-bezier(.22,1,.36,1);filter:blur(.2px)}
        .nav-item:hover .nav-icon-halo{opacity:.24;transform:scale(1.08)}
        .nav-item-active .nav-icon-halo{opacity:.16;transform:scale(1.04);animation:iconHalo 2.8s ease-in-out infinite}
        .nav-label{position:relative;z-index:1;transition:transform 260ms cubic-bezier(.22,1,.36,1),color 260ms ease}
        .nav-icon svg{position:relative;z-index:1;width:1.12rem;height:1.12rem;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
        .nav-item:nth-child(1) .nav-icon{color:#2563eb!important;background:linear-gradient(145deg,#eff6ff,#dbeafe);border-color:rgba(147,197,253,.7);box-shadow:0 6px 15px rgba(37,99,235,.14),inset 0 1px 0 #fff}
        .nav-item:nth-child(2) .nav-icon{color:#7c3aed!important;background:linear-gradient(145deg,#f5f3ff,#ede9fe);border-color:rgba(196,181,253,.72);box-shadow:0 6px 15px rgba(124,58,237,.13),inset 0 1px 0 #fff}
        .nav-item:nth-child(3) .nav-icon{color:#059669!important;background:linear-gradient(145deg,#ecfdf5,#d1fae5);border-color:rgba(110,231,183,.72);box-shadow:0 6px 15px rgba(5,150,105,.13),inset 0 1px 0 #fff}
        .nav-item:nth-child(4) .nav-icon{color:#ea580c!important;background:linear-gradient(145deg,#fff7ed,#ffedd5);border-color:rgba(253,186,116,.72);box-shadow:0 6px 15px rgba(234,88,12,.13),inset 0 1px 0 #fff}
        .nav-item:hover .nav-icon{animation:iconWonder .9s cubic-bezier(.16,1,.3,1) both;transform:translateY(-2px) scale(1.04);box-shadow:0 10px 20px rgba(15,23,42,.12),inset 0 1px 0 #fff}
        .nav-item:nth-child(1):hover .nav-icon{box-shadow:0 10px 22px rgba(37,99,235,.24),inset 0 1px 0 #fff}
        .nav-item:nth-child(2):hover .nav-icon{box-shadow:0 10px 22px rgba(124,58,237,.23),inset 0 1px 0 #fff}
        .nav-item:nth-child(3):hover .nav-icon{box-shadow:0 10px 22px rgba(5,150,105,.23),inset 0 1px 0 #fff}
        .nav-item:nth-child(4):hover .nav-icon{box-shadow:0 10px 22px rgba(234,88,12,.23),inset 0 1px 0 #fff}
        .nav-item:hover .nav-icon::before{opacity:.2;transform:scale(1.04)}
        .nav-item-active .nav-icon{color:#fff!important;background:linear-gradient(135deg,#2563eb,#4f46e5);border-color:rgba(255,255,255,.82);box-shadow:0 9px 22px rgba(37,99,235,.26),0 0 0 3px rgba(59,130,246,.08);animation:iconFloat 2.8s ease-in-out infinite}
        .nav-item-active .nav-icon::before{opacity:.16;background:#fff}
        .nav-item-active:nth-child(1){color:#1d4ed8!important;background:linear-gradient(135deg,#eff6ff,#ffffff);border-color:rgba(96,165,250,.48);box-shadow:0 18px 36px rgba(37,99,235,.13),inset 0 1px 0 #fff}
        .nav-item-active:nth-child(1) .nav-icon{background:linear-gradient(135deg,#2563eb,#1d4ed8);box-shadow:0 9px 22px rgba(37,99,235,.28),0 0 0 3px rgba(59,130,246,.08)}
        .nav-item-active:nth-child(2){color:#6d28d9!important;background:linear-gradient(135deg,#f5f3ff,#ffffff);border-color:rgba(167,139,250,.48);box-shadow:0 18px 36px rgba(124,58,237,.12),inset 0 1px 0 #fff}
        .nav-item-active:nth-child(2) .nav-icon{background:linear-gradient(135deg,#7c3aed,#6d28d9);box-shadow:0 9px 22px rgba(124,58,237,.27),0 0 0 3px rgba(139,92,246,.08)}
        .nav-item-active:nth-child(3){color:#047857!important;background:linear-gradient(135deg,#ecfdf5,#ffffff);border-color:rgba(52,211,153,.48);box-shadow:0 18px 36px rgba(5,150,105,.12),inset 0 1px 0 #fff}
        .nav-item-active:nth-child(3) .nav-icon{background:linear-gradient(135deg,#059669,#047857);box-shadow:0 9px 22px rgba(5,150,105,.27),0 0 0 3px rgba(16,185,129,.08)}
        .nav-item-active:nth-child(4){color:#c2410c!important;background:linear-gradient(135deg,#fff7ed,#ffffff);border-color:rgba(251,146,60,.5);box-shadow:0 18px 36px rgba(234,88,12,.12),inset 0 1px 0 #fff}
        .nav-item-active:nth-child(4) .nav-icon{background:linear-gradient(135deg,#ea580c,#c2410c);box-shadow:0 9px 22px rgba(234,88,12,.27),0 0 0 3px rgba(249,115,22,.08)}
        .nav-item-active .nav-icon svg{filter:drop-shadow(0 1px 2px rgba(15,23,42,.24))}
        .back-button{position:relative;display:inline-flex;align-items:center;gap:.5rem;border:1px solid rgba(186,230,253,.95);padding:.46rem .78rem .46rem .5rem;border-radius:1rem;background:linear-gradient(145deg,#ffffff,#f0f9ff);color:#0f3f67!important;box-shadow:0 8px 20px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.95);white-space:nowrap;overflow:hidden;transition:transform 280ms cubic-bezier(.22,1,.36,1),box-shadow 280ms ease,border-color 220ms ease,background 220ms ease}
        .back-button::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 25%,rgba(255,255,255,.9) 48%,transparent 70%);transform:translateX(-120%);transition:transform 650ms cubic-bezier(.16,1,.3,1)}\n        .back-button:hover{animation:backWonder 1.7s cubic-bezier(.22,1,.36,1) infinite;color:#075985!important;background:linear-gradient(145deg,#fff,#e0f2fe);border-color:rgba(14,165,233,.48);box-shadow:0 12px 26px rgba(37,99,235,.14),inset 0 1px 0 #fff}\n        .back-button:hover::before{transform:translateX(120%)}
        .back-icon{display:inline-flex;width:2rem;height:2rem;align-items:center;justify-content:center;border-radius:.72rem;background:linear-gradient(135deg,#e0f2fe,#dbeafe);color:#2563eb;box-shadow:inset 0 0 0 1px rgba(147,197,253,.55),0 4px 10px rgba(37,99,235,.1);transition:transform 300ms cubic-bezier(.22,1,.36,1),background 220ms ease,box-shadow 220ms ease}
        .back-icon svg{width:1.08rem;height:1.08rem;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform 300ms cubic-bezier(.22,1,.36,1)}\n        .back-button:hover .back-icon{transform:translateX(-2px) scale(1.05);background:linear-gradient(135deg,#bae6fd,#bfdbfe);box-shadow:inset 0 0 0 1px rgba(96,165,250,.5),0 6px 14px rgba(37,99,235,.15)}\n        .back-button:hover .back-icon svg{transform:translateX(-2px)}
        .dashboard-link{position:relative;display:inline-flex;align-items:center;gap:.62rem;overflow:hidden;isolation:isolate;animation:dashboardFloat 3.8s ease-in-out infinite;transition:transform 800ms cubic-bezier(.16,1,.3,1),color 420ms ease,background 420ms ease,box-shadow 520ms ease,border-color 420ms ease;border-radius:1rem;border:1px solid rgba(147,197,253,.28);padding-left:.78rem!important;padding-right:.9rem!important;color:#0f3f67!important;will-change:transform}.dashboard-link::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(110deg,transparent 14%,rgba(255,255,255,.88) 46%,transparent 78%);transform:translateX(-130%);animation:dashboardSweep 4.6s ease-in-out infinite}.dashboard-link::after{content:"";position:absolute;left:9%;right:9%;bottom:2px;height:2px;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#2563eb,#818cf8);transform:scaleX(.2);transform-origin:center;opacity:.45;animation:dashboardLine 3.8s ease-in-out infinite}.dashboard-link:hover{transform:translateY(-3px) scale(1.045);color:#1d4ed8!important;background:linear-gradient(145deg,rgba(255,255,255,.99),rgba(219,234,254,.88));border-color:rgba(96,165,250,.5);box-shadow:0 14px 30px rgba(37,99,235,.17),0 0 0 2px rgba(96,165,250,.1)}
        .dashboard-icon{display:inline-flex;width:1.85rem;height:1.85rem;align-items:center;justify-content:center;border-radius:.62rem;color:#fff!important;background:linear-gradient(135deg,#0ea5e9,#2563eb);box-shadow:0 5px 13px rgba(37,99,235,.22);animation:dashboardIconFloat 2.8s ease-in-out infinite;transition:transform 520ms cubic-bezier(.16,1,.3,1),box-shadow 420ms ease}.dashboard-link:hover .dashboard-icon{transform:translateY(-1px) scale(1.05) rotate(-2deg);box-shadow:0 8px 18px rgba(37,99,235,.24)}
        .dashboard-icon svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.dashboard-title{position:relative;display:inline-flex;align-items:center;justify-content:center;min-width:5.5rem;font-size:.76rem;line-height:1;font-weight:900;letter-spacing:.055em;color:#1e40af!important;text-align:center;white-space:nowrap;transform-origin:center;animation:dashboardIconFloat 2.8s ease-in-out infinite;transition:transform 700ms cubic-bezier(.16,1,.3,1),letter-spacing 500ms ease,text-shadow 500ms ease}.dashboard-link:hover .dashboard-title{transform:translateY(-2px) scale(1.045);letter-spacing:.075em;text-shadow:0 5px 15px rgba(37,99,235,.22)}
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
        @keyframes tabWonderLoop{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-2px,0) scale(1.018)}}
        @keyframes backWonder{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-2px,-1px,0) scale(1.025)}}
        @keyframes ambientDrift{from{transform:translate3d(-1%,-1%,0) scale(1)}to{transform:translate3d(2%,2%,0) scale(1.04)}}
        @keyframes lightSweep{0%,18%{transform:translateX(-170%) skewX(-18deg);opacity:0}35%{opacity:.78}62%,100%{transform:translateX(470%) skewX(-18deg);opacity:0}}
        @keyframes navActive{0%{opacity:0;transform:scaleX(.35)}60%{opacity:1;transform:scaleX(1.06)}100%{opacity:1;transform:scaleX(1)}}
        @keyframes activeTabBreath{0%,100%{transform:translateY(0);box-shadow:0 18px 36px rgba(15,23,42,.08),inset 0 1px 0 #fff}50%{transform:translateY(-1px);box-shadow:0 21px 42px rgba(37,99,235,.14),inset 0 1px 0 #fff}}
        @keyframes iconFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
        @keyframes iconWonder{0%{transform:translateY(0) scale(1) rotate(0)}55%{transform:translateY(-2px) scale(1.08) rotate(-2deg)}100%{transform:translateY(-1px) scale(1.05) rotate(-1deg)}}
        @keyframes iconHalo{0%,100%{opacity:.12;transform:scale(1.02)}50%{opacity:.25;transform:scale(1.09)}}
        @keyframes dashboardFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1.5px) scale(1.012)}}
        @keyframes dashboardSweep{0%,18%{transform:translateX(-130%);opacity:0}35%{opacity:.8}58%,100%{transform:translateX(130%);opacity:0}}
        
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
                  <span className="nav-icon"><span className="nav-icon-halo" />{tab.icon}</span>
                  <span className="nav-label truncate text-[11px] tracking-[-.01em] sm:text-[13px]">
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
