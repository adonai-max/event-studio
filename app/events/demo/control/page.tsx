"use client";

import { useState } from "react";

import EventNavigation from "../../../components/EventNavigation";
import QRScanner from "../../../../components/QRScanner";

import {
  Guest,
  GuestStatus,
  useEvent,
} from "../../../context/EventContext";

export default function EventControlPage() {
  const {
    event,
    guests,
    updateGuestStatus,
    checkInGuest,
  } = useEvent();

  const [scannedGuest, setScannedGuest] =
    useState<Guest | null>(null);

  const [scanMessage, setScanMessage] = useState("");
  const [scanError, setScanError] = useState("");
  const [lastScannedValue, setLastScannedValue] = useState("");

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

  const checkedInGuests = guests.filter(
    (guest) => guest.checkedIn,
  ).length;

  const checkInRate =
    totalGuests === 0
      ? 0
      : Math.round((checkedInGuests / totalGuests) * 100);

  const handleScanSuccess = (decodedText: string) => {
    const scannedValue = decodedText.trim();

    console.log("🔥 QR DÉTECTÉ DANS EVENT CONTROL :", scannedValue);

    setLastScannedValue(scannedValue);
    setScanError("");
    setScanMessage("");

    let guestIdentifier = scannedValue;

    try {
      const parsedUrl = new URL(scannedValue);

      const pathParts = parsedUrl.pathname
        .split("/")
        .filter(Boolean);

      const invitationIndex = pathParts.indexOf("i");

      if (
        invitationIndex !== -1 &&
        pathParts[invitationIndex + 1]
      ) {
        guestIdentifier = decodeURIComponent(
          pathParts[invitationIndex + 1],
        );
      }
    } catch {
      // Le QR peut contenir directement un slug ou un ID.
    }

    guestIdentifier = guestIdentifier.trim();

    console.log(
      "🔎 IDENTIFIANT INVITÉ EXTRAIT :",
      guestIdentifier,
    );

    const guest = guests.find(
      (currentGuest) =>
        currentGuest.slug === guestIdentifier ||
        String(currentGuest.id) === guestIdentifier,
    );

    if (!guest) {
      console.log(
        "❌ INVITÉ INTROUVABLE. INVITÉS DISPONIBLES :",
        guests,
      );

      setScannedGuest(null);

      setScanError(
        "QR détecté, mais invité introuvable.",
      );

      return;
    }

    console.log("✅ INVITÉ TROUVÉ :", guest);

    setScannedGuest(guest);

    if (guest.checkedIn) {
      setScanMessage(
        "Cette invitation a déjà été enregistrée à l'entrée.",
      );
    } else {
      setScanMessage(
        "Invité identifié. Vous pouvez maintenant confirmer son entrée.",
      );
    }
  };

  const handleConfirmEntry = () => {
    if (!scannedGuest) return;

    if (scannedGuest.checkedIn) {
      return;
    }

    checkInGuest(scannedGuest.id);

    const checkedInAt = new Date().toISOString();

    setScanMessage(
      "Entrée confirmée avec succès. Bienvenue à l'événement !",
    );

    setScannedGuest({
      ...scannedGuest,
      checkedIn: true,
      checkedInAt,
    });
  };

  const handleScanError = () => {
    // Les erreurs normales de lecture QR sont ignorées.
  };

  const getGuestName = (guest: Guest) => {
    if (guest.type === "couple") {
      return (
        guest.firstName1 +
        " " +
        guest.lastName1 +
        " & " +
        guest.firstName2 +
        " " +
        guest.lastName2
      );
    }

    return guest.firstName1 + " " + guest.lastName1;
  };

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

        <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-emerald-600">
              CONTRÔLE D'ACCÈS
            </p>

            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              Scanner une invitation
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Scannez le QR code présent sur l'invitation afin
              d'identifier automatiquement l'invité et d'enregistrer
              son entrée.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              {!scannedGuest && !scanError && (
                <div className="flex min-h-64 items-center justify-center text-center">
                  <div>
                    <div className="text-5xl">🎟️</div>

                    <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                      En attente d'un scan
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      Scannez une invitation pour afficher les
                      informations de l'invité.
                    </p>

                    {lastScannedValue && (
                      <div className="mt-5 rounded-xl bg-white p-4 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Dernière valeur détectée
                        </p>

                        <p className="mt-2 break-all text-sm font-medium text-zinc-700">
                          {lastScannedValue}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scanError && (
                <div className="flex min-h-64 items-center justify-center text-center">
                  <div className="w-full">
                    <div className="text-5xl">❌</div>

                    <h3 className="mt-4 text-lg font-semibold text-red-700">
                      QR détecté mais invité non trouvé
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {scanError}
                    </p>

                    {lastScannedValue && (
                      <div className="mt-5 rounded-xl border border-red-100 bg-white p-4 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Valeur du QR détectée
                        </p>

                        <p className="mt-2 break-all text-sm font-medium text-zinc-700">
                          {lastScannedValue}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scannedGuest && (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Invité identifié
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                        {getGuestName(scannedGuest)}
                      </h3>
                    </div>

                    {scannedGuest.checkedIn ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Entré
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Non entré
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500">
                        Type d'invitation
                      </span>

                      <span className="font-medium text-zinc-900">
                        {scannedGuest.type === "couple"
                          ? "Couple"
                          : "Individuelle"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500">
                        WhatsApp
                      </span>

                      <span className="font-medium text-zinc-900">
                        {scannedGuest.whatsapp}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500">
                        Confirmation
                      </span>

                      <StatusBadge status={scannedGuest.status} />
                    </div>

                    {scannedGuest.checkedInAt && (
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-500">
                          Entrée enregistrée
                        </span>

                        <span className="font-medium text-zinc-900">
                          {new Date(
                            scannedGuest.checkedInAt,
                          ).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    {scannedGuest.checkedIn ? (
                      <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                        ✓ Cette invitation a déjà été enregistrée.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmEntry}
                        className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                      >
                        ✓ Confirmer l'entrée
                      </button>
                    )}
                  </div>

                  {scanMessage && (
                    <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm font-medium text-indigo-700">
                      {scanMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
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
            title="Entrés"
            value={String(checkedInGuests)}
            icon="🚪"
          />

          <Stat
            title="Présence"
            value={checkInRate + "%"}
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
                  Modifiez le statut d'un invité directement depuis
                  Event Control.
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
        <p className="text-sm font-medium text-zinc-500">
          {title}
        </p>

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
          style={{ width: percentage + "%" }}
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
  let guestName = guest.firstName1 + " " + guest.lastName1;

  if (guest.type === "couple") {
    guestName =
      guest.firstName1 +
      " " +
      guest.lastName1 +
      " & " +
      guest.firstName2 +
      " " +
      guest.lastName2;
  }

  return (
    <div className="p-6 transition hover:bg-zinc-50">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-900">
              {guestName}
            </h3>

            <StatusBadge status={guest.status} />

            {guest.checkedIn && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Entré
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span>
              {guest.type === "couple"
                ? "Invitation couple"
                : "Invitation individuelle"}
            </span>

            <span>WhatsApp : {guest.whatsapp}</span>

            {guest.checkedInAt && (
              <span>
                Entrée :{" "}
                {new Date(
                  guest.checkedInAt,
                ).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
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
            activeClassName="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
          />

          <StatusButton
            label="En attente"
            active={guest.status === "pending"}
            onClick={() =>
              onStatusChange(guest.id, "pending")
            }
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
            activeClassName="border-amber-500 bg-amber-500 text-white hover:bg-amber-600"
          />

          <StatusButton
            label="Refuser"
            active={guest.status === "declined"}
            onClick={() =>
              onStatusChange(guest.id, "declined")
            }
            className="border-red-200 text-red-700 hover:bg-red-50"
            activeClassName="border-red-600 bg-red-600 text-white hover:bg-red-700"
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
      className={
        "rounded-full border px-4 py-2 text-xs font-semibold transition " +
        (active ? activeClassName : className)
      }
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