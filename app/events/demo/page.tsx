"use client";

import { useRouter } from "next/navigation";
import EventNavigation from "../../components/EventNavigation";
import { useDemoEvent } from "../../context/DemoEventContext";

export default function EventPage() {
  const router = useRouter();
  const { event, guests } = useDemoEvent();

  const eventName = event.name || "Mon événement";
  const eventType = event.type || "Événement";
  const eventDate = event.date || "À définir";
  const eventTime = event.time || "À définir";
  const eventLocation = event.location || "À définir";
  const eventDescription =
    event.description || "Aucune description pour le moment.";

  const totalGuests = guests.length;

  const confirmedGuests = guests.filter(
    (guest) => guest.status === "confirmed",
  ).length;

  const pendingGuests = guests.filter(
    (guest) => guest.status === "pending",
  ).length;

  const declinedGuests = guests.filter(
    (guest) => guest.status === "declined",
  ).length;

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <EventNavigation eventId="demo" />

        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              EVENT STUDIO
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
              {eventName}
            </h1>

            <p className="mt-3 text-zinc-600">
              Gérez ici tous les éléments de votre événement.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/events/new")}
            className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Modifier l'événement
          </button>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Invités" value={String(totalGuests)} />
          <Stat title="Confirmés" value={String(confirmedGuests)} />
          <Stat title="En attente" value={String(pendingGuests)} />
          <Stat title="Refusés" value={String(declinedGuests)} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <ControlCard
            title="💌 Invitation"
            description="Créez et personnalisez l'invitation de votre événement."
            action="Créer l'invitation"
            onClick={() => router.push("/events/demo/invitation")}
          />

          <ControlCard
            title="👥 Invités"
            description="Ajoutez vos invités individuellement ou en couple."
            action="Gérer les invités"
            onClick={() => router.push("/events/demo/guests")}
          />

          <ControlCard
            title="📊 Event Control"
            description="Suivez les RSVP et les statistiques de votre événement."
            action="Ouvrir Event Control"
            onClick={() => router.push("/events/demo/control")}
          />
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">
            Informations de l'événement
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Date" value={eventDate} />
            <Info label="Heure" value={eventTime} />
            <Info label="Lieu" value={eventLocation} />
            <Info label="Type" value={eventType} />
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-6">
            <p className="text-sm font-medium text-zinc-500">
              Description
            </p>

            <p className="mt-2 leading-7 text-zinc-700">
              {eventDescription}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function ControlCard({
  title,
  description,
  action,
  onClick,
}: {
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">
        {title}
      </h2>

      <p className="mt-3 min-h-14 leading-7 text-zinc-600">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
      >
        {action}
      </button>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="mt-1 font-semibold text-zinc-900">
        {value}
      </p>
    </div>
  );
}