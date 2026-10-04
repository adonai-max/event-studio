"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import EventNavigation from "../../../components/EventNavigation";
import QRScanner from "../../../../components/QRScanner";
import { supabase } from "../../../../lib/supabase";

type GuestType = "individual" | "couple";
type GuestStatus = "pending" | "confirmed" | "declined";

type Guest = {
  id: string;
  eventId: string;
  type: GuestType;
  firstName1: string;
  lastName1: string;
  firstName2: string;
  lastName2: string;
  whatsapp: string;
  status: GuestStatus;
  slug: string;
  checkedIn: boolean;
  checkedInAt: string | null;
};

type EventData = {
  id: string;
  name: string;
};

type GuestRow = {
  id: string;
  event_id: string;
  type: GuestType;
  first_name_1: string;
  last_name_1: string;
  first_name_2: string | null;
  last_name_2: string | null;
  whatsapp: string | null;
  status: GuestStatus;
  slug: string;
  checked_in: boolean | null;
  checked_in_at: string | null;
};

function mapGuest(row: GuestRow): Guest {
  return {
    id: row.id,
    eventId: row.event_id,
    type: row.type,
    firstName1: row.first_name_1,
    lastName1: row.last_name_1,
    firstName2: row.first_name_2 ?? "",
    lastName2: row.last_name_2 ?? "",
    whatsapp: row.whatsapp ?? "",
    status: row.status,
    slug: row.slug,
    checkedIn: row.checked_in ?? false,
    checkedInAt: row.checked_in_at ?? null,
  };
}

export default function EventControlPage() {
  const params = useParams();
  const eventId = String(params.eventId);

  const [event, setEvent] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [pageError, setPageError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [scannedValue, setScannedValue] = useState("");
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);
  const [searchSelectedGuest, setSearchSelectedGuest] =
    useState<Guest | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Chargement initial
  useEffect(() => {
    let isActive = true;

    async function loadData() {
      setLoading(true);
      setPageError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (userError || !user) {
        setPageError("Vous devez être connecté pour accéder à Event Control.");
        setLoading(false);
        return;
      }

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, name")
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (!isActive) {
        return;
      }

      if (eventError || !eventData) {
        setPageError("Événement introuvable ou accès non autorisé.");
        setLoading(false);
        return;
      }

      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (!isActive) {
        return;
      }

      if (guestsError) {
        setPageError(
          "Impossible de charger la liste des invités : " +
            guestsError.message,
        );
        setLoading(false);
        return;
      }

      setEvent(eventData);
      setGuests((guestsData ?? []).map(mapGuest));
      setLoading(false);
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, [eventId]);

  const totalGuests = guests.length;

  const confirmedGuests = guests.filter(
    (guest) => guest.status === "confirmed",
  ).length;

  const checkedInGuests = guests.filter(
    (guest) => guest.checkedIn,
  ).length;

  const pendingGuests = guests.filter(
    (guest) => guest.status === "pending",
  ).length;

  const declinedGuests = guests.filter(
    (guest) => guest.status === "declined",
  ).length;

  const checkInRate =
    totalGuests === 0
      ? 0
      : Math.round((checkedInGuests / totalGuests) * 100);

  const recentCheckIns = useMemo(() => {
    return guests
      .filter(
        (guest) =>
          guest.checkedIn &&
          guest.checkedInAt,
      )
      .sort(
        (a, b) =>
          new Date(b.checkedInAt as string).getTime() -
          new Date(a.checkedInAt as string).getTime(),
      )
      .slice(0, 8);
  }, [guests]);

  const searchResults = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return guests.filter((guest) => {
      const fullName1 =
        `${guest.firstName1} ${guest.lastName1}`;

      const fullName2 =
        `${guest.firstName2} ${guest.lastName2}`;

      const coupleName =
        guest.type === "couple"
          ? `${fullName1} ${fullName2}`
          : fullName1;

      return (
        fullName1.toLowerCase().includes(value) ||
        fullName2.toLowerCase().includes(value) ||
        coupleName.toLowerCase().includes(value) ||
        guest.whatsapp.toLowerCase().includes(value) ||
        guest.slug.toLowerCase().includes(value) ||
        guest.id.toLowerCase().includes(value)
      );
    });
  }, [guests, searchTerm]);

  const getGuestName = (guest: Guest) => {
    const firstPerson =
      `${guest.firstName1} ${guest.lastName1}`;

    if (guest.type === "couple") {
      const secondPerson =
        `${guest.firstName2} ${guest.lastName2}`;

      return `${firstPerson} & ${secondPerson}`;
    }

    return firstPerson;
  };

  const clearMessages = () => {
    setMessage("");
    setErrorMessage("");
  };

  const updateGuestLocally = (
    updatedGuest: Guest,
  ) => {
    setGuests((current) =>
      current.map((guest) =>
        guest.id === updatedGuest.id
          ? updatedGuest
          : guest,
      ),
    );

    setScannedGuest((current) =>
      current?.id === updatedGuest.id
        ? updatedGuest
        : current,
    );

    setSearchSelectedGuest((current) =>
      current?.id === updatedGuest.id
        ? updatedGuest
        : current,
    );
  };

  const findGuestFromQr = (decodedText: string) => {
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

    return guests.find(
      (guest) =>
        guest.slug === guestIdentifier ||
        guest.id === guestIdentifier,
    );
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log("🔥 QR DÉTECTÉ :", decodedText);

    setScannedValue(decodedText);
    setSearchSelectedGuest(null);
    clearMessages();

    const foundGuest = findGuestFromQr(decodedText);

    if (!foundGuest) {
      setScannedGuest(null);
      setErrorMessage(
        "QR détecté, mais aucun invité correspondant n'a été trouvé.",
      );
      return;
    }

    setScannedGuest(foundGuest);

    if (foundGuest.checkedIn) {
      setMessage(
        "Cette invitation a déjà été enregistrée à l'entrée.",
      );
      return;
    }

    if (foundGuest.status !== "confirmed") {
      setErrorMessage(
        foundGuest.status === "pending"
          ? "L'invité n'a pas encore confirmé sa présence."
          : "L'invité a décliné l'invitation. Entrée non autorisée.",
      );
      return;
    }

    setMessage(
      "Invité confirmé identifié. L'entrée peut être enregistrée.",
    );
  };

  const handleConfirmEntry = async (guest: Guest) => {
    clearMessages();

    if (guest.checkedIn) {
      setErrorMessage(
        "Cette invitation a déjà été enregistrée.",
      );
      return;
    }

    if (guest.status !== "confirmed") {
      setErrorMessage(
        guest.status === "pending"
          ? "Entrée impossible : l'invité doit d'abord confirmer sa présence."
          : "Entrée refusée : l'invité a décliné l'invitation.",
      );
      return;
    }

    setLoadingAction(true);

    const checkedInAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("guests")
      .update({
        checked_in: true,
        checked_in_at: checkedInAt,
        updated_at: checkedInAt,
      })
      .eq("id", guest.id)
      .eq("event_id", eventId)
      .select("*")
      .single();

    if (error || !data) {
      setLoadingAction(false);
      setErrorMessage(
        error?.message ||
          "Impossible d'enregistrer l'entrée.",
      );
      return;
    }

    const updatedGuest = mapGuest(data);

    updateGuestLocally(updatedGuest);
    setLoadingAction(false);

    setMessage(
      `Entrée confirmée pour ${getGuestName(updatedGuest)}.`,
    );
  };

  const handleResetEntry = async (guest: Guest) => {
    clearMessages();
    setLoadingAction(true);

    const { data, error } = await supabase
      .from("guests")
      .update({
        checked_in: false,
        checked_in_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", guest.id)
      .eq("event_id", eventId)
      .select("*")
      .single();

    if (error || !data) {
      setLoadingAction(false);
      setErrorMessage(
        error?.message ||
          "Impossible d'annuler l'entrée.",
      );
      return;
    }

    const updatedGuest = mapGuest(data);

    if (
      updatedGuest.checkedIn !== false ||
      updatedGuest.checkedInAt !== null
    ) {
      setLoadingAction(false);
      setErrorMessage(
        "L'annulation n'a pas été correctement enregistrée.",
      );
      return;
    }

    updateGuestLocally(updatedGuest);
    setLoadingAction(false);

    setMessage(
      `Entrée annulée pour ${getGuestName(updatedGuest)}.`,
    );
  };

  const renderGuestStatus = (guest: Guest) => {
    if (guest.checkedIn) {
      return (
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          ✓ Entré
        </span>
      );
    }

    if (guest.status === "confirmed") {
      return (
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          ✓ Confirmé — non entré
        </span>
      );
    }

    if (guest.status === "declined") {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
          Refusé
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        En attente
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <EventNavigation eventId={eventId} />

        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Event Control
            </p>

            <h1 className="mt-2 text-2xl font-bold text-zinc-900">
              Chargement du contrôle...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (pageError || !event) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <EventNavigation eventId={eventId} />

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-3xl">⚠️</p>

            <h1 className="mt-4 text-2xl font-bold text-red-900">
              Event Control inaccessible
            </h1>

            <p className="mt-2 text-red-700">
              {pageError}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <EventNavigation eventId={eventId} />

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 sm:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
                Event Control
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Contrôle des entrées
              </h1>

              <p className="mt-2 text-zinc-600">
                {event.name}
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

        <section className="mb-5 grid grid-cols-2 gap-2 sm:mb-8 sm:gap-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-zinc-500">Total</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {totalGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-blue-700">Confirmés</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {confirmedGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-amber-700">En attente</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {pendingGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-red-700">Refusés</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {declinedGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-emerald-700">Entrés</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {checkedInGuests}
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-indigo-700">Check-in</p>
            <p className="mt-2 text-3xl font-bold text-indigo-700">
              {checkInRate}%
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm sm:mb-8 sm:rounded-3xl sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Contrôle manuel
            </p>

            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              🔎 Rechercher un invité
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Recherchez par nom, prénom, WhatsApp,
              identifiant ou slug.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchSelectedGuest(null);
                clearMessages();
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
                  clearMessages();
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
                    Vérifiez l&apos;orthographe ou le numéro WhatsApp.
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
                        setScannedGuest(null);
                        clearMessages();
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

                        {renderGuestStatus(guest)}
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

              <div className="mt-4">
                {renderGuestStatus(searchSelectedGuest)}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {searchSelectedGuest.checkedIn ? (
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() =>
                      handleResetEntry(searchSelectedGuest)
                    }
                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ↩ Annuler l&apos;entrée
                  </button>
                ) : searchSelectedGuest.status === "confirmed" ? (
                  <button
                    type="button"
                    disabled={loadingAction}
                    onClick={() =>
                      handleConfirmEntry(searchSelectedGuest)
                    }
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ✓ Confirmer l&apos;entrée
                  </button>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">
                    Entrée non autorisée tant que la présence n&apos;est pas confirmée.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>


        <section className="mb-5 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm sm:mb-8 sm:rounded-[28px]">
          <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Activité récente
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                🕐 Dernières entrées
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Les dernières personnes enregistrées à l&apos;entrée.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {checkedInGuests} entrée{checkedInGuests > 1 ? "s" : ""}
            </div>
          </div>

          {recentCheckIns.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                🕐
              </div>

              <h3 className="mt-4 font-bold text-zinc-900">
                Aucune entrée enregistrée
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
                Les invités validés apparaîtront ici dès qu&apos;ils seront enregistrés à l&apos;entrée.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentCheckIns.map((guest, index) => (
                <div
                  key={guest.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-zinc-900">
                        {getGuestName(guest)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>
                          {guest.type === "couple"
                            ? "Couple"
                            : "Individuel"}
                        </span>

                        <span className="text-zinc-300">•</span>

                        <span>
                          {guest.whatsapp || "WhatsApp non renseigné"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <span>✓</span>
                      Entré
                    </span>

                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">
                        {new Date(
                          guest.checkedInAt as string,
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        {new Date(
                          guest.checkedInAt as string,
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Contrôle QR
            </p>

            <h2 className="mt-1 text-2xl font-bold text-zinc-900">
              📷 Scanner une invitation
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Scannez le QR code présent sur l&apos;invitation.
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-zinc-950 p-3 shadow-inner sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                  Scanner actif
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Présentez le QR code de l&apos;invitation devant la caméra.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Prêt
              </span>
            </div>

            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={() => {}}
            />
          </div>

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
            <div className="mt-6 overflow-hidden rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                    Invité identifié
                  </p>

                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                    {getGuestName(scannedGuest)}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-600">
                    WhatsApp : {scannedGuest.whatsapp}
                  </p>

                  <div className="mt-3">
                    {renderGuestStatus(scannedGuest)}
                  </div>

                  {scannedGuest.checkedInAt && (
                    <p className="mt-3 text-sm font-medium text-zinc-600">
                      Entrée enregistrée à{" "}
                      {new Date(
                        scannedGuest.checkedInAt,
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <div>
                  {scannedGuest.checkedIn ? (
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={() =>
                        handleResetEntry(scannedGuest)
                      }
                      className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                    >
                      ↩ Annuler l&apos;entrée
                    </button>
                  ) : scannedGuest.status === "confirmed" ? (
                    <button
                      type="button"
                      disabled={loadingAction}
                      onClick={() =>
                        handleConfirmEntry(scannedGuest)
                      }
                      className="w-full rounded-xl bg-green-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                    >
                      ✓ Confirmer l&apos;entrée
                    </button>
                  ) : (
                    <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
                      ⚠️ Entrée non autorisée : présence non confirmée.
                    </div>
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

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
