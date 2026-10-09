"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type EventNavigationProps = {
  eventId?: string;
  eventName?: string;
  backHref?: string;
};

function NavIcon({ name }: { name: "overview" | "invitation" | "guests" | "control" | "dashboard" }) {
  const paths = {
    overview: <><rect x="3.5" y="4.5" width="17" height="16" rx="2.5" /><path d="M8 2.8v3.5M16 2.8v3.5M3.5 9.5h17" /></>,
    invitation: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
    guests: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1.2a6 6 0 0 1 12 0V20M16 5.5a3 3 0 0 1 0 5.8M18 14a4 4 0 0 1 3 3.8V20" /></>,
    control: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><path d="M15 15h2v2h-2zM19 15h2M19 19v2M15 19h2" /></>,
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function EventNavigation({ eventId, eventName, backHref = "/dashboard" }: EventNavigationProps) {
  const pathname = usePathname();
  const tabs = eventId ? [
    { href: `/events/${eventId}`, label: "Vue d’ensemble", shortLabel: "Vue d’ensemble", icon: "overview" as const, exact: true },
    { href: `/events/${eventId}/invitation`, label: "Invitation", shortLabel: "Invitation", icon: "invitation" as const, exact: false },
    { href: `/events/${eventId}/guests`, label: "Invités", shortLabel: "Invités", icon: "guests" as const, exact: false },
    { href: `/events/${eventId}/control`, label: "Event Control", shortLabel: "Event Control", icon: "control" as const, exact: false },
  ] : [];

  return (
    <nav aria-label="Navigation de l’événement" className="es-event-nav">
      <div className="es-event-nav__context">
        <Link href={backHref} className="es-event-nav__back" aria-label="Retour au Dashboard">
          <NavIcon name="dashboard" />
          <span>Dashboard</span>
        </Link>
        {eventName ? <span className="es-event-nav__event" title={eventName}>{eventName}</span> : null}
      </div>
      <div className="es-event-nav__tabs">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined}
              className={`es-event-nav__tab${active ? " is-active" : ""}`}>
              <NavIcon name={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
