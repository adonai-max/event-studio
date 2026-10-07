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
  const dashboardAnimation = useRef<Animation | null>(null);

  function animateHover(key: string, element: HTMLElement | null, type: "tab" | "back" | "dashboard") {
    if (!element || typeof element.animate !== "function") return;
    const store = type === "back" ? backAnimation : type === "dashboard" ? dashboardAnimation : hoverAnimations;
    const current = type === "tab" ? hoverAnimations.current.get(key) : store.current;
    current?.cancel();

    const animation = element.animate(
      type === "dashboard"
        ? [
            { transform: "translate3d(0,0,0) scale(1)", filter: "brightness(1)" },
            { transform: "translate3d(0,-2px,0) scale(1.025)", filter: "brightness(1.035)", offset: 0.42 },
            { transform: "translate3d(0,-1px,0) scale(1.015)", filter: "brightness(1.015)", offset: 0.72 },
            { transform: "translate3d(0,0,0) scale(1)", filter: "brightness(1)" },
          ]
        : type === "back"
          ? [
              { transform: "translate3d(0,0,0) scale(1)" },
              { transform: "translate3d(-3px,-1px,0) scale(1.025)", offset: 0.38 },
              { transform: "translate3d(-1px,0,0) scale(1.012)", offset: 0.7 },
              { transform: "translate3d(0,0,0) scale(1)" },
            ]
          : [
              { transform: "translate3d(0,0,0) scale(1)" },
              { transform: "translate3d(0,-3px,0) scale(1.018)", offset: 0.34 },
              { transform: "translate3d(0,-5px,0) scale(1.035)", offset: 0.58 },
              { transform: "translate3d(0,-2px,0) scale(1.018)", offset: 0.8 },
              { transform: "translate3d(0,0,0) scale(1)" },
            ],
      { duration: type === "tab" ? 680 : 560, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
    );
    if (type === "back") backAnimation.current = animation;
    else if (type === "dashboard") dashboardAnimation.current = animation;
    else hoverAnimations.current.set(key, animation);
  }}