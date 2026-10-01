"use client";

import EventNavigation from "../../../components/EventNavigation";
import {
  Guest,
  GuestStatus,
  useEvent,
} from "../../../context/EventContext";

export default function EventControlPage() {
  const { event, guests, updateGuestStatus } = useEvent();

  const eventName = event.name || "Mon événement";

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

  const confirmationRate =
    totalGuests === 0
      ? 0
      : Math.round((confirmedGuests / totalGuests) * 100);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <EventNavigation />

        <header className="border-b border-zinc-200 pb-8">
          <p className="text-sm font-semibold text-indigo-600">
            EVENT CONTROL
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
            Centre de contrôle
          </h1>

          <p className="mt-3 text-zinc-600">
            Suivez en temps réel les réponses et la participation à{" "}
            <span className="font-semibold text-zinc-900">
              {eventName}
            </span>
            .
          </p>
        </header>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <Stat
            title="Total invités"
            value={String(totalGuests)}
            icon="👥"
          />

          <Stat
            title="Confirmés"
            value={String(confirmedGuests)}
            icon="✓"
          />

          <Stat
            title="En attente"
            value={String(pendingGuests)}
            icon="⏳"
          />

          <Stat
            title="Refusés"
            value={String(declinedGuests)}
            icon="✕"
          />

          <Stat
            title="Confirmation"
            value={`${confirmationRate}%`}
            icon="📈"
          />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <ControlSummary
            title="Présences confirmées"
            value={confirmedGuests}
            total={totalGuests}
            description="Invités ayant confirmé leur présence."
          />

          <ControlSummary
            title="Réponses en attente"
            value={pendingGuests}
            total={totalGuests}
            description="Invités qui n'ont pas encore répondu."
          />

          <ControlSummary
            title="Invitations refusées"
            value={declinedGuests}
            total={totalGuests}
            description="Invités ayant indiqué leur absence."
          />
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Suivi des invités
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Modifiez le statut d'un invité directement depuis Event
                  Control.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {totalGuests} invité{totalGuests > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {guests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-zinc-200">
              {guests.map((guest) => (
                <GuestControlRow
                  key={guest.id}
                  guest={guest}
                  onStatusChange={updateGuestStatus}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <QuickAction
            icon="💌"
            title="Invitation Builder"
            description="Personnalisez l'invitation de votre événement."
            href="/events/demo/invitation"
          />

          <QuickAction
            icon="👥"
            title="Gestion des invités"
            description="Ajoutez, modifiez ou supprimez vos invités."
            href="/events/demo/guests"
          />
        </section>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">{title}</p>

        <span className="text-xl">{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function ControlSummary({
  title,
  value,
  total,
  description,
}: {
  title: string;
  value: number;
  total: number;
  description: string;
}) {
  const percentage =
    total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {value}
          </p>
        </div>

        <p className="text-sm font-semibold text-indigo-600">
          {percentage}%
        </p>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function GuestControlRow({
  guest,
  onStatusChange,
}: {
  guest: Guest;
  onStatusChange: (
    guestId: number,
    status: GuestStatus,
  ) => void;
}) {
  const guestName =
    guest.type === "couple"
      ? `${guest.firstName1} ${guest.lastName1} & ${guest.firstName2} ${guest.lastName2}`
      : `${guest.firstName1} ${guest.lastName1}`;

  return (
    <div className="p-6 transition hover:bg-zinc-50">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-900">
              {guestName}
            </h3>

            <StatusBadge status={guest.status} />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span>
              {guest.type === "couple"
                ? "Invitation couple"
                : "Invitation individuelle"}
            </span>

            <span>WhatsApp : {guest.whatsapp}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusButton
            label="Confirmer"
            active={guest.status === "confirmed"}
            onClick={() =>
              onStatusChange(guest.id, "confirmed")
            }
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            activeClassName="bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
          />

          <StatusButton
            label="En attente"
            active={guest.status === "pending"}
            onClick={() =>
              onStatusChange(guest.id, "pending")
            }
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            activeClassName="bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
          />

          <StatusButton
            label="Refuser"
            active={guest.status === "declined"}
            onClick={() =>
              onStatusChange(guest.id, "declined")
            }
            className="border-red-200 text-red-700 hover:bg-red-50"
            activeClassName="bg-red-600 text-white border-red-600 hover:bg-red-700"
          />
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  label,
  active,
  onClick,
  className,
  activeClassName,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className: string;
  activeClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
        active ? activeClassName : className
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: GuestStatus;
}) {
  if (status === "confirmed") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Confirmé
      </span>
    );
  }

  if (status === "declined") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Refusé
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      En attente
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-72 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-5xl">📊</div>

        <h3 className="mt-4 text-lg font-semibold text-zinc-900">
          Aucun invité à suivre
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Ajoutez d'abord vos invités afin de pouvoir suivre leurs
          réponses dans Event Control.
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-lg font-semibold text-zinc-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <span className="mt-5 inline-block text-sm font-semibold text-indigo-600">
        Ouvrir →
      </span>
    </a>
  );
}