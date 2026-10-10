"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type EventItem = {
  id: string; name: string; type: string | null; date: string | null; time: string | null;
  location: string | null; description: string | null; created_at: string;
};
type GuestItem = {
  id: string; event_id: string; status: "pending" | "confirmed" | "declined";
  checked_in: boolean; created_at: string | null; updated_at: string | null;
};
type EventStatus = { label: string; tone: "gray" | "blue" | "green" | "purple" };

function getEventStatus(event: EventItem): EventStatus {
  if (!event.date) return { label: "Brouillon", tone: "gray" };
  const eventDate = new Date(event.date + "T23:59:59"), now = new Date();
  if (eventDate < now) return { label: "Terminé", tone: "purple" };
  return { label: Math.ceil((eventDate.getTime() - now.getTime()) / 86400000) <= 7 ? "Actif" : "Programmé",
    tone: Math.ceil((eventDate.getTime() - now.getTime()) / 86400000) <= 7 ? "green" : "blue" };
}
function formatDate(date: string | null) {
  if (!date) return "Date à définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date + "T12:00:00"));
}
function formatShortDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(date + "T12:00:00"));
}
function getDaysUntil(date: string | null) {
  if (!date) return null;
  const diff = new Date(date + "T23:59:59").getTime() - Date.now();
  return diff < 0 ? null : Math.ceil(diff / 86400000);
}
function formatActivityDate(date: string | null) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return "À l’instant";
  if (diff < 3600000) return "Il y a " + Math.floor(diff / 60000) + " min";
  if (diff < 86400000) return "Il y a " + Math.floor(diff / 3600000) + " h";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}
function StatusBadge({ status }: { status: EventStatus }) {
  const styles = { gray: "bg-zinc-100 text-zinc-600", blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", purple: "bg-violet-50 text-violet-700" };
  const dots = { gray: "bg-zinc-400", blue: "bg-blue-500", green: "bg-emerald-500", purple: "bg-violet-500" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles[status.tone]}`}><span className={`h-1.5 w-1.5 rounded-full ${dots[status.tone]} `} />{status.label}</span>;
}
function StatCard({ icon, label, value, detail }: { icon: "events" | "invitations" | "confirmed" | "checkin"; label: string; value: number; detail: string }) {
  const iconPaths = {
    events: <><rect x="3.5" y="4.5" width="17" height="16" rx="2.5" /><path d="M8 2.8v3.5M16 2.8v3.5M3.5 9.5h17" /></>,
    invitations: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
    confirmed: <><path d="m5 12 4.5 4.5L19 7" /></>,
    checkin: <><path d="M4 12h4l2.5-7 4.5 14 2.5-7H21" /></>,
  };
  const iconTone = { events: "bg-blue-50 text-blue-700 ring-blue-100", invitations: "bg-blue-50 text-blue-700 ring-blue-100", confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-100", checkin: "bg-violet-50 text-violet-700 ring-violet-100" };
  return <div className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_12px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-4">
    <div className="flex min-w-0 items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconTone[icon]}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[icon]}</svg>
      </div>
      <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold leading-none tracking-tight text-slate-950">{value}</p><p className="mt-2 truncate text-xs text-slate-500">{detail}</p></div>
    </div>
  </div>;
}
function ProgressBar({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div><div className="flex justify-between text-xs"><span className="font-medium text-zinc-500">{label}</span><span className="font-bold tabular-nums text-zinc-800">{safeValue}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out" style={{ width: safeValue + "%" }} /></div></div>;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [userName, setUserName] = useState("Adonaï");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [motionReady, setMotionReady] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"all" | "upcoming" | "drafts" | "completed">("all");

  useEffect(() => { const frame = requestAnimationFrame(() => setMotionReady(true)); return () => cancelAnimationFrame(frame); }, []);
  useEffect(() => {
    if (!eventMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEventMenuOpen(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [eventMenuOpen]);
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true); setErrorMessage("");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setErrorMessage("Vous devez être connecté pour voir votre Dashboard."); setLoading(false); return; }
      const metadataName = user.user_metadata?.first_name || user.user_metadata?.full_name?.trim().split(/\s+/)[0] || user.user_metadata?.name?.trim().split(/\s+/)[0] || user.email?.split("@")[0];
      if (metadataName) setUserName(metadataName);
      const { data: eventsData, error: eventsError } = await supabase.from("events").select("id, name, type, date, time, location, description, created_at").eq("owner_id", user.id).order("created_at", { ascending: false });
      if (eventsError) { console.error(eventsError); setErrorMessage("Impossible de charger vos événements."); setLoading(false); return; }
      const loadedEvents = eventsData ?? []; setEvents(loadedEvents);
      if (!loadedEvents.length) { setGuests([]); setLoading(false); return; }
      const { data: guestsData, error: guestsError } = await supabase.from("guests").select("id, event_id, status, checked_in, created_at, updated_at").in("event_id", loadedEvents.map(e => e.id)).order("updated_at", { ascending: false });
      if (guestsError) { console.error(guestsError); setErrorMessage("Les événements sont chargés, mais les statistiques des invités sont indisponibles."); setGuests([]); setLoading(false); return; }
      setGuests(guestsData ?? []); setLoading(false);
    };
    void loadDashboard();
  }, []);

  async function handleDuplicateEvent(eventId: string) {
    setErrorMessage("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { setErrorMessage("Votre session a expiré. Veuillez vous reconnecter."); return; }
    const { data: originalEvent, error: eventError } = await supabase.from("events").select("name, type, date, time, location, description, owner_id").eq("id", eventId).eq("owner_id", user.id).single();
    if (eventError || !originalEvent) { setErrorMessage("Impossible de récupérer l’événement à dupliquer."); return; }
    const { data: duplicatedEvent, error: duplicateError } = await supabase.from("events").insert({ owner_id: user.id, name: originalEvent.name + " — Copie", type: originalEvent.type, date: originalEvent.date, time: originalEvent.time, location: originalEvent.location, description: originalEvent.description }).select("id, name, type, date, time, location, description, created_at").single();
    if (duplicateError || !duplicatedEvent) { setErrorMessage("Impossible de créer la copie de l’événement."); return; }
    const { data: originalGuests, error: guestsError } = await supabase.from("guests").select("type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug").eq("event_id", eventId);
    if (guestsError) { setEvents(c => [duplicatedEvent, ...c]); setErrorMessage("Événement dupliqué, mais les invités n’ont pas pu être copiés."); return; }
    if (originalGuests?.length) {
      const duplicatedGuests = originalGuests.map(guest => ({ event_id: duplicatedEvent.id, type: guest.type, first_name_1: guest.first_name_1, last_name_1: guest.last_name_1, first_name_2: guest.first_name_2, last_name_2: guest.last_name_2, whatsapp: guest.whatsapp, status: "pending", slug: guest.slug + "-copy-" + Math.random().toString(36).slice(2, 8), checked_in: false, checked_in_at: null }));
      const { data: copiedGuests, error } = await supabase.from("guests").insert(duplicatedGuests).select("id, event_id, status, checked_in, created_at, updated_at");
      if (error) { setEvents(c => [duplicatedEvent, ...c]); setErrorMessage("Événement dupliqué, mais les invités n’ont pas pu être copiés."); return; }
      setGuests(c => [...(copiedGuests ?? []), ...c]);
    }
    setEvents(c => [duplicatedEvent, ...c]);
  }
  async function handleDeleteEvent(eventId: string, eventName: string) {
    if (!window.confirm('Supprimer l’événement "' + eventName + '" ? Cette action est irréversible.')) return;
    setErrorMessage("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { setErrorMessage("Votre session a expiré. Veuillez vous reconnecter."); return; }
    const { error } = await supabase.from("events").delete().eq("id", eventId).eq("owner_id", user.id);
    if (error) { setErrorMessage("Impossible de supprimer cet événement. Veuillez réessayer."); return; }
    setEvents(c => c.filter(item => item.id !== eventId));
    // Keep the dashboard metrics and activity feed in sync with the deleted event.
    setGuests(c => c.filter(guest => guest.event_id !== eventId));
  }

  const globalStats = useMemo(() => {
    const total = guests.length, confirmed = guests.filter(g => g.status === "confirmed").length, checkedIn = guests.filter(g => g.checked_in).length;
    return { total, confirmed, checkedIn, confirmationRate: total ? Math.round(confirmed / total * 100) : 0, checkInRate: confirmed ? Math.round(checkedIn / confirmed * 100) : 0 };
  }, [guests]);
  const nextEvent = useMemo(() => events.filter(e => !e.date || new Date(e.date + "T23:59:59") >= new Date()).sort((a,b) => !a.date ? 1 : !b.date ? -1 : a.date.localeCompare(b.date))[0] ?? null, [events]);
  const visibleEvents = useMemo(() => {
    const query = eventSearch.trim().toLocaleLowerCase("fr");
    return events.filter(event => {
      const matchesQuery = !query || [event.name, event.location, event.type]
        .some(value => value?.toLocaleLowerCase("fr").includes(query));
      const status = getEventStatus(event).label;
      const matchesFilter = eventFilter === "all"
        || (eventFilter === "upcoming" && !!event.date && status !== "Terminé")
        || (eventFilter === "drafts" && !event.date)
        || (eventFilter === "completed" && status === "Terminé");
      return matchesQuery && matchesFilter;
    });
  }, [events, eventSearch, eventFilter]);

  const recentActivity = useMemo(() => guests.filter(g => g.updated_at || g.created_at).slice(0, 5).map(g => {
    const event = events.find(e => e.id === g.event_id); const date = g.updated_at || g.created_at;
    const checked = g.checked_in, confirmed = g.status === "confirmed", declined = g.status === "declined";
    return { id:g.id, title:checked ? "Entrée enregistrée" : confirmed ? "Invitation confirmée" : declined ? "Invitation refusée" : "Invitation en attente", eventName:event?.name || "Événement", date, icon:checked ? "✓" : confirmed ? "✓" : declined ? "×" : "…", tone:checked || confirmed ? "text-emerald-600 bg-emerald-50" : declined ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50" };
  }), [guests, events]);

  const attentionItems = useMemo(() => {
    const items: { title: string; detail: string; href: string; tone: "amber" | "blue" | "emerald" }[] = [];
    if (!events.length) return items;

    const upcoming = events
      .filter(e => e.date && new Date(e.date + "T23:59:59") >= new Date())
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const pendingCount = guests.filter(g => g.status === "pending").length;
    const pendingEvent = events
      .map(event => ({ event, count: guests.filter(g => g.event_id === event.id && g.status === "pending").length }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)[0]?.event;
    const zeroGuestEvent = upcoming.find(e => guests.filter(g => g.event_id === e.id).length === 0);

    if (pendingCount > 0) {
      items.push({
        title: pendingCount + " invitation" + (pendingCount > 1 ? "s" : "") + " en attente",
        detail: pendingEvent ? "À relancer : " + pendingEvent.name : "Relancez vos invités pour accélérer les confirmations.",
        href: pendingEvent ? "/events/" + pendingEvent.id + "/guests" : "/dashboard",
        tone: "amber",
      });
    }
    if (nextEvent) {
      const days = getDaysUntil(nextEvent.date);
      if (days !== null && days <= 7) {
        items.push({
          title: days === 0 ? "Votre événement est aujourd’hui" : "Événement dans " + days + " jour" + (days > 1 ? "s" : ""),
          detail: nextEvent.name,
          href: "/events/" + nextEvent.id + "/control",
          tone: "blue",
        });
      }
    }
    if (zeroGuestEvent && items.length < 3) {
      items.push({
        title: "Aucun invité pour « " + zeroGuestEvent.name + " »",
        detail: "Ajoutez votre première liste d’invités.",
        href: "/events/" + zeroGuestEvent.id + "/guests",
        tone: "emerald",
      });
    }
    return items.slice(0, 3);
  }, [events, guests, nextEvent]);

  return <main className="dashboard-page min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_28%),radial-gradient(circle_at_90%_15%,_rgba(66,99,235,0.07),_transparent_25%),var(--background)] text-zinc-950 transition-colors">
    <style jsx>{`@keyframes eventStudioShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}.event-studio-shift{background-size:200% 200%;animation:eventStudioShift 16s ease-in-out infinite}@keyframes countdownAlert{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(239,68,68,.16),0 4px 14px rgba(239,68,68,.08)}50%{transform:scale(1.035);box-shadow:0 0 0 4px rgba(239,68,68,.05),0 7px 20px rgba(239,68,68,.14)}}.countdown-alert{animation:countdownAlert 2.2s ease-in-out infinite}.countdown-dot{animation:countdownDot 1.15s ease-in-out infinite}@keyframes countdownDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.8)}}@media(prefers-reduced-motion:reduce){.event-studio-shift,.countdown-alert,.countdown-dot,.priority-card,.priority-pulse,.watch-pulse{animation:none!important;transition:none!important}}`}</style>
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

      <section className={`event-studio-shift relative overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#101a2e,#172b4d,#234c86)] px-5 py-6 shadow-[0_16px_38px_rgba(16,26,46,0.14)] transition-all duration-500 sm:px-6 sm:py-6 ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">Centre de pilotage</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Bonjour {userName} <span className="text-blue-300">👋</span></h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Tout ce qui mérite votre attention, en un seul regard.</p>
          </div>
          <Link href="/events/new" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 sm:w-auto"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Créer un événement</Link>
        </div>
      </section>

      {errorMessage && <div role="alert" aria-live="polite" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"><svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/></svg><span>{errorMessage}</span></div>}

      <section className={`mt-5 transition-all duration-500 ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Vue générale</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Vos indicateurs</h2></div><span className="text-xs font-semibold text-zinc-400">En temps réel</span></div>
        {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-200/60" />)}</div> :
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard icon="events" label="Événements" value={events.length} detail="Créés par vous" />
            <StatCard icon="invitations" label="Invitations" value={globalStats.total} detail="Tous événements" />
            <StatCard icon="confirmed" label="Réponses positives" value={globalStats.confirmed} detail={globalStats.confirmationRate + "% de confirmation"} />
            <StatCard icon="checkin" label="Entrées enregistrées" value={globalStats.checkedIn} detail={globalStats.checkInRate + "% des réponses positives"} />
          </div>}
      </section>

      {nextEvent && (() => {
        const eventGuests = guests.filter(g => g.event_id === nextEvent.id);
        const pending = eventGuests.filter(g => g.status === "pending").length;
        const days = getDaysUntil(nextEvent.date);
        const confirmed = eventGuests.filter(g => g.status === "confirmed").length;
        const checked = eventGuests.filter(g => g.checked_in).length;
        const confirmationRate = eventGuests.length ? Math.round((confirmed / eventGuests.length) * 100) : 0;
        const checkInRate = confirmed ? Math.round((checked / confirmed) * 100) : 0;
        let action;

        if (pending > 0) {
          action = {
            label: "Relancer les invitations",
            href: "/events/" + nextEvent.id + "/guests",
            detail: pending + " en attente",
          };
        } else if (eventGuests.length === 0) {
          action = {
            label: "Ajouter des invités",
            href: "/events/" + nextEvent.id + "/guests",
            detail: "Liste vide",
          };
        } else if (days !== null && days <= 7) {
          action = {
            label: "Ouvrir Event Control",
            href: "/events/" + nextEvent.id + "/control",
            detail: days === 0
              ? "Événement aujourd’hui"
              : "J-" + days,
          };
        } else {
          action = {
            label: "Gérer l’événement",
            href: "/events/" + nextEvent.id,
            detail: days !== null
              ? "J-" + days + " · " + confirmationRate + "% confirmés"
              : "Tout est sous contrôle",
          };
        }
        return <section className="mb-2 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 shadow-sm priority-card">
          <div className="flex min-h-[48px] items-center justify-between gap-2 px-3 py-2 sm:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-700 ring-1 ring-blue-100">✦</div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
                  <span className="priority-pulse h-1.5 w-1.5 rounded-full bg-amber-500" />Priorité
                </p>
                <p className="truncate text-sm font-bold text-amber-950">{action.label} <span className="font-medium text-amber-700/70">· {action.detail}</span></p>
              </div>
            </div>
            <Link href={action.href} className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-zinc-900 bg-zinc-950 px-2.5 py-1.5 text-xs font-black text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-700 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/10">
              <span>Ouvrir</span><span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </section>;
      })()}

      <section className={`mt-5 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} transition-all duration-500`}>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(16,26,46,0.045)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">Agenda</p><h2 className="mt-1 text-lg font-extrabold">Prochain événement</h2></div>{nextEvent && <Link href={"/events/" + nextEvent.id} className="text-xs font-bold text-blue-700 hover:text-blue-900">Ouvrir →</Link>}</div>
          {loading ? <div className="p-5"><div className="h-36 animate-pulse rounded-2xl bg-zinc-100" /></div> : nextEvent ? <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white"><span className="text-xs font-bold uppercase">{nextEvent.date ? new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(new Date(nextEvent.date+"T12:00:00")) : "Date"}</span><span className="text-xl font-black">{nextEvent.date ? new Date(nextEvent.date+"T12:00:00").getDate() : "—"}</span></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={getEventStatus(nextEvent)} />{nextEvent.type && <span className="text-xs font-semibold text-zinc-400">{nextEvent.type}</span>}{getDaysUntil(nextEvent.date) !== null && (() => { const countdown = getDaysUntil(nextEvent.date)!; const urgent = countdown <= 3; const approaching = countdown > 3 && countdown <= 14; return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black tracking-wide shadow-sm transition ${urgent ? "countdown-alert border-red-200 bg-red-50 text-red-700" : approaching ? "border-amber-200 bg-amber-50 text-amber-800" : "border-zinc-200 bg-white text-zinc-600"}`}><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${urgent ? "countdown-dot bg-red-500" : approaching ? "bg-amber-500" : "bg-zinc-400"}`} />{countdown === 0 ? "Aujourd’hui" : "J-" + countdown}</span>; })()}</div><h3 className="mt-1.5 truncate text-lg font-black">{nextEvent.name}</h3><div className="mt-2.5 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M8 2.8v3.5M16 2.8v3.5M3.5 9.5h17"/></svg>{formatDate(nextEvent.date)}</span>{nextEvent.time && <span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{nextEvent.time}</span>}{nextEvent.location && <span className="inline-flex min-w-0 items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span className="truncate">{nextEvent.location}</span></span>}</div></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3.5">
              <div><p className="text-xs text-zinc-400">Invitations</p><p className="mt-0.5 text-base font-black">{guests.filter(g=>g.event_id===nextEvent.id).length}</p></div>
              <div><p className="text-xs text-zinc-400">Réponses confirmées</p><p className="mt-0.5 text-base font-black text-emerald-600">{guests.filter(g=>g.event_id===nextEvent.id&&g.status==="confirmed").length}</p></div>
              <div><p className="text-xs text-zinc-400">Entrées enregistrées</p><p className="mt-0.5 text-base font-black text-blue-700">{guests.filter(g=>g.event_id===nextEvent.id&&g.checked_in).length}</p></div>
            </div>
            {(() => {
              const eventGuests = guests.filter(g => g.event_id === nextEvent.id);
              const confirmed = eventGuests.filter(g => g.status === "confirmed").length;
              const checked = eventGuests.filter(g => g.checked_in).length;
              const readiness = eventGuests.length === 0 ? 0 : Math.round((confirmed / eventGuests.length) * 70 + (confirmed ? checked / confirmed : 0) * 30);
              return <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">Préparation</span>
                  <span className={`text-xs font-black ${readiness >= 80 ? "text-emerald-600" : readiness >= 50 ? "text-amber-600" : "text-zinc-500"}`}>{readiness}%</span>
                </div>

                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-200" role="progressbar" aria-label="Préparation de l’événement" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readiness}>
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out" style={{width: readiness + "%"}} />
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <div className="rounded-lg border border-zinc-100 bg-white px-2 py-1.5">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">Invités</p>
                    <p className="mt-0.5 text-sm font-black text-zinc-800">{eventGuests.length}</p>
                  </div>

                  <div className="rounded-lg border border-zinc-100 bg-white px-2 py-1.5">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">Confirmés</p>
                    <p className="mt-0.5 text-sm font-black text-emerald-600">{confirmed}</p>
                  </div>

                  <div className="rounded-lg border border-zinc-100 bg-white px-2 py-1.5">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-zinc-400">Entrées</p>
                    <p className="mt-0.5 text-sm font-black text-blue-600">{checked}</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-2.5 py-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-zinc-400">État</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.1em] ${readiness >= 80 ? "text-emerald-600" : readiness >= 50 ? "text-amber-600" : "text-zinc-500"}`}>
                    <span>{readiness >= 80 ? "✓" : "○"}</span>
                    {readiness >= 80 ? "Prêt" : readiness >= 50 ? "À surveiller" : "En préparation"}
                  </span>
                </div>
              </div>;
            })()}
            <Link href={"/events/" + nextEvent.id} className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800">Gérer l’événement →</Link>
          </div> : <div className="px-5 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700">+</div><h3 className="mt-3 text-base font-black">Aucun événement à venir</h3><p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-zinc-500">Créez votre prochain événement pour commencer.</p><Link href="/events/new" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">Créer un événement</Link></div>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(16,26,46,0.045)]">
          <div className="border-b border-zinc-100 px-4 py-3 sm:px-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">Suivi</p><h2 className="mt-1 text-lg font-extrabold">Activité récente</h2></div>
          <div className="p-3 sm:p-4">{loading ? <div className="space-y-2.5">{[1,2,3,4].map(i=><div key={i} className="h-10 animate-pulse rounded-xl bg-zinc-100" />)}</div> : recentActivity.length ? <div className="space-y-1">{recentActivity.map(a=><div key={a.id} className="flex items-center gap-2 rounded-xl px-1.5 py-2 transition hover:bg-zinc-50"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${a.tone}`}>{a.icon}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-zinc-800">{a.title}</p><p className="truncate text-xs text-zinc-400">{a.eventName}</p></div><span className="shrink-0 text-xs text-zinc-400">{formatActivityDate(a.date)}</span></div>)}</div> : <div className="py-8 text-center"><p className="text-xs font-bold text-zinc-600">Aucune activité récente</p><p className="mt-1 text-xs text-zinc-400">Les actions sur vos invités apparaîtront ici.</p></div>}</div>
        </div>
      </section>

      {attentionItems.length > 0 && <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(16,26,46,0.04)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 sm:px-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">Pilotage intelligent</p>
              <h2 className="mt-0.5 flex items-center gap-2 text-sm font-black text-amber-900"><span className="watch-pulse h-2 w-2 rounded-full bg-amber-500" />À surveiller</h2>
            </div>
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-500">{attentionItems.length} point{attentionItems.length > 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
            {attentionItems.map((item) => {
              const tone = item.tone === "amber"
                ? "bg-amber-50 text-amber-700 ring-amber-100"
                : item.tone === "blue"
                  ? "bg-blue-50 text-blue-700 ring-blue-100"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-100";
              return <Link key={item.title} href={item.href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-slate-50">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone}`}><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 22 20H2L12 3Z"/><path d="M12 9v4m0 3h.01"/></svg></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black text-zinc-800">{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-400">{item.detail}</span>
                </span>
                <span className="shrink-0 text-xs font-black text-zinc-300 transition group-hover:text-blue-600">→</span>
              </Link>;
            })}
          </div>
        </div>
      </section>}

      <section className={`mt-6 transition-all duration-500 ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Gestion</p><h2 className="mt-1 text-lg font-extrabold">Mes événements <span className="ml-1 text-sm font-semibold text-zinc-400">{!loading ? events.length : ""}</span></h2><p className="mt-0.5 text-xs text-zinc-400">Retrouvez et pilotez vos événements.</p></div>{!loading&&events.length>0&&<Link href="/events/new" className="inline-flex rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">+ Nouvel événement</Link>}</div>
        {!loading && events.length > 0 && <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px]">
          <label className="relative block"><span className="sr-only">Rechercher un événement</span><svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg><input value={eventSearch} onChange={event => setEventSearch(event.target.value)} placeholder="Rechercher par nom, lieu ou type…" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" /></label>
          <label className="relative block"><span className="sr-only">Filtrer les événements</span><select value={eventFilter} onChange={event => setEventFilter(event.target.value as typeof eventFilter)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"><option value="all">Tous les événements</option><option value="upcoming">À venir</option><option value="drafts">Brouillons</option><option value="completed">Terminés</option></select></label>
        </div>}
        {loading ? <div className="grid gap-3 xl:grid-cols-2">{[1,2].map(i=><div key={i} className="h-56 animate-pulse rounded-[20px] bg-white" />)}</div> :
        !events.length ? <div className="rounded-[20px] border border-dashed border-zinc-300 bg-white px-5 py-12 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700">+</div><h3 className="mt-3 text-base font-black">Votre espace est prêt</h3><p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-zinc-500">Créez votre premier événement et commencez à gérer vos invités.</p><Link href="/events/new" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">Créer mon premier événement</Link></div> :
        !visibleEvents.length ? <div className="rounded-[20px] border border-dashed border-zinc-300 bg-white px-5 py-10 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2M8 10.8h5.6"/></svg></div><h3 className="mt-3 text-sm font-black text-slate-800">Aucun résultat</h3><p className="mt-1 text-xs text-zinc-500">Essayez un autre mot-clé ou modifiez le filtre.</p><button type="button" onClick={() => { setEventSearch(""); setEventFilter("all"); }} className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">Réinitialiser les filtres</button></div> :
        <div className="grid min-w-0 gap-2.5 xl:grid-cols-2">{visibleEvents.map((event,index) => {
          const eventGuests=guests.filter(g=>g.event_id===event.id), total=eventGuests.length, confirmed=eventGuests.filter(g=>g.status==="confirmed").length, pending=eventGuests.filter(g=>g.status==="pending").length, checkedIn=eventGuests.filter(g=>g.checked_in).length, declined=eventGuests.filter(g=>g.status==="declined").length;
          const confirmationRate=total?Math.round(confirmed/total*100):0, checkInRate=confirmed?Math.round(checkedIn/confirmed*100):0, eventDays=getDaysUntil(event.date);
          return <article key={event.id} style={{transitionDelay:`${Math.min(index,5)*60}ms`}} className={`group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(16,26,46,0.04)] transition duration-500 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 ${motionReady?"translate-y-0 opacity-100":"translate-y-3 opacity-0"}`}>
            <div className="flex min-w-0 items-center gap-3 border-b border-zinc-100 px-3.5 py-3 sm:px-4">
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-950 text-white"><span className="text-[7px] font-bold uppercase text-blue-300">{event.date?new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(new Date(event.date+"T12:00:00")):"—"}</span><span className="text-sm font-black">{event.date?new Date(event.date+"T12:00:00").getDate():"—"}</span></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={getEventStatus(event)} />{event.type&&<span className="text-xs font-semibold text-zinc-400">{event.type}</span>}</div><h3 className="mt-1 truncate text-sm font-black text-zinc-900">{event.name}</h3><p className="mt-0.5 truncate text-xs text-zinc-400">{event.location ? event.location : formatDate(event.date)}</p>{eventDays !== null && <span className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[11px] font-black ${eventDays <= 3 ? "bg-red-50 text-red-700" : eventDays <= 14 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{eventDays === 0 ? "AUJOURD’HUI" : "J-" + eventDays}</span>}</div>
              <Link href={"/events/"+event.id} className="hidden shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50 sm:inline-flex">Ouvrir →</Link>
            </div>
            <div className="px-3.5 py-3 sm:px-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl bg-slate-50 px-2.5 py-2 sm:px-2 sm:py-1.5"><p className="text-[11px] font-bold uppercase text-zinc-400">Invités</p><p className="mt-0.5 text-sm font-black">{total}</p></div><div className="rounded-xl bg-emerald-50 px-2 py-1.5"><p className="text-[11px] font-bold uppercase text-emerald-500">Confirmés</p><p className="mt-0.5 text-sm font-black text-emerald-700">{confirmed}</p></div><div className="rounded-xl bg-amber-50 px-2 py-1.5"><p className="text-[11px] font-bold uppercase text-amber-500">Attente</p><p className="mt-0.5 text-sm font-black text-amber-700">{pending}</p></div><div className="rounded-xl bg-blue-50 px-2 py-1.5"><p className="text-[11px] font-bold uppercase text-blue-500">Entrées</p><p className="mt-0.5 text-sm font-black text-blue-700">{checkedIn}</p></div></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><ProgressBar label="Confirmation" value={confirmationRate}/><ProgressBar label="Entrée" value={checkInRate}/></div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5"><span className="text-xs text-zinc-400">{declined} refusée{declined>1?"s":""}</span><div className="flex items-center gap-1.5"><Link href={"/events/"+event.id+"/edit"} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"/></svg>Modifier</Link><button type="button" onClick={()=>setEventMenuOpen(eventMenuOpen===event.id?null:event.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" aria-label={eventMenuOpen===event.id?"Fermer les actions de "+event.name:"Ouvrir les actions de "+event.name} title="Actions de l’événement" aria-expanded={eventMenuOpen===event.id} aria-haspopup="menu"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button></div></div>
              {eventMenuOpen===event.id&&<div role="menu" aria-label={"Actions pour " + event.name} className="mt-2 grid grid-cols-3 gap-1.5 border-t border-zinc-100 pt-2"><Link role="menuitem" onClick={()=>setEventMenuOpen(null)} href={"/events/"+event.id+"/guests"} className="rounded-lg bg-zinc-50 px-2 py-2 text-center text-xs font-bold text-zinc-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">Invités</Link><button type="button" onClick={()=>{setEventMenuOpen(null);void handleDuplicateEvent(event.id)}} role="menuitem" className="rounded-lg bg-zinc-50 px-2 py-2 text-xs font-bold text-zinc-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">Dupliquer</button><Link role="menuitem" onClick={()=>setEventMenuOpen(null)} href={"/events/"+event.id+"/control"} className="rounded-lg bg-blue-50 px-2 py-2 text-center text-xs font-bold text-blue-700 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">Event Control</Link><button type="button" onClick={()=>{setEventMenuOpen(null);void handleDeleteEvent(event.id,event.name)}} role="menuitem" className="col-span-3 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600">Supprimer</button></div>}
            </div>
          </article>;
        })}</div>}
      </section>

      <footer className="mt-7 border-t border-blue-900/30 bg-[linear-gradient(115deg,#07111f,#0b1730,#123b70,#07111f)] py-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Event Studio</p><p className="mt-1 text-xs text-white/55">Centre de pilotage événementiel</p></footer>

    </div>
  </main>;
}
