"use client";

import { useMemo, useState } from "react";
import { Guest, useEvent } from "../../../context/EventContext";
import EventNavigation from "../../../components/EventNavigation";
import QRScanner from "../../../../components/QRScanner";

type GuestFilter = "all" | "pending" | "checkedIn";

export default function EventControlPage() {
  const {
    event,
    guests,
    checkInGuest,
    resetGuestCheckIn,
  } = useEvent();

  const [tableSearch, setTableSearch] = useState("");
  const [guestFilter, setGuestFilter] =
    useState<GuestFilter>("all");

  const [scannedValue, setScannedValue] = useState("");
  const [scannedGuest, setScannedGuest] =
    useState<Guest | null>(null);

  const [message, setMessage] = useState("");

  const totalGuests = guests.length;

  const checkedInGuests = guests.filter(
    (guest) => guest.checkedIn,
  ).length;

  const pendingGuests = guests.filter(
    (guest) => !guest.checkedIn,
  ).length;

  const getGuestName = (guest: Guest) => {
    const firstPerson =
      guest.firstName1 + " " + guest.lastName1;

    if (guest.type === "couple") {
      const secondPerson =
        guest.firstName2 + " " + guest.lastName2;

      return firstPerson + " & " + secondPerson;
    }

    return firstPerson;
  };

  /*
   * TABLEAU DES INVITÉS
   */
  const filteredGuests = useMemo(() => {
    const value = tableSearch.trim().toLowerCase();

    return guests.filter((guest) => {
      if (
        guestFilter === "pending" &&
        guest.checkedIn
      ) {
        return false;
      }

      if (
        guestFilter === "checkedIn" &&
        !guest.checkedIn
      ) {
        return false;
      }

      if (!value) {
        return true;
      }

      const guestName = getGuestName(guest);

      return (
        guestName.toLowerCase().includes(value) ||
        guest.firstName1.toLowerCase().includes(value) ||
        guest.lastName1.toLowerCase().includes(value) ||
        guest.firstName2.toLowerCase().includes(value) ||
        guest.lastName2.toLowerCase().includes(value) ||
        guest.whatsapp.toLowerCase().includes(value) ||
        guest.slug.toLowerCase().includes(value)
      );
    });
  }, [guests, tableSearch, guestFilter]);

  /*
   * SCANNER QR
   */
  const handleScanSuccess = (decodedText: string) => {
    console.log("🔥 QR DÉTECTÉ :", decodedText);

    setScannedValue(decodedText);
    setMessage("");

    let guestIdentifier = decodedText.trim();

    try {
      const scannedUrl = new URL(decodedText);

      const pathParts = scannedUrl.pathname
        .split("/")
        .filter(Boolean);

      const invitationIndex =
        pathParts.indexOf("i");

      if (
        invitationIndex !== -1 &&
        pathParts[invitationIndex + 1]
      ) {
        guestIdentifier =
          pathParts[invitationIndex + 1];
      }
    } catch {
      // Le QR peut contenir directement le slug.
    }

    const foundGuest = guests.find(
      (guest) =>
        guest.slug === guestIdentifier ||
        String(guest.id) === guestIdentifier,
    );

    if (!foundGuest) {
      setScannedGuest(null);

      setMessage(
        "QR détecté, mais aucun invité correspondant n'a été trouvé.",
      );

      return;
    }

    setScannedGuest(foundGuest);
    setMessage("");
  };

  /*
   * CONFIRMER L'ENTRÉE
   */
  const handleConfirmEntry = (guest: Guest) => {
    checkInGuest(guest.id);

    const updatedGuest = {
      ...guest,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
    };

    if (scannedGuest?.id === guest.id) {
      setScannedGuest(updatedGuest);
    }

    setMessage(
      "Entrée confirmée pour " +
        getGuestName(guest) +
        ".",
    );
  };

  /*
   * ANNULER L'ENTRÉE
   */
  const handleResetEntry = (guest: Guest) => {
    resetGuestCheckIn(guest.id);

    const updatedGuest = {
      ...guest,
      checkedIn: false,
      checkedInAt: null,
    };

    if (scannedGuest?.id === guest.id) {
      setScannedGuest(updatedGuest);
    }

    setMessage(
      "Entrée annulée pour " +
        getGuestName(guest) +
        ".",
    );
  };

  /*
   * FORMAT HEURE
   */
  const formatCheckInTime = (
    date: string | null,
  ) => {
    if (!date) {
      return "—";
    }

    try {
      return new Date(date).toLocaleTimeString(
        "fr-FR",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    } catch {
      return "—";
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <EventNavigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
                Event Control
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Contrôle des entrées
              </h1>

              <p className="mt-2 text-zinc-600">
                {event.name || "Mon événement"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Total invités
              </p>

              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {totalGuests}
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">
              Total invités
            </p>

            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {totalGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm text-emerald-700">
              Déjà entrés
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {checkedInGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm text-amber-700">
              En attente
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {pendingGuests}
            </p>
          </div>

        </div>

        {/* TABLEAU DES INVITÉS */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

          <div className="border-b border-zinc-200 p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
                  Gestion des invités
                </p>

                <h2 className="mt-1 text-2xl font-bold text-zinc-900">
                  📋 Liste des invités
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Recherchez et contrôlez les entrées depuis une seule interface.
                </p>
              </div>

              <div className="text-sm text-zinc-500">
                <span className="font-semibold text-zinc-900">
                  {filteredGuests.length}
                </span>{" "}
                invité
                {filteredGuests.length > 1
                  ? "s"
                  : ""}{" "}
                affiché
                {filteredGuests.length > 1
                  ? "s"
                  : ""}
              </div>

            </div>

            {/* RECHERCHE UNIQUE + FILTRES */}
            <div className="mt-6 flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">

                <input
                  type="text"
                  value={tableSearch}
                  onChange={(event) =>
                    setTableSearch(event.target.value)
                  }
                  placeholder="🔎 Rechercher par nom, WhatsApp ou identifiant..."
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                />

                {tableSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setTableSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-200"
                    aria-label="Effacer la recherche"
                  >
                    ✕
                  </button>
                )}

              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setGuestFilter("all")
                  }
                  className={
                    guestFilter === "all"
                      ? "rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
                      : "rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                  }
                >
                  Tous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setGuestFilter("pending")
                  }
                  className={
                    guestFilter === "pending"
                      ? "rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
                      : "rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                  }
                >
                  En attente
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setGuestFilter("checkedIn")
                  }
                  className={
                    guestFilter === "checkedIn"
                      ? "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                      : "rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                  }
                >
                  Entrés
                </button>

              </div>
            </div>

          </div>

          {/* VERSION MOBILE */}
          <div className="divide-y divide-zinc-200 md:hidden">

            {filteredGuests.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Aucun invité ne correspond à votre recherche.
              </div>
            ) : (
              filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="font-bold text-zinc-900">
                        {getGuestName(guest)}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {guest.whatsapp}
                      </p>
                    </div>

                    {guest.checkedIn ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        ✓ Entré
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        En attente
                      </span>
                    )}

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                    <div>
                      <p className="text-xs text-zinc-400">
                        Type
                      </p>

                      <p className="mt-1 font-medium text-zinc-700">
                        {guest.type === "couple"
                          ? "Couple"
                          : "Individuel"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-400">
                        Heure
                      </p>

                      <p className="mt-1 font-medium text-zinc-700">
                        {formatCheckInTime(
                          guest.checkedInAt,
                        )}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4">

                    {!guest.checkedIn ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmEntry(guest)
                        }
                        className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
                      >
                        ✓ Confirmer l'entrée
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleResetEntry(guest)
                        }
                        className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
                      >
                        ↩ Annuler l'entrée
                      </button>
                    )}

                  </div>

                </div>
              ))
            )}

          </div>

          {/* VERSION DESKTOP */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[760px]">

              <thead className="bg-zinc-50">

                <tr className="border-b border-zinc-200 text-left">

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Invité
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    WhatsApp
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Statut
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Heure d'entrée
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-zinc-100">

                {filteredGuests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-zinc-500"
                    >
                      Aucun invité ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="transition hover:bg-zinc-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-zinc-900">
                          {getGuestName(guest)}
                        </p>

                        <p className="mt-1 text-xs text-zinc-400">
                          #{guest.id}
                        </p>

                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-600">
                        {guest.whatsapp}
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                          {guest.type === "couple"
                            ? "Couple"
                            : "Individuel"}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        {guest.checkedIn ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            ✓ Entré
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            En attente
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-600">
                        {formatCheckInTime(
                          guest.checkedInAt,
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">

                        {!guest.checkedIn ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmEntry(guest)
                            }
                            className="rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                          >
                            ✓ Confirmer
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleResetEntry(guest)
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            Annuler
                          </button>
                        )}

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* SCANNER QR */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Contrôle QR
            </p>

            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              📷 Scanner une invitation
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Scannez le QR code présent sur l'invitation de l'invité.
            </p>

          </div>

          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={() => {}}
          />

          {scannedValue && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Dernier QR scanné
              </p>

              <p className="mt-2 break-all text-sm text-zinc-700">
                {scannedValue}
              </p>

            </div>
          )}

          {scannedGuest && (
            <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                    Invité identifié
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                    {getGuestName(scannedGuest)}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-600">
                    WhatsApp : {scannedGuest.whatsapp}
                  </p>

                  {scannedGuest.checkedIn ? (
                    <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      ✓ Entré
                    </span>
                  ) : (
                    <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      En attente d'entrée
                    </span>
                  )}

                </div>

                <div>

                  {!scannedGuest.checkedIn ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmEntry(scannedGuest)
                      }
                      className="w-full rounded-xl bg-green-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-green-700 md:w-auto"
                    >
                      ✓ Confirmer l'entrée
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleResetEntry(scannedGuest)
                      }
                      className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 md:w-auto"
                    >
                      ↩ Annuler l'entrée
                    </button>
                  )}

                </div>

              </div>

            </div>
          )}

          {message && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
              ✓ {message}
            </div>
          )}

          {!scannedGuest &&
            scannedValue &&
            !message && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                QR détecté, mais l'invité correspondant n'a pas été trouvé.
              </div>
            )}

        </section>

      </div>
    </main>
  );
}