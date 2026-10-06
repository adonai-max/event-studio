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
  return diff < 0 ? 0 : Math.ceil(diff / 86400000);
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
  const styles = { gray: "bg-zinc-100 text-zinc-600", blue: "bg-sky-50 text-sky-700", green: "bg-emerald-50 text-emerald-700", purple: "bg-violet-50 text-violet-700" };
  const dots = { gray: "bg-zinc-400", blue: "bg-sky-500", green: "bg-emerald-500", purple: "bg-violet-500" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[status.tone]}`}><span className={`h-1.5 w-1.5 rounded-full ${dots[status.tone]} ${status.tone === "green" ? "animate-pulse" : ""}`} />{status.label}</span>;
}
function StatCard({ icon, label, value, detail }: { icon: string; label: string; value: number; detail: string }) {
  return <div className="group rounded-2xl border border-zinc-200/70 bg-white/90 p-3 shadow-[0_4px_18px_rgba(15,23,42,0.035)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/5">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 ring-1 ring-sky-100">{icon}</div>
      <div className="min-w-0"><p className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">{label}</p><p className="mt-0.5 text-xl font-black tracking-tight text-zinc-950">{value}</p><p className="truncate text-[10px] text-zinc-400">{detail}</p></div>
    </div>
  </div>;
}
function ProgressBar({ label, value }: { label: string; value: number }) {
  return <div><div className="flex justify-between text-[11px]"><span className="font-medium text-zinc-500">{label}</span><span className="font-bold text-zinc-800">{value}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-1000" style={{ width: value + "%" }} /></div></div>;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [userName, setUserName] = useState("Adonaï");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [motionReady, setMotionReady] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState<string | null>(null);

  useEffect(() => { const frame = requestAnimationFrame(() => setMotionReady(true)); return () => cancelAnimationFrame(frame); }, []);
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
      const { error } = await supabase.from("guests").insert(duplicatedGuests);
      if (error) { setEvents(c => [duplicatedEvent, ...c]); setErrorMessage("Événement dupliqué, mais les invités n’ont pas pu être copiés."); return; }
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
  }

  const globalStats = useMemo(() => {
    const total = guests.length, confirmed = guests.filter(g => g.status === "confirmed").length, checkedIn = guests.filter(g => g.checked_in).length;
    return { total, confirmed, checkedIn, confirmationRate: total ? Math.round(confirmed / total * 100) : 0, checkInRate: confirmed ? Math.round(checkedIn / confirmed * 100) : 0 };
  }, [guests]);
  const nextEvent = useMemo(() => events.filter(e => !e.date || new Date(e.date + "T23:59:59") >= new Date()).sort((a,b) => !a.date ? 1 : !b.date ? -1 : a.date.localeCompare(b.date))[0] ?? null, [events]);
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
    const zeroGuestEvent = upcoming.find(e => guests.filter(g => g.event_id === e.id).length === 0);

    if (pendingCount > 0) {
      items.push({
        title: pendingCount + " invitation" + (pendingCount > 1 ? "s" : "") + " en attente",
        detail: "Relancez vos invités pour accélérer les confirmations.",
        href: nextEvent ? "/events/" + nextEvent.id + "/guests" : "/dashboard",
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

  return <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_28%),radial-gradient(circle_at_90%_15%,_rgba(14,165,233,0.07),_transparent_25%),#f7f9fc] text-zinc-950">
    <style jsx>{`@keyframes eventStudioShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}.event-studio-shift{background-size:200% 200%;animation:eventStudioShift 16s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.event-studio-shift{animation:none}}`}</style>
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-7">

      <section className={`event-studio-shift relative overflow-hidden rounded-[22px] bg-[linear-gradient(115deg,#07111f,#0b1730,#123b70,#07111f)] px-4 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition-all duration-500 sm:px-6 sm:py-6 ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-sky-300">Centre de pilotage</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-3xl">Bonjour {userName} <span className="text-sky-300">👋</span></h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-300 sm:text-sm">Tout ce qui mérite votre attention, en un seul regard.</p>
          </div>
          <Link href="/events/new" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-zinc-950 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-sky-500 hover:text-white sm:w-auto">+ Créer un événement</Link>
        </div>
      </section>

      {errorMessage && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{errorMessage}</div>}

      <section className={`mt-5 transition-all duration-500 ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="mb-2.5 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-700">Vue générale</p><h2 className="mt-0.5 text-base font-black tracking-tight">Vos indicateurs</h2></div><span className="text-[10px] font-semibold text-zinc-400">En temps réel</span></div>
        {loading ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">{[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-200/60" />)}</div> :
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <StatCard icon="◈" label="Événements" value={events.length} detail="Créés par vous" />
            <StatCard icon="◎" label="Invités" value={globalStats.total} detail="Tous événements" />
            <StatCard icon="✓" label="Confirmés" value={globalStats.confirmed} detail={globalStats.confirmationRate + "% de confirmation"} />
            <StatCard icon="↗" label="Entrées" value={globalStats.checkedIn} detail={globalStats.checkInRate + "% des confirmés"} />
          </div>}
      </section>

      {nextEvent && (() => {
        const eventGuests = guests.filter(g => g.event_id === nextEvent.id);
        const pending = eventGuests.filter(g => g.status === "pending").length;
        const days = getDaysUntil(nextEvent.date);
        const action = pending > 0
          ? { label: "Relancer les invitations", href: "/events/" + nextEvent.id + "/guests", detail: pending + " en attente" }
          : eventGuests.length === 0
            ? { label: "Ajouter des invités", href: "/events/" + nextEvent.id + "/guests", detail: "Liste vide" }
            : days !== null && days <= 7
              ? { label: "Ouvrir Event Control", href: "/events/" + nextEvent.id + "/control", detail: "Préparer l’accueil" }
              : { label: "Gérer l’événement", href: "/events/" + nextEvent.id, detail: "Tout est sous contrôle" };
        return <section className="mb-3 overflow-hidden rounded-[18px] border border-sky-100 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.035)]">
          <div className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xs font-black text-sky-700 ring-1 ring-sky-100">✦</div>
              <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-700">Priorité</p><p className="truncate text-[11px] font-bold text-zinc-800">{action.label} <span className="font-medium text-zinc-400">· {action.detail}</span></p></div>
            </div>
            <Link href={action.href} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-zinc-950 px-3 py-2 text-[10px] font-black text-white transition hover:bg-sky-700">{action.label} →</Link>
          </div>
        </section>;
      })()}

      <section className={`mt-5 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} transition-all duration-500`}>
        <div className="overflow-hidden rounded-[20px] border border-zinc-200/70 bg-white shadow-[0_7px_26px_rgba(15,23,42,0.045)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5"><div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-700">Agenda</p><h2 className="mt-0.5 text-lg font-black">Prochain événement</h2></div>{nextEvent && <Link href={"/events/" + nextEvent.id} className="text-[11px] font-bold text-sky-700 hover:text-sky-900">Ouvrir →</Link>}</div>
          {loading ? <div className="p-5"><div className="h-36 animate-pulse rounded-2xl bg-zinc-100" /></div> : nextEvent ? <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white"><span className="text-[9px] font-bold uppercase">{nextEvent.date ? new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(new Date(nextEvent.date+"T12:00:00")) : "Date"}</span><span className="text-xl font-black">{nextEvent.date ? new Date(nextEvent.date+"T12:00:00").getDate() : "—"}</span></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={getEventStatus(nextEvent)} />{nextEvent.type && <span className="text-[10px] font-semibold text-zinc-400">{nextEvent.type}</span>}{getDaysUntil(nextEvent.date) !== null && <span className={`rounded-full px-2 py-1 text-[9px] font-black ring-1 ${getDaysUntil(nextEvent.date) <= 7 ? "bg-red-50 text-red-700 ring-red-100" : "bg-zinc-100 text-zinc-500 ring-zinc-100"}`}>{getDaysUntil(nextEvent.date) === 0 ? "🔴 Aujourd’hui" : "🔴 Plus que " + getDaysUntil(nextEvent.date) + " jour" + (getDaysUntil(nextEvent.date) > 1 ? "s" : "")}</span>}</div><h3 className="mt-1.5 truncate text-lg font-black">{nextEvent.name}</h3><div className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-500"><span>📅 {formatDate(nextEvent.date)}</span>{nextEvent.time && <span>🕐 {nextEvent.time}</span>}{nextEvent.location && <span className="truncate">📍 {nextEvent.location}</span>}</div></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3.5">
              <div><p className="text-[10px] text-zinc-400">Invités</p><p className="mt-0.5 text-base font-black">{guests.filter(g=>g.event_id===nextEvent.id).length}</p></div>
              <div><p className="text-[10px] text-zinc-400">Confirmés</p><p className="mt-0.5 text-base font-black text-emerald-600">{guests.filter(g=>g.event_id===nextEvent.id&&g.status==="confirmed").length}</p></div>
              <div><p className="text-[10px] text-zinc-400">Entrées</p><p className="mt-0.5 text-base font-black text-sky-700">{guests.filter(g=>g.event_id===nextEvent.id&&g.checked_in).length}</p></div>
            </div>
            {(() => {
              const eventGuests = guests.filter(g => g.event_id === nextEvent.id);
              const confirmed = eventGuests.filter(g => g.status === "confirmed").length;
              const checked = eventGuests.filter(g => g.checked_in).length;
              const readiness = eventGuests.length === 0 ? 0 : Math.round((confirmed / eventGuests.length) * 70 + (confirmed ? checked / confirmed : 0) * 30);
              return <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">Préparation</span>
                  <span className={`text-[10px] font-black ${readiness >= 80 ? "text-emerald-600" : readiness >= 50 ? "text-amber-600" : "text-zinc-500"}`}>{readiness}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600" style={{width: readiness + "%"}} /></div>
              </div>;
            })()}
            <Link href={"/events/" + nextEvent.id} className="mt-4 inline-flex rounded-xl bg-zinc-950 px-3.5 py-2.5 text-[11px] font-bold text-white transition hover:bg-sky-700">Gérer l’événement →</Link>
          </div> : <div className="px-5 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-xl text-sky-700">+</div><h3 className="mt-3 text-base font-black">Aucun événement à venir</h3><p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-zinc-500">Créez votre prochain événement pour commencer.</p><Link href="/events/new" className="mt-4 inline-flex rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white">Créer un événement</Link></div>}
        </div>

        <div className="overflow-hidden rounded-[20px] border border-zinc-200/70 bg-white shadow-[0_7px_26px_rgba(15,23,42,0.045)]">
          <div className="border-b border-zinc-100 px-4 py-3 sm:px-5"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-700">Suivi</p><h2 className="mt-0.5 text-lg font-black">Activité récente</h2></div>
          <div className="p-3 sm:p-4">{loading ? <div className="space-y-2.5">{[1,2,3,4].map(i=><div key={i} className="h-10 animate-pulse rounded-xl bg-zinc-100" />)}</div> : recentActivity.length ? <div className="space-y-1">{recentActivity.map(a=><div key={a.id} className="flex items-center gap-2 rounded-xl px-1.5 py-2 transition hover:bg-zinc-50"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${a.tone}`}>{a.icon}</div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-zinc-800">{a.title}</p><p className="truncate text-[10px] text-zinc-400">{a.eventName}</p></div><span className="shrink-0 text-[9px] text-zinc-400">{formatActivityDate(a.date)}</span></div>)}</div> : <div className="py-8 text-center"><p className="text-xs font-bold text-zinc-600">Aucune activité récente</p><p className="mt-1 text-[10px] text-zinc-400">Les actions sur vos invités apparaîtront ici.</p></div>}</div>
        </div>
      </section>

      {attentionItems.length > 0 && <section className="mt-4">
        <div className="overflow-hidden rounded-[18px] border border-zinc-200/70 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.035)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 sm:px-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-700">Pilotage intelligent</p>
              <h2 className="mt-0.5 text-sm font-black">À surveiller</h2>
            </div>
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-bold text-zinc-500">{attentionItems.length} point{attentionItems.length > 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
            {attentionItems.map((item) => {
              const tone = item.tone === "amber"
                ? "bg-amber-50 text-amber-700 ring-amber-100"
                : item.tone === "blue"
                  ? "bg-sky-50 text-sky-700 ring-sky-100"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-100";
              return <Link key={item.title} href={item.href} className="group flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-zinc-50">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ring-1 ${tone}`}>!</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-black text-zinc-800">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[9px] text-zinc-400">{item.detail}</span>
                </span>
                <span className="shrink-0 text-[11px] font-black text-zinc-300 transition group-hover:text-sky-600">→</span>
              </Link>;
            })}
          </div>
        </div>
      </section>}

      <section className={`mt-6 transition-all duration-500 ${motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-700">Gestion</p><h2 className="mt-0.5 text-lg font-black">Mes événements</h2><p className="mt-0.5 text-[11px] text-zinc-400">Retrouvez et pilotez vos événements.</p></div>{!loading&&events.length>0&&<Link href="/events/new" className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700 sm:inline-flex">+ Nouvel événement</Link>}</div>
        {loading ? <div className="grid gap-3 xl:grid-cols-2">{[1,2].map(i=><div key={i} className="h-56 animate-pulse rounded-[20px] bg-white" />)}</div> :
        !events.length ? <div className="rounded-[20px] border border-dashed border-zinc-300 bg-white px-5 py-12 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-xl text-sky-700">+</div><h3 className="mt-3 text-base font-black">Votre espace est prêt</h3><p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-zinc-500">Créez votre premier événement et commencez à gérer vos invités.</p><Link href="/events/new" className="mt-4 inline-flex rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white">Créer mon premier événement</Link></div> :
        <div className="grid min-w-0 gap-2.5 xl:grid-cols-2">{events.map((event,index) => {
          const eventGuests=guests.filter(g=>g.event_id===event.id), total=eventGuests.length, confirmed=eventGuests.filter(g=>g.status==="confirmed").length, pending=eventGuests.filter(g=>g.status==="pending").length, checkedIn=eventGuests.filter(g=>g.checked_in).length, declined=eventGuests.filter(g=>g.status==="declined").length;
          const confirmationRate=total?Math.round(confirmed/total*100):0, checkInRate=confirmed?Math.round(checkedIn/confirmed*100):0;
          return <article key={event.id} style={{transitionDelay:`${Math.min(index,5)*60}ms`}} className={`group overflow-hidden rounded-[18px] border border-zinc-200/70 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.035)] transition duration-500 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/5 ${motionReady?"translate-y-0 opacity-100":"translate-y-3 opacity-0"}`}>
            <div className="flex min-w-0 items-center gap-3 border-b border-zinc-100 px-3.5 py-3 sm:px-4">
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-950 text-white"><span className="text-[7px] font-bold uppercase text-sky-300">{event.date?new Intl.DateTimeFormat("fr-FR",{month:"short"}).format(new Date(event.date+"T12:00:00")):"—"}</span><span className="text-sm font-black">{event.date?new Date(event.date+"T12:00:00").getDate():"—"}</span></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={getEventStatus(event)} />{event.type&&<span className="text-[9px] font-semibold text-zinc-400">{event.type}</span>}</div><h3 className="mt-1 truncate text-sm font-black text-zinc-900">{event.name}</h3><p className="mt-0.5 truncate text-[10px] text-zinc-400">{event.location||formatDate(event.date)}</p></div>
              <Link href={"/events/"+event.id} className="hidden shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-sky-700 transition hover:bg-sky-50 sm:inline-flex">Ouvrir →</Link>
            </div>
            <div className="px-3.5 py-3 sm:px-4">
              <div className="grid grid-cols-4 gap-1.5"><div className="rounded-xl bg-zinc-50 px-2 py-1.5"><p className="text-[8px] font-bold uppercase text-zinc-400">Invités</p><p className="mt-0.5 text-sm font-black">{total}</p></div><div className="rounded-xl bg-emerald-50 px-2 py-1.5"><p className="text-[8px] font-bold uppercase text-emerald-500">Confirmés</p><p className="mt-0.5 text-sm font-black text-emerald-700">{confirmed}</p></div><div className="rounded-xl bg-amber-50 px-2 py-1.5"><p className="text-[8px] font-bold uppercase text-amber-500">Attente</p><p className="mt-0.5 text-sm font-black text-amber-700">{pending}</p></div><div className="rounded-xl bg-sky-50 px-2 py-1.5"><p className="text-[8px] font-bold uppercase text-sky-500">Entrées</p><p className="mt-0.5 text-sm font-black text-sky-700">{checkedIn}</p></div></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><ProgressBar label="Confirmation" value={confirmationRate}/><ProgressBar label="Entrée" value={checkInRate}/></div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5"><span className="text-[10px] text-zinc-400">{declined} refusée{declined>1?"s":""}</span><div className="flex items-center gap-1.5"><Link href={"/events/"+event.id+"/edit"} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[10px] font-bold text-zinc-600 transition hover:border-sky-200 hover:text-sky-700">Modifier</Link><button type="button" onClick={()=>setEventMenuOpen(eventMenuOpen===event.id?null:event.id)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[10px] font-bold text-zinc-600 transition hover:bg-zinc-50" aria-expanded={eventMenuOpen===event.id}>•••</button></div></div>
              {eventMenuOpen===event.id&&<div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-zinc-100 pt-2"><Link onClick={()=>setEventMenuOpen(null)} href={"/events/"+event.id+"/guests"} className="rounded-lg bg-zinc-50 px-2 py-2 text-center text-[9px] font-bold text-zinc-600 hover:bg-sky-50 hover:text-sky-700">Invités</Link><button type="button" onClick={()=>{setEventMenuOpen(null);void handleDuplicateEvent(event.id)}} className="rounded-lg bg-zinc-50 px-2 py-2 text-[9px] font-bold text-zinc-600 hover:bg-sky-50 hover:text-sky-700">Dupliquer</button><Link onClick={()=>setEventMenuOpen(null)} href={"/events/"+event.id+"/control"} className="rounded-lg bg-sky-50 px-2 py-2 text-center text-[9px] font-bold text-sky-700 hover:bg-sky-100">Event Control</Link><button type="button" onClick={()=>{setEventMenuOpen(null);void handleDeleteEvent(event.id,event.name)}} className="col-span-3 rounded-lg bg-red-50 px-2 py-2 text-[9px] font-bold text-red-600 hover:bg-red-100">Supprimer</button></div>}
            </div>
          </article>;
        })}</div>}
      </section>

      <footer className="mt-7 border-t border-zinc-200/80 py-5 text-center"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-300">Event Studio</p><p className="mt-1 text-[10px] text-zinc-400">Centre de pilotage événementiel</p></footer>
    </div>
  </main>;
}
