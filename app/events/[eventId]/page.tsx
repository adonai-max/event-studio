"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type EventItem = {
  id: string;
  name: string;
  type: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
};

type GuestSummary = {
  status: "pending" | "confirmed" | "declined" | null;
  checked_in: boolean | null;
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m8 14 2 2 4-4" /></>,
    file: <><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5A1.5 1.5 0 0 1 7.5 3.5Z" /><path d="M14 3.5V8h4M9 13h6M9 16.5h6" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" /><path d="M16 5.3a3 3 0 0 1 0 5.8M17 14a5.5 5.5 0 0 1 4.2 5.3" /></>,
    scan: <><path d="M8 3H5.5A2.5 2.5 0 0 0 3 5.5V8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" /><rect x="7" y="7" width="4" height="4" rx=".5" /><rect x="14" y="7" width="3" height="3" rx=".5" /><rect x="7" y="14" width="3" height="3" rx=".5" /><path d="M14 14h1v1h-1zM17 17h1v1h-1z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.8 1.3-1.8 2.7M12 17h.01" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  };

  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

function formatDate(value: string | null) {
  if (!value) return "À définir";
  const date = new Date(value + (value.length === 10 ? "T12:00:00" : ""));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.055] p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/10 text-sky-200"><Icon name={icon} size={19} /></span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{label}</span>
        <span className="mt-1 block truncate text-sm font-semibold text-white" title={value}>{value}</span>
      </span>
    </div>
  );
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = String(params.eventId);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [guests, setGuests] = useState<GuestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestsLoaded, setGuestsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      setLoading(true);
      setErrorMessage("");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("id, name, type, date, time, location, description")
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (!active) return;
      if (error || !data) {
        setErrorMessage("Événement introuvable ou vous n'avez pas accès à cet événement.");
        setLoading(false);
        return;
      }

      setEvent(data as EventItem);
      setLoading(false);

      const { data: guestRows, error: guestError } = await supabase
        .from("guests")
        .select("status, checked_in")
        .eq("event_id", eventId);

      if (!active) return;
      if (!guestError) setGuests((guestRows ?? []) as GuestSummary[]);
      setGuestsLoaded(!guestError);
    }

    if (eventId) void loadEvent();
    return () => { active = false; };
  }, [eventId, router]);

  const stats = useMemo(() => ({
    total: guests.length,
    confirmed: guests.filter((guest) => guest.status === "confirmed").length,
    pending: guests.filter((guest) => guest.status === "pending" || !guest.status).length,
    checkedIn: guests.filter((guest) => guest.checked_in).length,
  }), [guests]);

  const initials = (event?.name ?? "Event Studio")
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase()).join("") || "ES";

  const setupTasks = useMemo(() => {
    if (!event) return [];
    return [
      { label: "Informations de l’événement", done: Boolean(event.name && event.date && event.time && event.location) },
      { label: "Design de l’invitation", done: false, href: "/events/" + event.id + "/invitation" },
      { label: "Liste des invités", done: guestsLoaded && stats.total > 0, href: "/events/" + event.id + "/guests" },
      { label: "Confirmations des invités", done: guestsLoaded && stats.total > 0 && stats.pending === 0, href: "/events/" + event.id + "/guests" },
      { label: "Préparer le contrôle d’accès", done: false, href: "/events/" + event.id + "/control" },
    ];
  }, [event, guestsLoaded, stats.pending, stats.total]);

  const progress = setupTasks.length
    ? Math.round((setupTasks.filter((task) => task.done).length / setupTasks.length) * 100)
    : 0;

  if (loading) {
    return <main className="min-h-screen bg-[#F4F6FA] p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-14 rounded-2xl bg-white" /><div className="h-64 rounded-3xl bg-white" /><div className="grid gap-4 md:grid-cols-4"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div></div></main>;
  }

  if (!event) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl font-black text-rose-600">!</div><h1 className="mt-5 text-2xl font-black text-slate-950">Événement indisponible</h1><p className="mt-2 text-sm leading-6 text-slate-500">{errorMessage || "Impossible de charger cet événement."}</p><button onClick={() => router.push("/dashboard")} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Retour au Dashboard</button></div></main>;
  }

  const navItems = [
    { label: "Vue d’ensemble", href: "/events/" + event.id, icon: "calendar", tone: "blue", exact: true },
    { label: "Invitation", href: "/events/" + event.id + "/invitation", icon: "file", tone: "violet" },
    { label: "Invités", href: "/events/" + event.id + "/guests", icon: "users", tone: "green" },
    { label: "Event Control", href: "/events/" + event.id + "/control", icon: "scan", tone: "orange" },
  ];

  return (
    <main className="es-overview min-h-screen bg-[#F4F6FA] text-[#12213A]">
      <style jsx>{`
        .es-overview{--navy:#101d33;--blue:#2563eb;--muted:#64748b}
        .es-overview *{box-sizing:border-box}
        .es-sidebar{background:linear-gradient(180deg,#101d33 0%,#111f37 100%);color:#e2e8f0}
        .es-navlink{display:flex;align-items:center;gap:11px;border:1px solid transparent;border-radius:12px;padding:11px 12px;color:#cbd5e1;font-size:13px;font-weight:600;transition:background .2s ease,border-color .2s ease,transform .2s ease}
        .es-navlink:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.08);transform:translateX(2px)}
        .es-navlink-active{background:linear-gradient(100deg,rgba(37,99,235,.34),rgba(59,130,246,.12));border-color:rgba(96,165,250,.28);color:white;box-shadow:inset 3px 0 #60a5fa}
        .es-navicon{display:flex;width:31px;height:31px;align-items:center;justify-content:center;border-radius:10px;flex-shrink:0}
        .tone-blue .es-navicon{background:rgba(96,165,250,.15);color:#93c5fd}.tone-violet .es-navicon{background:rgba(167,139,250,.15);color:#c4b5fd}.tone-green .es-navicon{background:rgba(52,211,153,.15);color:#6ee7b7}.tone-orange .es-navicon{background:rgba(251,146,60,.15);color:#fdba74}
        .es-stat{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}.es-stat:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(15,23,42,.07);border-color:#cbd5e1}
        .es-quick{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}.es-quick:hover{transform:translateY(-3px);box-shadow:0 14px 28px rgba(15,23,42,.07)}
        @media(prefers-reduced-motion:reduce){.es-navlink,.es-stat,.es-quick{transition:none}.es-navlink:hover,.es-stat:hover,.es-quick:hover{transform:none}}
      `}</style>

      <div className="mx-auto min-h-screen max-w-[1600px] lg:grid lg:grid-cols-[238px_minmax(0,1fr)]">
        <aside className="es-sidebar flex flex-col gap-7 px-4 py-5 lg:sticky lg:top-0 lg:h-screen">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-950/30"><Icon name="calendar" size={22} /></span>
            <span><span className="block text-[15px] font-extrabold tracking-tight text-white">Event Studio</span><span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</span></span>
          </Link>

          <div className="hidden h-px bg-white/10 lg:block" />
          <div className="hidden lg:block">
            <p className="mb-3 px-3 text-[9px] font-extrabold uppercase tracking-[.18em] text-slate-500">Espace principal</p>
            <Link href="/dashboard" className="es-navlink"><span className="es-navicon text-blue-300"><Icon name="grid" size={18} /></span>Dashboard</Link>
          </div>

          <div className="min-w-0">
            <p className="mb-3 hidden px-3 text-[9px] font-extrabold uppercase tracking-[.18em] text-slate-500 lg:block">Votre événement</p>
            <nav aria-label="Navigation de l’événement" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-1">
              {navItems.map((item) => {
                const active = item.exact ? true : false;
                return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`es-navlink tone-${item.tone} ${active ? "es-navlink-active" : ""}`}><span className="es-navicon"><Icon name={item.icon} size={18} /></span><span>{item.label}</span>{active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-sky-300 lg:block" />}</Link>;
              })}
            </nav>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[.035] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">Événement actif</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-200" title={event.name}>{event.name}</p>
            </div>
          </div>

          <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/[.04] p-3 lg:block">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-400/10 text-sky-200"><Icon name="help" size={17} /></span>
            <p className="mt-3 text-xs font-bold text-white">Besoin d’aide ?</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">Retrouvez les conseils pour organiser votre événement.</p>
          </div>
          <div className="hidden items-center gap-3 border-t border-white/10 px-2 pt-4 lg:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-700">{initials}</span>
            <span className="min-w-0"><span className="block text-xs font-bold text-white">Espace organisateur</span><span className="block text-[10px] text-slate-400">Compte connecté</span></span>
          </div>
        </aside>

        <section className="min-w-0 px-4 pb-10 pt-5 sm:px-6 lg:px-9 lg:pt-7">
          <header className="mb-7 flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-xs text-slate-500"><Link href="/dashboard" className="hover:text-blue-700">Mes événements</Link><span className="mx-2 text-slate-300">/</span><span className="font-semibold text-slate-700">Vue d’ensemble</span></p><p className="mt-1 hidden text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 sm:block">Centre de pilotage événementiel</p></div>
            <div className="flex items-center gap-3"><button type="button" aria-label="Notifications" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 sm:flex"><Icon name="bell" size={18} /></button><span className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white text-xs font-extrabold text-slate-700 shadow-sm">{initials}</span></div>
          </header>

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0"><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.17em] text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{event.type || "Événement"}</div><h1 className="break-words text-3xl font-extrabold tracking-[-.04em] text-[#12213A] sm:text-4xl">{event.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Préparez chaque détail, de la première invitation jusqu’au contrôle des entrées.</p></div>
            <Link href={"/events/" + event.id + "/edit"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700"><Icon name="edit" size={16} />Modifier l’événement</Link>
          </div>

          <section className="relative mb-6 overflow-hidden rounded-[25px] bg-[#102544] p-5 text-white shadow-[0_22px_50px_rgba(15,35,65,.14)] sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-sky-200/10" /><div className="pointer-events-none absolute -right-4 -top-12 h-44 w-44 rounded-full border border-sky-200/10" /><div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 bg-gradient-to-tl from-blue-500/20 to-transparent" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-center">
              <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-sky-300">Votre espace événementiel</p><h2 className="mt-3 max-w-2xl text-2xl font-extrabold tracking-[-.03em] sm:text-3xl">Le grand jour se prépare ici.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Retrouvez les informations essentielles, organisez vos invités et préparez un accueil fluide.</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3"><Detail icon="calendar" label="Date" value={formatDate(event.date)} /><Detail icon="clock" label="Heure" value={event.time || "À définir"} /><Detail icon="pin" label="Lieu" value={event.location || "À définir"} /></div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-4 lg:flex-col lg:items-start"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sky-200/20 bg-gradient-to-br from-sky-300/20 to-indigo-400/10 text-xl font-black tracking-wider text-sky-100">{initials}</span><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Votre événement</p><p className="mt-1 text-sm font-bold text-white">Un espace, tout votre événement.</p><p className="mt-1 text-xs leading-5 text-slate-400">Créez. Organisez. Contrôlez.</p></div></div>
            </div>
          </section>

          <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistiques des invités">
            {[
              { label: "Invités", value: guestsLoaded ? stats.total : "—", note: "Total enregistré", icon: "users", color: "blue" },
              { label: "Confirmés", value: guestsLoaded ? stats.confirmed : "—", note: "Présence confirmée", icon: "check", color: "green" },
              { label: "En attente", value: guestsLoaded ? stats.pending : "—", note: "Réponses attendues", icon: "clock", color: "amber" },
              { label: "Entrées", value: guestsLoaded ? stats.checkedIn : "—", note: "Accès enregistrés", icon: "scan", color: "orange" },
            ].map((stat) => <article key={stat.label} className="es-stat rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,.025)] sm:p-5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{stat.label}</span><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color === "blue" ? "bg-blue-50 text-blue-600" : stat.color === "green" ? "bg-emerald-50 text-emerald-600" : stat.color === "amber" ? "bg-amber-50 text-amber-600" : "bg-orange-50 text-orange-600"}`}><Icon name={stat.icon} size={18} /></span></div><p className="mt-4 text-3xl font-extrabold tracking-tight text-[#12213A]">{stat.value}</p><p className="mt-1 text-[11px] text-slate-400">{stat.note}</p></article>)}
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,.025)] sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-extrabold text-[#12213A]">Préparation de l’événement</h2><p className="mt-1 text-xs text-slate-500">Les étapes essentielles avant le jour J.</p></div><span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-extrabold text-blue-700">{progress}%</span></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-[width] duration-500" style={{ width: progress + "%" }} /></div>
              <div className="mt-5 space-y-1">{setupTasks.map((task) => <div key={task.label} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${task.done ? "bg-emerald-50 text-emerald-600" : "border border-slate-200 text-slate-300"}`}><Icon name={task.done ? "check" : "calendar"} size={14} /></span><span className={`flex-1 text-xs font-semibold ${task.done ? "text-slate-500" : "text-slate-700"}`}>{task.label}</span>{task.done ? <span className="text-[10px] font-bold text-emerald-600">Terminé</span> : task.href ? <Link href={task.href} className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Configurer →</Link> : <span className="text-[10px] text-slate-400">À compléter</span>}</div>)}</div>
              <Link href={"/events/" + event.id + "/edit"} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700">Continuer la préparation <Icon name="arrow" size={15} /></Link>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,.025)] sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-extrabold text-[#12213A]">Prochaines actions</h2><p className="mt-1 text-xs text-slate-500">Les raccourcis pour avancer maintenant.</p></div><span className="rounded-xl bg-slate-50 p-2 text-slate-500"><Icon name="arrow" size={17} /></span></div>
              <div className="mt-4 space-y-3">
                <Link href={"/events/" + event.id + "/invitation"} className="es-quick flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Icon name="file" size={19} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">Personnaliser l’invitation</span><span className="mt-1 block text-[11px] text-slate-500">Donnez un style unique à votre événement.</span></span><Icon name="arrow" size={16} /></Link>
                <Link href={"/events/" + event.id + "/guests"} className="es-quick flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon name="users" size={19} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">Gérer les invités</span><span className="mt-1 block text-[11px] text-slate-500">Ajoutez des personnes et suivez les réponses.</span></span><Icon name="arrow" size={16} /></Link>
                <Link href={"/events/" + event.id + "/control"} className="es-quick flex items-center gap-3 rounded-xl border border-slate-100 p-3.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon name="scan" size={19} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-800">Ouvrir Event Control</span><span className="mt-1 block text-[11px] text-slate-500">Préparez le contrôle des entrées par QR.</span></span><Icon name="arrow" size={16} /></Link>
              </div>
              {event.description && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">À propos de l’événement</p><p className="mt-2 text-xs leading-5 text-slate-600">{event.description}</p></div>}
            </article>
          </section>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5"><p className="text-[11px] font-medium text-slate-400">Event Studio <span className="mx-1.5">·</span> Organisez des moments inoubliables.</p><Link href="/dashboard" className="text-xs font-bold text-slate-500 transition hover:text-blue-700">← Retour au Dashboard</Link></footer>
        </section>
      </div>
    </main>
  );
}
