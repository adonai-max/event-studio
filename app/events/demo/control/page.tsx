"use client";

import { useMemo, useState } from "react";
import { Guest, useEvent } from "../../../context/EventContext";
import EventNavigation from "../../../components/EventNavigation";
import QRScanner from "../../../../components/QRScanner";

export default function EventControlPage() {
  const {
    event,
    guests,
    checkInGuest,
    resetGuestCheckIn,
  } = useEvent();

  const [searchTerm, setSearchTerm] = useState("");
  const [scannedValue, setScannedValue] = useState("");
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);
  const [searchSelectedGuest, setSearchSelectedGuest] =
    useState<Guest | null>(null);
  const [message, setMessage] = useState("");

  const totalGuests = guests.length;

  const checkedInGuests = guests.filter(
    (guest) => guest.checkedIn,
  ).length;

  const pendingGuests = guests.filter(
    (guest) => !guest.checkedIn,
  ).length;

  const searchResults = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return guests.filter((guest) => {
      const fullName1 =
        guest.firstName1 + " " + guest.lastName1;

      const fullName2 =
        guest.firstName2 + " " + guest.lastName2;

      const coupleName =
        guest.type === "couple"
          ? fullName1 + " " + fullName2
          : fullName1;

      return (
        fullName1.toLowerCase().includes(value) ||
        fullName2.toLowerCase().includes(value) ||
        coupleName.toLowerCase().includes(value) ||
        guest.whatsapp.toLowerCase().includes(value) ||
        guest.slug.toLowerCase().includes(value)
      );
    });
  }, [guests, searchTerm]);

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

      const invitationIndex = pathParts.indexOf("i");

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
    setSearchSelectedGuest(null);
    setMessage("");
  };

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

    if (searchSelectedGuest?.id === guest.id) {
      setSearchSelectedGuest(updatedGuest);
    }

    setMessage(
      "Entrée confirmée pour " +
        getGuestName(guest) +
        ".",
    );
  };

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

    if (searchSelectedGuest?.id === guest.id) {
      setSearchSelectedGuest(updatedGuest);
    }

    setMessage(
      "Entrée annulée pour " +
        getGuestName(guest) +
        ".",
    );
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

        {/* RECHERCHE MANUELLE */}
        <section className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Contrôle manuel
            </p>

            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              🔎 Rechercher un invité
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Recherchez par nom, prénom, WhatsApp ou identifiant.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchSelectedGuest(null);
                setMessage("");
              }}
              placeholder="Nom, prénom ou numéro WhatsApp..."
              className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-5 py-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />

            {searchTerm.trim() && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSearchSelectedGuest(null);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {searchTerm.trim() && (
            <div className="mt-4">
              {searchResults.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <p className="font-semibold text-amber-800">
                    Aucun invité trouvé
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Vérifiez l'orthographe ou le numéro WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-zinc-500">
                    {searchResults.length} résultat
                    {searchResults.length > 1 ? "s" : ""} trouvé
                    {searchResults.length > 1 ? "s" : ""}
                  </p>

                  {searchResults.map((guest) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => {
                        setSearchSelectedGuest(guest);
                        setMessage("");
                      }}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-green-400 hover:bg-green-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-zinc-900">
                            {getGuestName(guest)}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            WhatsApp : {guest.whatsapp}
                          </p>
                        </div>

                        <div>
                          {guest.checkedIn ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                              ✓ Entré
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                              En attente
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchSelectedGuest && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                Invité sélectionné
              </p>

              <h3 className="mt-2 text-xl font-bold text-zinc-900">
                {getGuestName(searchSelectedGuest)}
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                WhatsApp : {searchSelectedGuest.whatsapp}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {!searchSelectedGuest.checkedIn ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmEntry(searchSelectedGuest)
                    }
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    ✓ Confirmer l'entrée
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleResetEntry(searchSelectedGuest)
                    }
                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
                  >
                    ↩ Annuler l'entrée
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* SCANNER */}
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

          {!scannedGuest && scannedValue && !message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              QR détecté, mais l'invité correspondant n'a pas été trouvé.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}