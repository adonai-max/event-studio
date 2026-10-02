"use client";

import { useEffect, useState } from "react";
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
};

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage(
          "Vous devez être connecté pour voir votre Dashboard.",
        );
        setLoading(false);
        return;
      }

      const { data: eventsData, error: eventsError } =
        await supabase
          .from("events")
          .select(
            "id, name, type, date, time, location, description, created_at",
          )
          .eq("owner_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (eventsError) {
        console.error(
          "❌ Erreur chargement événements Dashboard :",
          eventsError,
        );

        setErrorMessage(
          "Impossible de charger vos événements.",
        );
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

      const eventIds = loadedEvents.map(
        (event) => event.id,
      );

      const { data: guestsData, error: guestsError } =
        await supabase
          .from("guests")
          .select(
            "id, event_id, status, checked_in",
          )
          .in("event_id", eventIds);

      if (guestsError) {
        console.error(
          "❌ Erreur chargement invités Dashboard :",
          guestsError,
        );

        setErrorMessage(
          "Les événements sont chargés, mais les statistiques des invités sont indisponibles.",
        );

        setGuests([]);
        setLoading(false);
        return;
      }

      setGuests(guestsData ?? []);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <header>
          <p className="text-sm font-semibold text-indigo-600">
            EVENT STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-600">
            Gérez vos événements, vos invitations et vos invités
            depuis un seul espace.
          </p>
        </header>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* VUE GÉNÉRALE */}
        <section className="mt-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            

            

            

          </div>
        </section>

        {/* MES ÉVÉNEMENTS */}
        <section className="mt-10">

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-zinc-900">
                Mes événements
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Chaque événement possède ses propres invités,
                RSVP et statistiques.
              </p>
            </div>

            <a
              href="/events/new"
              className="inline-flex w-fit rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Créer un événement
            </a>

          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
              <p className="text-zinc-500">
                Chargement de votre Dashboard...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">

              <h2 className="text-xl font-semibold text-zinc-900">
                Aucun événement pour le moment
              </h2>

              <p className="mx-auto mt-2 max-w-md text-zinc-500">
                Créez votre premier événement pour commencer à
                construire votre invitation.
              </p>

              <a
                href="/events/new"
                className="mt-6 inline-flex rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white"
              >
                Créer un événement
              </a>

            </div>
          ) : (
            <div className="space-y-8">

              {events.map((event) => {

                /*
                 * IMPORTANT :
                 * On récupère UNIQUEMENT les invités appartenant
                 * à cet événement.
                 */
                const eventGuests = guests.filter(
                  (guest) =>
                    guest.event_id === event.id,
                );

                const eventTotal =
                  eventGuests.length;

                const eventConfirmed =
                  eventGuests.filter(
                    (guest) =>
                      guest.status === "confirmed",
                  ).length;

                const eventPending =
                  eventGuests.filter(
                    (guest) =>
                      guest.status === "pending",
                  ).length;

                const eventDeclined =
                  eventGuests.filter(
                    (guest) =>
                      guest.status === "declined",
                  ).length;

                const eventCheckedIn =
                  eventGuests.filter(
                    (guest) =>
                      guest.checked_in,
                  ).length;

                const eventConfirmationRate =
                  eventTotal > 0
                    ? Math.round(
                        (eventConfirmed /
                          eventTotal) *
                          100,
                      )
                    : 0;

                const eventCheckInRate =
                  eventConfirmed > 0
                    ? Math.round(
                        (eventCheckedIn /
                          eventConfirmed) *
                          100,
                      )
                    : 0;

                return (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                  >

                    {/* EN-TÊTE DE L'ÉVÉNEMENT */}
                    <div className="border-b border-zinc-200 bg-zinc-50 p-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            {event.type || "Événement"}
                          </p>

                          <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                            {event.name}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">

                            {event.date && (
                              <span>
                                📅 {event.date}
                              </span>
                            )}

                            {event.time && (
                              <span>
                                🕐 {event.time}
                              </span>
                            )}

                            {event.location && (
                              <span>
                                📍 {event.location}
                              </span>
                            )}

                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Actif
                        </span>

                      </div>

                      {event.description && (
                        <p className="mt-4 max-w-3xl text-sm text-zinc-500">
                          {event.description}
                        </p>
                      )}

                    </div>

                    {/* STATISTIQUES DE CET ÉVÉNEMENT UNIQUEMENT */}
                    <div className="p-6">

                      <div className="mb-5">
                        <h4 className="text-lg font-bold text-zinc-900">
                          Statistiques de cet événement
                        </h4>

                        <p className="mt-1 text-sm text-zinc-500">
                          Ces chiffres concernent uniquement :
                          <span className="font-semibold text-zinc-700">
                            {" "}{event.name}
                          </span>
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl bg-zinc-50 p-5">
                          <p className="text-sm font-medium text-zinc-500">
                            Invités
                          </p>

                          <p className="mt-2 text-3xl font-bold text-zinc-900">
                            {eventTotal}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            Total de cet événement
                          </p>
                        </div>

                        <div className="rounded-2xl bg-green-50 p-5">
                          <p className="text-sm font-medium text-green-700">
                            Confirmés
                          </p>

                          <p className="mt-2 text-3xl font-bold text-green-800">
                            {eventConfirmed}
                          </p>

                          <p className="mt-1 text-xs text-green-600">
                            {eventConfirmationRate}% de confirmation
                          </p>
                        </div>

                        <div className="rounded-2xl bg-amber-50 p-5">
                          <p className="text-sm font-medium text-amber-700">
                            En attente
                          </p>

                          <p className="mt-2 text-3xl font-bold text-amber-800">
                            {eventPending}
                          </p>

                          <p className="mt-1 text-xs text-amber-600">
                            RSVP en attente
                          </p>
                        </div>

                        <div className="rounded-2xl bg-red-50 p-5">
                          <p className="text-sm font-medium text-red-700">
                            Refusés
                          </p>

                          <p className="mt-2 text-3xl font-bold text-red-800">
                            {eventDeclined}
                          </p>

                          <p className="mt-1 text-xs text-red-600">
                            Invitations refusées
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        <div className="rounded-2xl bg-indigo-50 p-5">
                          <p className="text-sm font-medium text-indigo-700">
                            Entrées
                          </p>

                          <p className="mt-2 text-3xl font-bold text-indigo-800">
                            {eventCheckedIn}
                          </p>

                          <p className="mt-1 text-xs text-indigo-600">
                            {eventCheckInRate}% des confirmés
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-5">
                          <p className="text-sm font-medium text-blue-700">
                            Taux de confirmation
                          </p>

                          <p className="mt-2 text-3xl font-bold text-blue-800">
                            {eventConfirmationRate}%
                          </p>

                          <p className="mt-1 text-xs text-blue-600">
                            Confirmés / invités
                          </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-5">
                          <p className="text-sm font-medium text-purple-700">
                            Taux d'entrée
                          </p>

                          <p className="mt-2 text-3xl font-bold text-purple-800">
                            {eventCheckInRate}%
                          </p>

                          <p className="mt-1 text-xs text-purple-600">
                            Entrées / confirmés
                          </p>
                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                        <a
                          href={"/events/" + event.id}
                          className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                        >
                          Ouvrir l'événement
                        </a>

                        <a
                          href={"/events/" + event.id + "/guests"}
                          className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                        >
                          Voir les invités
                        </a>

                        <a
                          href={"/events/" + event.id + "/control"}
                          className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                          Event Control
                        </a>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
