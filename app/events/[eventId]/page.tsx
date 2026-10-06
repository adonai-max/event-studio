"use client";

import { useEffect, useState } from "react";
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
      <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_30%),#f7f9fc]">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <p className="text-zinc-500">
            Chargement de l&apos;événement...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !event) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-800">
              Événement inaccessible
            </h1>

            <p className="mt-2 text-red-700">
              {errorMessage}
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Espace événement</p><p className="mt-1 truncate text-sm font-bold text-zinc-900">{event.name}</p></div>
          <button onClick={() => router.push("/dashboard")} className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">← Tableau de bord</button>
        </div>

        <header className="mt-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {event.type || "Événement"}
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
            {event.name}
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600">
            Gérez cet événement, vos invitations, vos invités et
            les entrées depuis Event Studio.
          </p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-3">

          <button
            onClick={() =>
              router.push("/events/" + event.id + "/invitation")
            }
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-2xl">💌</p>

            <h2 className="mt-4 text-xl font-bold text-zinc-900">
              Invitation
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Créez et personnalisez l&apos;invitation de votre événement.
            </p>
          </button>

          <button
            onClick={() =>
              router.push("/events/" + event.id + "/guests")
            }
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-2xl">👥</p>

            <h2 className="mt-4 text-xl font-bold text-zinc-900">
              Invités
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Gérez votre liste d&apos;invités et leurs réponses RSVP.
            </p>
          </button>

          <button
            onClick={() =>
              router.push("/events/" + event.id + "/control")
            }
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-2xl">🎟️</p>

            <h2 className="mt-4 text-xl font-bold text-zinc-900">
              Event Control
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Contrôlez les entrées, scannez les QR codes et suivez
              les statistiques.
            </p>
          </button>

        </section>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-zinc-900">
            Informations de l&apos;événement
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            {event.date && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Date
                </p>

                <p className="mt-1 text-zinc-800">
                  📅 {event.date}
                </p>
              </div>
            )}

            {event.time && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Heure
                </p>

                <p className="mt-1 text-zinc-800">
                  🕐 {event.time}
                </p>
              </div>
            )}

            {event.location && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Lieu
                </p>

                <p className="mt-1 text-zinc-800">
                  📍 {event.location}
                </p>
              </div>
            )}

          </div>

          {event.description && (
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {event.description}
              </p>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
