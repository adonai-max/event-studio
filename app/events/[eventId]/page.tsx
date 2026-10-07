"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import EventNavigation from "@/app/components/EventNavigation";

type EventItem = {
  id: string;
  name: string;
  type: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
};

export default function EventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = String(params.eventId);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, type, date, time, location, description",
        )
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (error || !data) {
        console.error(
          "❌ Erreur chargement événement :",
          error,
        );

        setErrorMessage(
          "Événement introuvable ou vous n'avez pas accès à cet événement.",
        );

        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(14,165,233,.13),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(79,70,229,.10),transparent_30%),#f7f9fc]">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-200/70" />
          <div className="mt-6 h-72 animate-pulse rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,.06)]" />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="h-44 animate-pulse rounded-[24px] bg-white" />
            <div className="h-44 animate-pulse rounded-[24px] bg-white" />
            <div className="h-44 animate-pulse rounded-[24px] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(14,165,233,.13),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(79,70,229,.10),transparent_30%),#f7f9fc] event-page-motion">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <EventNavigation eventId={event.id} eventName={event.name} />

        <section className="event-motion-card relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,.09)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(14,165,233,.08),transparent_42%,rgba(99,102,241,.08))]" />
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-indigo-200/20 blur-3xl" />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-sky-700">
                  {event.type || "Événement"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Espace actif
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-5xl">
                {event.name}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Pilotez votre événement depuis un seul espace : invitation, invités et contrôle des entrées.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {event.date && (
                  <div className="event-motion-interactive rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Date</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">📅 {event.date}</p>
                  </div>
                )}
                {event.time && (
                  <div className="event-motion-interactive rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Heure</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">🕐 {event.time}</p>
                  </div>
                )}
                {event.location && (
                  <div className="event-motion-interactive min-w-[210px] rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Lieu</p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-800">📍 {event.location}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/events/" + event.id + "/edit")}
              className="event-motion-interactive inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
            >
              ✦ Modifier l'événement
            </button>
          </div>
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <button onClick={() => router.push("/events/" + event.id + "/invitation")} className="event-motion-card event-motion-interactive group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,.06)] hover:border-sky-300 hover:shadow-[0_18px_45px_rgba(14,165,233,.12)]">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">💌</span>
              <span className="text-slate-300 transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-sky-600">01 · Création</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Invitation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Concevez une invitation élégante et préparez votre expérience RSVP.</p>
          </button>

          <button onClick={() => router.push("/events/" + event.id + "/guests")} className="event-motion-card event-motion-interactive group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,.06)] hover:border-violet-300 hover:shadow-[0_18px_45px_rgba(124,58,237,.12)]">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl ring-1 ring-violet-100">👥</span>
              <span className="text-slate-300 transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-violet-600">02 · Organisation</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Invités</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Gérez les invités, les couples, les confirmations et les réponses RSVP.</p>
          </button>

          <button onClick={() => router.push("/events/" + event.id + "/control")} className="event-motion-card event-motion-interactive group rounded-[24px] border border-slate-200 bg-white p-6 text-left shadow-[0_12px_35px_rgba(15,23,42,.06)] hover:border-emerald-300 hover:shadow-[0_18px_45px_rgba(16,185,129,.12)]">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl ring-1 ring-emerald-100">🎟️</span>
              <span className="text-slate-300 transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">03 · Contrôle</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Event Control</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Scannez les QR codes, validez les entrées et suivez le contrôle en temps réel.</p>
          </button>
        </section>

        <section className="event-motion-card mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-sky-600">Vue d'ensemble</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Informations de l'événement</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">Dernières données enregistrées</span>
          </div>

          <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Type", event.type || "Événement", "✦"],
              ["Date", event.date || "Non définie", "📅"],
              ["Heure", event.time || "Non définie", "🕐"],
              ["Lieu", event.location || "Non défini", "📍"],
            ].map(([label, value, icon]) => (
              <div key={label} className="event-motion-interactive bg-white p-5 sm:p-6">
                <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{icon} {value}</p>
              </div>
            ))}
          </div>

          {event.description && (
            <div className="border-t border-slate-100 px-6 py-6 sm:px-7">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">Description</p>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">{event.description}</p>
            </div>
          )}
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-xs text-slate-400">Event Studio · Centre de pilotage de votre événement</p>
          <button onClick={() => router.push("/dashboard")} className="text-xs font-bold text-slate-500 transition hover:text-sky-700">
            ← Retour au Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
