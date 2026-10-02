"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import EventNavigation from "../../../components/EventNavigation";

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

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createGuestSlug(
  firstName1: string,
  lastName1: string,
  firstName2: string,
  lastName2: string,
  type: GuestType,
) {
  const primaryName = normalizeText(
    firstName1 + "-" + lastName1,
  );

  if (type === "couple") {
    const secondaryName = normalizeText(
      firstName2 + "-" + lastName2,
    );

    return [primaryName, secondaryName]
      .filter(Boolean)
      .join("-");
  }

  return primaryName;
}

function createUniqueGuestSlug(
  firstName1: string,
  lastName1: string,
  firstName2: string,
  lastName2: string,
  type: GuestType,
  guests: Guest[],
  currentGuestId?: string,
) {
  const baseSlug = createGuestSlug(
    firstName1,
    lastName1,
    firstName2,
    lastName2,
    type,
  );

  const existingSlugs = new Set(
    guests
      .filter((guest) => guest.id !== currentGuestId)
      .map((guest) => guest.slug),
  );

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;

  while (existingSlugs.has(baseSlug + "-" + counter)) {
    counter += 1;
  }

  return baseSlug + "-" + counter;
}

function mapGuest(row: any): Guest {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    type: row.type,
    firstName1: row.first_name_1 ?? "",
    lastName1: row.last_name_1 ?? "",
    firstName2: row.first_name_2 ?? "",
    lastName2: row.last_name_2 ?? "",
    whatsapp: row.whatsapp ?? "",
    status: row.status ?? "pending",
    slug: row.slug ?? "",
    checkedIn: Boolean(row.checked_in),
    checkedInAt: row.checked_in_at ?? null,
  };
}

export default function GuestsPage() {
  const router = useRouter();
  const params = useParams();

  const eventId = String(params.eventId);

  const [eventName, setEventName] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [guestType, setGuestType] =
    useState<GuestType>("individual");

  const [firstName1, setFirstName1] = useState("");
  const [lastName1, setLastName1] = useState("");
  const [firstName2, setFirstName2] = useState("");
  const [lastName2, setLastName2] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [editingGuestId, setEditingGuestId] =
    useState<string | null>(null);

  useEffect(() => {
    const loadEventAndGuests = async () => {
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

      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, name")
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (eventError || !event) {
        console.error(
          "❌ Erreur événement :",
          eventError,
        );

        setErrorMessage(
          "Événement introuvable ou vous n'avez pas accès à cet événement.",
        );

        setLoading(false);
        return;
      }

      setEventName(event.name);

      const { data: guestsData, error: guestsError } =
        await supabase
          .from("guests")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: true });

      if (guestsError) {
        console.error(
          "❌ Erreur invités :",
          guestsError,
        );

        setErrorMessage(
          "Impossible de charger les invités.",
        );

        setLoading(false);
        return;
      }

      setGuests(
        (guestsData ?? []).map(mapGuest),
      );

      setLoading(false);
    };

    if (eventId) {
      loadEventAndGuests();
    }
  }, [eventId, router]);

  const resetForm = () => {
    setFirstName1("");
    setLastName1("");
    setFirstName2("");
    setLastName2("");
    setWhatsapp("");
    setGuestType("individual");
    setEditingGuestId(null);
    setErrorMessage("");
  };

  const handleSaveGuest = async () => {
    setErrorMessage("");

    if (
      !firstName1.trim() ||
      !lastName1.trim() ||
      !whatsapp.trim()
    ) {
      setErrorMessage(
        "Veuillez renseigner le prénom, le nom et le numéro WhatsApp.",
      );
      return;
    }

    if (
      guestType === "couple" &&
      (!firstName2.trim() || !lastName2.trim())
    ) {
      setErrorMessage(
        "Veuillez renseigner les informations de la deuxième personne.",
      );
      return;
    }

    setSaving(true);

    const slug = createUniqueGuestSlug(
      firstName1.trim(),
      lastName1.trim(),
      firstName2.trim(),
      lastName2.trim(),
      guestType,
      guests,
      editingGuestId ?? undefined,
    );

    if (editingGuestId !== null) {
      const { data, error } = await supabase
        .from("guests")
        .update({
          type: guestType,
          first_name_1: firstName1.trim(),
          last_name_1: lastName1.trim(),
          first_name_2:
            guestType === "couple"
              ? firstName2.trim()
              : "",
          last_name_2:
            guestType === "couple"
              ? lastName2.trim()
              : "",
          whatsapp: whatsapp.trim(),
          slug,
        })
        .eq("id", editingGuestId)
        .eq("event_id", eventId)
        .select("*")
        .single();

      if (error || !data) {
        console.error(
          "❌ Erreur modification invité :",
          error,
        );

        setErrorMessage(
          "Impossible de modifier cet invité.",
        );

        setSaving(false);
        return;
      }

      const updatedGuest = mapGuest(data);

      setGuests((current) =>
        current.map((guest) =>
          guest.id === updatedGuest.id
            ? updatedGuest
            : guest,
        ),
      );
    } else {
      const { data, error } = await supabase
        .from("guests")
        .insert({
          event_id: eventId,
          type: guestType,
          first_name_1: firstName1.trim(),
          last_name_1: lastName1.trim(),
          first_name_2:
            guestType === "couple"
              ? firstName2.trim()
              : "",
          last_name_2:
            guestType === "couple"
              ? lastName2.trim()
              : "",
          whatsapp: whatsapp.trim(),
          status: "pending",
          slug,
          checked_in: false,
          checked_in_at: null,
        })
        .select("*")
        .single();

      if (error || !data) {
        console.error(
          "❌ Erreur ajout invité :",
          error,
        );

        setErrorMessage(
          "Impossible d'ajouter cet invité.",
        );

        setSaving(false);
        return;
      }

      setGuests((current) => [
        ...current,
        mapGuest(data),
      ]);
    }

    resetForm();
    setShowForm(false);
    setSaving(false);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setGuestType(guest.type);
    setFirstName1(guest.firstName1);
    setLastName1(guest.lastName1);
    setFirstName2(guest.firstName2);
    setLastName2(guest.lastName2);
    setWhatsapp(guest.whatsapp);
    setShowForm(true);
  };

  const handleDeleteGuest = async (guestId: string) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet invité ?",
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("guests")
      .delete()
      .eq("id", guestId)
      .eq("event_id", eventId);

    if (error) {
      console.error(
        "❌ Erreur suppression invité :",
        error,
      );

      setErrorMessage(
        "Impossible de supprimer cet invité.",
      );

      return;
    }

    setGuests((current) =>
      current.filter(
        (guest) => guest.id !== guestId,
      ),
    );
  };

  const handleViewQrCode = (guestId: string) => {
    router.push(
      "/events/" +
        eventId +
        "/guests/" +
        guestId,
    );
  };

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

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="text-zinc-500">
            Chargement des invités...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage && !eventName) {
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
              type="button"
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
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <EventNavigation eventId={eventId} />

        <button
          type="button"
          onClick={() =>
            router.push("/events/" + eventId)
          }
          className="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          ← Retour à l'événement
        </button>

        <header className="mt-6 flex flex-col gap-6 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              EVENT STUDIO
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
              Gestion des invités
            </h1>

            <p className="mt-2 text-sm font-medium text-zinc-500">
              {eventName}
            </p>

            <p className="mt-3 text-zinc-600">
              Ajoutez et gérez les personnes invitées à votre événement.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            + Ajouter un invité
          </button>
        </header>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {showForm && (
          <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {editingGuestId !== null
                    ? "Modifier l'invité"
                    : "Ajouter un invité"}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Choisissez le type d'invitation et renseignez les informations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => setGuestType("individual")}
                className={
                  "rounded-2xl border p-5 text-left transition " +
                  (guestType === "individual"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50")
                }
              >
                <div className="text-3xl">👤</div>

                <h3 className="mt-3 font-semibold text-zinc-900">
                  Invité individuel
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Une seule personne avec ses informations personnelles.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGuestType("couple")}
                className={
                  "rounded-2xl border p-5 text-left transition " +
                  (guestType === "couple"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50")
                }
              >
                <div className="text-3xl">👥</div>

                <h3 className="mt-3 font-semibold text-zinc-900">
                  Couple
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Deux personnes réunies dans une même invitation.
                </p>
              </button>

            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="first-name-1"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  {guestType === "individual"
                    ? "Prénom"
                    : "Prénom — personne 1"}
                </label>

                <input
                  value={firstName1}
                  onChange={(e) =>
                    setFirstName1(e.target.value)
                  }
                  id="first-name-1"
                  type="text"
                  placeholder="Ex. Jean"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="last-name-1"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  {guestType === "individual"
                    ? "Nom"
                    : "Nom — personne 1"}
                </label>

                <input
                  value={lastName1}
                  onChange={(e) =>
                    setLastName1(e.target.value)
                  }
                  id="last-name-1"
                  type="text"
                  placeholder="Ex. Kabongo"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {guestType === "couple" && (
                <>
                  <div>
                    <label
                      htmlFor="first-name-2"
                      className="block text-sm font-semibold text-zinc-900"
                    >
                      Prénom — personne 2
                    </label>

                    <input
                      value={firstName2}
                      onChange={(e) =>
                        setFirstName2(e.target.value)
                      }
                      id="first-name-2"
                      type="text"
                      placeholder="Ex. Marie"
                      className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last-name-2"
                      className="block text-sm font-semibold text-zinc-900"
                    >
                      Nom — personne 2
                    </label>

                    <input
                      value={lastName2}
                      onChange={(e) =>
                        setLastName2(e.target.value)
                      }
                      id="last-name-2"
                      type="text"
                      placeholder="Ex. Mulamba"
                      className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label
                  htmlFor="whatsapp"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  Numéro WhatsApp
                </label>

                <input
                  value={whatsapp}
                  onChange={(e) =>
                    setWhatsapp(e.target.value)
                  }
                  id="whatsapp"
                  type="tel"
                  placeholder="+243 9XX XXX XXX"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs text-zinc-500">
                  Ce numéro pourra servir pour l'envoi de l'invitation et le suivi RSVP.
                </p>
              </div>

            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveGuest}
                className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Enregistrement..."
                  : editingGuestId !== null
                    ? "Enregistrer les modifications"
                    : "Ajouter l'invité"}
              </button>
            </div>

          </section>
        )}

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="Total invités"
            value={String(totalGuests)}
          />

          <Stat
            title="Confirmés"
            value={String(confirmedGuests)}
          />

          <Stat
            title="En attente"
            value={String(pendingGuests)}
          />

          <Stat
            title="Refusés"
            value={String(declinedGuests)}
          />
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

          <div className="border-b border-zinc-200 p-6">
            <h2 className="text-xl font-semibold text-zinc-900">
              Liste des invités
            </h2>
          </div>

          {guests.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center p-8">
              <div className="text-center">
                <div className="text-5xl">👥</div>

                <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                  Aucun invité pour le moment
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Commencez par ajouter votre premier invité.
                </p>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Ajouter le premier invité
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">

              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="p-6 transition hover:bg-zinc-50"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900">
                        {guest.type === "couple"
                          ? guest.firstName1 +
                            " " +
                            guest.lastName1 +
                            " & " +
                            guest.firstName2 +
                            " " +
                            guest.lastName2
                          : guest.firstName1 +
                            " " +
                            guest.lastName1}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {guest.type === "couple"
                          ? "Couple • "
                          : ""}
                        {guest.whatsapp}
                      </p>

                      <div className="mt-3 rounded-xl bg-zinc-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                          Lien personnalisé
                        </p>

                        <p className="mt-1 break-all font-mono text-sm text-indigo-600">
                          /i/{guest.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={guest.status} />

                      <button
                        type="button"
                        onClick={() =>
                          handleViewQrCode(guest.id)
                        }
                        className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        📱 QR Code
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEditGuest(guest)
                        }
                        className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteGuest(guest.id)
                        }
                        className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: GuestStatus;
}) {
  if (status === "confirmed") {
    return (
      <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Confirmé
      </span>
    );
  }

  if (status === "declined") {
    return (
      <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Refusé
      </span>
    );
  }

  return (
    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      En attente
    </span>
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
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}
