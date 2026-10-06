"use client";

import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type EventItem = {
  id: string;
  name: string;
  type: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  created_at: string;
};

type GuestItem = {
  id: string;
  event_id: string;
  status: "pending" | "confirmed" | "declined";
  checked_in: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type EventStatus = {
  label: string;
  tone: "gray" | "blue" | "green" | "purple";
};

function getEventStatus(event: EventItem): EventStatus {
  if (!event.date) return { label: "Brouillon", tone: "gray" };

  const eventDate = new Date(event.date + "T23:59:59");
  const now = new Date();

  if (eventDate < now) return { label: "Terminé", tone: "purple" };

  const diff = eventDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 7) return { label: "Actif", tone: "green" };

  return { label: "Programmé", tone: "blue" };
}

function formatDate(date: string | null) {
  if (!date) return "Date à définir";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date + "T12:00:00"));
}

function formatShortDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date + "T12:00:00"));
}

function getDaysUntil(date: string | null) {
  if (!date) return null;

  const target = new Date(date + "T23:59:59");
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff < 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatActivityDate(date: string | null) {
  if (!date) return "";

  const parsed = new Date(date);
  const diff = Date.now() - parsed.getTime();

  if (diff < 60 * 1000) return "À l’instant";
  if (diff < 60 * 60 * 1000) return "Il y a " + Math.floor(diff / (60 * 1000)) + " min";
  if (diff < 24 * 60 * 60 * 1000) return "Il y a " + Math.floor(diff / (60 * 60 * 1000)) + " h";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

function StatusBadge({ status }: { status: EventStatus }) {
  const styles = {
    gray: "border-zinc-200 bg-zinc-100 text-zinc-600",
    blue: "border-sky-200 bg-sky-50 text-sky-800",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    purple: "border-purple-100 bg-purple-50 text-purple-700",
  };

  const dots = {
    gray: "bg-zinc-400",
    blue: "bg-sky-600",
    green: "bg-emerald-500",
    purple: "bg-purple-500",
  };

  return (
    <span className={["inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold", styles[status.tone]].join(" ")}>
      <span className={["h-1.5 w-1.5 rounded-full", dots[status.tone], status.tone === "green" ? "animate-pulse" : ""].join(" ")} />
      {status.label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/15">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-600/5 blur-2xl transition-all duration-500 group-hover:bg-sky-500/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            {value}
          </p>

          <p className="mt-1 truncate text-xs font-medium text-zinc-400">
            {detail}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 via-sky-600 to-blue-700 text-lg font-black text-white ring-1 ring-sky-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-sky-500/25">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-500">{label}</span>
        <span className="font-bold text-zinc-800">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-1000 ease-out" style={{ width: value + "%" }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [userName, setUserName] = useState("Adonaï");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [motionReady, setMotionReady] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMotionReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Vous devez être connecté pour voir votre Dashboard.");
        setLoading(false);
        return;
      }

      const metadataName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0];

      if (metadataName) {
        setUserName(metadataName);
      }

      setUserEmail(user.email ?? "");
      setAvatarUrl(user.user_metadata?.avatar_url ?? "");

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, name, type, date, time, location, description, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("❌ Erreur chargement événements Dashboard :", eventsError);
        setErrorMessage("Impossible de charger vos événements.");
        setLoading(false);
        return;
      }

      const loadedEvents = eventsData ?? [];
      setEvents(loadedEvents);

      if (loadedEvents.length === 0) {
        setGuests([]);
        setLoading(false);
        return;
      }

      const eventIds = loadedEvents.map((event) => event.id);

      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select("id, event_id, status, checked_in, created_at, updated_at")
        .in("event_id", eventIds)
        .order("updated_at", { ascending: false });

      if (guestsError) {
        console.error("❌ Erreur chargement invités Dashboard :", guestsError);
        setErrorMessage("Les événements sont chargés, mais les statistiques des invités sont indisponibles.");
        setGuests([]);
        setLoading(false);
        return;
      }

      setGuests(guestsData ?? []);
      setLoading(false);
    };

    void loadDashboard();
  }, []);

  async function handleDuplicateEvent(eventId: string) {
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "Votre session a expiré. Veuillez vous reconnecter.",
      );
      return;
    }

    const { data: originalEvent, error: eventError } = await supabase
      .from("events")
      .select(
        "name, type, date, time, location, description, owner_id",
      )
      .eq("id", eventId)
      .eq("owner_id", user.id)
      .single();

    if (eventError || !originalEvent) {
      setErrorMessage(
        "Impossible de récupérer l&apos;événement à dupliquer.",
      );
      return;
    }

    const { data: duplicatedEvent, error: duplicateError } =
      await supabase
        .from("events")
        .insert({
          owner_id: user.id,
          name: originalEvent.name + " — Copie",
          type: originalEvent.type,
          date: originalEvent.date,
          time: originalEvent.time,
          location: originalEvent.location,
          description: originalEvent.description,
        })
        .select(
          "id, name, type, date, time, location, description, created_at",
        )
        .single();

    if (duplicateError || !duplicatedEvent) {
      console.error(
        "Erreur duplication événement:",
        duplicateError,
      );
      setErrorMessage(
        "Impossible de créer la copie de l&apos;événement.",
      );
      return;
    }

    const { data: originalGuests, error: guestsError } =
      await supabase
        .from("guests")
        .select(
          "type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug",
        )
        .eq("event_id", eventId);

    if (guestsError) {
      console.error(
        "Erreur récupération invités à dupliquer:",
        guestsError,
      );
      setEvents((current) => [duplicatedEvent, ...current]);
      setErrorMessage(
        "Événement dupliqué, mais les invités n&apos;ont pas pu être copiés.",
      );
      return;
    }

    if (originalGuests && originalGuests.length > 0) {
      const duplicatedGuests = originalGuests.map((guest) => ({
        event_id: duplicatedEvent.id,
        type: guest.type,
        first_name_1: guest.first_name_1,
        last_name_1: guest.last_name_1,
        first_name_2: guest.first_name_2,
        last_name_2: guest.last_name_2,
        whatsapp: guest.whatsapp,
        status: "pending",
        slug:
          guest.slug +
          "-copy-" +
          Math.random().toString(36).slice(2, 8),
        checked_in: false,
        checked_in_at: null,
      }));

      const { error: insertGuestsError } = await supabase
        .from("guests")
        .insert(duplicatedGuests);

      if (insertGuestsError) {
        console.error(
          "Erreur création invités dupliqués:",
          insertGuestsError,
        );
        setEvents((current) => [duplicatedEvent, ...current]);
        setErrorMessage(
          "Événement dupliqué, mais les invités n&apos;ont pas pu être copiés.",
        );
        return;
      }
    }

    setEvents((current) => [duplicatedEvent, ...current]);
  }

  async function handleDeleteEvent(eventId: string, eventName: string) {
    const confirmed = window.confirm(
      'Supprimer l&apos;événement "' + eventName + '" ? Cette action est irréversible.',
    );

    if (!confirmed) return;

    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "Votre session a expiré. Veuillez vous reconnecter.",
      );
      return;
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Erreur suppression événement:", error);
      setErrorMessage(
        "Impossible de supprimer cet événement. Veuillez réessayer.",
      );
      return;
    }

    setEvents((current) =>
      current.filter((item) => item.id !== eventId),
    );
  }

  const globalStats = useMemo(() => {
    const total = guests.length;
    const confirmed = guests.filter((guest) => guest.status === "confirmed").length;
    const checkedIn = guests.filter((guest) => guest.checked_in).length;
    const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const checkInRate = confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0;

    return { total, confirmed, checkedIn, confirmationRate, checkInRate };
  }, [guests]);

  const nextEvent = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => !event.date || new Date(event.date + "T23:59:59") >= now)
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      })[0] ?? null;
  }, [events]);

  const recentActivity = useMemo(() => {
    return guests
      .filter((guest) => guest.updated_at || guest.created_at)
      .slice(0, 6)
      .map((guest) => {
        const event = events.find((item) => item.id === guest.event_id);
        const date = guest.updated_at || guest.created_at;

        let title = "Invité mis à jour";
        let icon = "↻";
        let tone = "text-sky-700 bg-sky-50";

        if (guest.checked_in) {
          title = "Entrée enregistrée";
          icon = "✓";
          tone = "text-emerald-600 bg-emerald-50";
        } else if (guest.status === "confirmed") {
          title = "Invitation confirmée";
          icon = "✓";
          tone = "text-emerald-600 bg-emerald-50";
        } else if (guest.status === "declined") {
          title = "Invitation refusée";
          icon = "×";
          tone = "text-red-600 bg-red-50";
        } else {
          title = "Invitation en attente";
          icon = "…";
          tone = "text-amber-600 bg-amber-50";
        }

        return { id: guest.id, title, eventName: event?.name || "Événement", date, icon, tone };
      });
  }, [guests, events]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_30%),radial-gradient(circle_at_90%_15%,_rgba(30,64,175,0.08),_transparent_28%),#f7f9fc] text-zinc-950">
      <style jsx>{`
        @keyframes eventStudioShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .event-studio-shift {
          background-size: 200% 200%;
          animation: eventStudioShift 16s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .event-studio-shift { animation: none; }
        }
      `}</style>

      {/* La navigation globale est fournie par le RootLayout. */}eader>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

        <section className={["event-studio-shift relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(120deg,#09090b,#17134a,#2e1065,#09090b)] px-6 py-8 shadow-[0_25px_70px_rgba(15,23,42,0.18)] transition-all duration-500 ease-out sm:px-8 lg:px-10 lg:py-9 motion-reduce:transition-none",motionReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"].join(" ")}>
          <div className="absolute right-[-80px] top-[-120px] h-80 w-80 rounded-full bg-sky-500/10 blur-3xl motion-safe:animate-pulse" />
          <div className="absolute bottom-[-130px] left-1/3 h-80 w-80 rounded-full bg-sky-600/15 blur-3xl motion-safe:animate-pulse" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Tableau de bord</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Bonjour {userName} 👋</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">Pilotez vos événements, vos invitations et vos invités depuis un seul espace.</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Création</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">RSVP</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Event Control</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              {nextEvent && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Prochain rendez-vous</p>
                  <p className="mt-1 max-w-[240px] truncate text-sm font-bold text-white">{nextEvent.name}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {getDaysUntil(nextEvent.date) === 0 ? "Aujourd’hui" : getDaysUntil(nextEvent.date) === 1 ? "Demain" : getDaysUntil(nextEvent.date) ? "Dans " + getDaysUntil(nextEvent.date) + " jours" : "Date à définir"}
                  </p>
                </div>
              )}

              <Link href="/events/new" className="group relative inline-flex w-fit items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-zinc-950 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="absolute inset-y-0 left-[-35%] w-1/4 skew-x-[-18deg] bg-white/60 opacity-0 blur-sm transition-all duration-700 group-hover:left-[115%] group-hover:opacity-100 motion-reduce:transition-none" />
                <span className="relative text-lg text-blue-950 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">+</span>
                <span className="relative">Créer un événement</span>
              </Link>
            </div>
          </div>
        </section>

        {errorMessage && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">{errorMessage}</div>}

        <section className={["mt-10 transition-all duration-500 ease-out motion-reduce:transition-none",motionReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"].join(" ")}>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Vue générale</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Vos indicateurs</h2>
            <p className="mt-1 text-sm text-zinc-500">Une vision rapide de votre activité événementielle.</p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-3xl bg-white" />)}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="▦" label="Événements" value={events.length} detail="Créés par vous" />
              <StatCard icon="◎" label="Invités" value={globalStats.total} detail="Sur vos événements" />
              <StatCard icon="✓" label="Confirmés" value={globalStats.confirmed} detail={globalStats.confirmationRate + "% de confirmation"} />
              <StatCard icon="→" label="Entrées" value={globalStats.checkedIn} detail={globalStats.checkInRate + "% des confirmés"} />
            </div>
          )}
        </section>

        <section className={["mt-10 grid gap-6 transition-all duration-500 ease-out motion-reduce:transition-none lg:grid-cols-[1.25fr_0.75fr]",motionReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"].join(" ")} style={{ transitionDelay: "120ms" }}>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Agenda</p>
                <h2 className="mt-1 text-xl font-black">Prochain événement</h2>
              </div>
              {nextEvent && <Link href={"/events/" + nextEvent.id} className="text-xs font-bold text-sky-700 hover:text-sky-800">Ouvrir →</Link>}
            </div>

            {loading ? (
              <div className="p-7"><div className="h-36 animate-pulse rounded-2xl bg-zinc-100" /></div>
            ) : nextEvent ? (
              <div className="relative p-6 sm:p-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 text-white">
                    <span className="text-xs font-bold uppercase">{nextEvent.date ? new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(nextEvent.date + "T12:00:00")) : "Date"}</span>
                    <span className="mt-1 text-3xl font-black">{nextEvent.date ? new Date(nextEvent.date + "T12:00:00").getDate() : "—"}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={getEventStatus(nextEvent)} />
                      {nextEvent.type && <span className="text-xs font-medium text-zinc-400">{nextEvent.type}</span>}
                    </div>
                    <h3 className="mt-3 truncate text-2xl font-black">{nextEvent.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span>📅 {formatDate(nextEvent.date)}</span>
                      {nextEvent.time && <span>🕐 {nextEvent.time}</span>}
                      {nextEvent.location && <span className="truncate">📍 {nextEvent.location}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-6">
                  <div><p className="text-xs text-zinc-400">Invités</p><p className="mt-1 text-lg font-black">{guests.filter((guest) => guest.event_id === nextEvent.id).length}</p></div>
                  <div><p className="text-xs text-zinc-400">Confirmés</p><p className="mt-1 text-lg font-black text-emerald-600">{guests.filter((guest) => guest.event_id === nextEvent.id && guest.status === "confirmed").length}</p></div>
                  <div><p className="text-xs text-zinc-400">Entrées</p><p className="mt-1 text-lg font-black text-sky-700">{guests.filter((guest) => guest.event_id === nextEvent.id && guest.checked_in).length}</p></div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">+</div>
                <h3 className="mt-5 text-lg font-black">Aucun événement à venir</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Créez votre prochain événement pour commencer à construire votre expérience.</p>
                <Link href="/events/new" className="mt-5 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-950">Créer un événement</Link>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-6 py-5 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Suivi</p>
              <h2 className="mt-1 text-xl font-black">Activité récente</h2>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="space-y-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-zinc-100" />)}</div>
              ) : recentActivity.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">•</div>
                  <p className="mt-4 text-sm font-bold text-zinc-700">Aucune activité récente</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">Les actions sur vos invités apparaîtront ici.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="group flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none", activity.tone].join(" ")}>{activity.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zinc-800">{activity.title}</p>
                        <p className="truncate text-xs text-zinc-400">{activity.eventName}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-zinc-400">{formatActivityDate(activity.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </section>

        <section className={["mt-12 transition-all duration-500 ease-out motion-reduce:transition-none",motionReady ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"].join(" ")} style={{ transitionDelay: "220ms" }}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Gestion</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">Mes événements</h2>
              <p className="mt-1 text-sm text-zinc-500">Retrouvez et pilotez tous vos événements.</p>
            </div>

            {!loading && events.length > 0 && <Link href="/events/new" className="inline-flex w-fit items-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800">+ Nouvel événement</Link>}
          </div>

          {loading ? (
            <div className="grid gap-6 xl:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-[2rem] bg-white" />)}</div>
          ) : events.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-sky-700">+</div>
              <h3 className="mt-5 text-xl font-black">Votre espace est prêt</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Créez votre premier événement et commencez à gérer vos invités.</p>
              <Link href="/events/new" className="mt-6 inline-flex rounded-xl bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-950">Créer mon premier événement</Link>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {events.map((event) => {
                const eventGuests = guests.filter((guest) => guest.event_id === event.id);
                const total = eventGuests.length;
                const confirmed = eventGuests.filter((guest) => guest.status === "confirmed").length;
                const pending = eventGuests.filter((guest) => guest.status === "pending").length;
                const declined = eventGuests.filter((guest) => guest.status === "declined").length;
                const checkedIn = eventGuests.filter((guest) => guest.checked_in).length;
                const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
                const checkInRate = confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0;

                return (
                  <article key={event.id} style={{ transitionDelay: `${Math.min(events.indexOf(event), 5) * 70}ms` }} className={["group relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-sm ring-1 ring-transparent transition-all duration-500 ease-out hover:-translate-y-1 hover:border-sky-300 hover:ring-sky-500 hover:shadow-2xl hover:shadow-sky-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0",motionReady ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"].join(" ")}>
                    <div className="relative overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-700 p-6 text-white sm:p-7">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-sky-500/15 motion-reduce:transition-none" />
                      <div className="pointer-events-none absolute -bottom-20 -left-10 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl transition-all duration-700 group-hover:translate-x-4 motion-reduce:transition-none" />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">{event.type || "Événement"}</p>
                          <h3 className="mt-2 truncate text-2xl font-black tracking-tight transition-colors duration-300 group-hover:text-sky-700">{event.name}</h3>
                        </div>
                        <StatusBadge status={getEventStatus(event)} />
                      </div>

                      <div className="relative mt-5 flex flex-wrap gap-2 text-xs text-zinc-300">
                        <span className="rounded-xl bg-white/10 px-3 py-2">📅 {formatShortDate(event.date)}</span>
                        {event.time && <span className="rounded-xl bg-white/10 px-3 py-2">🕐 {event.time}</span>}
                        {event.location && <span className="max-w-full truncate rounded-xl bg-white/10 px-3 py-2">📍 {event.location}</span>}
                      </div>
                    </div>

                    <div className="p-6 sm:p-7">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="group/stat rounded-2xl bg-zinc-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-sky-50 hover:shadow-md motion-reduce:transition-none"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Invités</p><p className="mt-2 text-2xl font-black text-zinc-900">{total}</p></div>
                        <div className="group/stat rounded-2xl bg-emerald-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-100 hover:shadow-md motion-reduce:transition-none"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Confirmés</p><p className="mt-2 text-2xl font-black text-emerald-800">{confirmed}</p></div>
                        <div className="group/stat rounded-2xl bg-amber-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-100 hover:shadow-md motion-reduce:transition-none"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">En attente</p><p className="mt-2 text-2xl font-black text-amber-800">{pending}</p></div>
                        <div className="group/stat rounded-2xl bg-blue-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-100 hover:shadow-md motion-reduce:transition-none"><p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Entrées</p><p className="mt-2 text-2xl font-black text-2xl font-black text-sky-800">{checkedIn}</p></div>
                      </div>

                      <div className="mt-7 space-y-5">
                        <ProgressBar label="Taux de confirmation" value={confirmationRate} />
                        <ProgressBar label="Taux d’entrée" value={checkInRate} />
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
                        <div><p className="text-xs text-zinc-400">Refusées</p><p className="mt-1 text-sm font-bold text-red-600">{declined}</p></div>
                        <div className="text-right"><p className="text-xs text-zinc-400">Créé le</p><p className="mt-1 text-xs font-bold text-zinc-700">{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(event.created_at))}</p></div>
                      </div>

                      <div className="relative mt-6 grid gap-2 sm:grid-cols-2">
                        <Link
                          href={"/events/" + event.id}
                          className="group inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm font-bold text-zinc-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-blue-50 hover:text-blue-900 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                        >
                          <span>Ouvrir</span><span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                        </Link>

                        <Link
                          href={"/events/" + event.id + "/edit"}
                          className="group inline-flex items-center justify-center gap-2 rounded-xl border border-sky-600 bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-700 hover:shadow-md motion-reduce:transition-none"
                        >
                          <span>Modifier</span><span className="transition-transform duration-300 group-hover:rotate-12">✏️</span>
                        </Link>

                        <div className="relative sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => setEventMenuOpen((current) => current === event.id ? null : event.id)}
                            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-800 hover:bg-blue-50 hover:text-blue-900 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                            aria-expanded={eventMenuOpen === event.id}
                            aria-haspopup="menu"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-xs shadow-sm">•••</span>
                            <span>Plus d’actions</span>
                          </button>

                          {eventMenuOpen === event.id && (
                            <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl shadow-zinc-950/15 animate-in fade-in slide-in-from-bottom-2 duration-200">
                              <Link onClick={() => setEventMenuOpen(null)} href={"/events/" + event.id + "/guests"} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-900">👥 Invités</Link>
                              <button type="button" onClick={() => { setEventMenuOpen(null); void handleDuplicateEvent(event.id); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-900">📑 Dupliquer</button>
                              <Link onClick={() => setEventMenuOpen(null)} href={"/events/" + event.id + "/control"} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">🎛️ Event Control</Link>
                              <button type="button" onClick={() => { setEventMenuOpen(null); void handleDeleteEvent(event.id, event.name); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50">🗑️ Supprimer</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-zinc-200 py-7 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">
            <span className="h-px w-8 bg-zinc-200" />
            Event Studio
            <span className="h-px w-8 bg-zinc-200" />
          </div>
          <p className="text-xs font-medium text-zinc-400">Event Studio · Centre de pilotage événementiel</p>
        </footer>

      </div>
    </main>
  );
}
