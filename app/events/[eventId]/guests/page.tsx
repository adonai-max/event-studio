"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import EventNavigation from "@/app/components/EventNavigation";

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
    .replace(/[\u0300-\u036f]/g, "")
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

type GuestRow = {
  id: string;
  event_id: string;
  type: GuestType;
  first_name_1: string | null;
  last_name_1: string | null;
  first_name_2: string | null;
  last_name_2: string | null;
  whatsapp: string | null;
  status: GuestStatus | null;
  slug: string | null;
  checked_in: boolean | null;
  checked_in_at: string | null;
};

function mapGuest(row: GuestRow): Guest {
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

function getGuestName(guest: Guest) {
  const first = `${guest.firstName1} ${guest.lastName1}`.trim();

  if (guest.type === "couple") {
    const second =
      `${guest.firstName2} ${guest.lastName2}`.trim();

    return second ? `${first} & ${second}` : first;
  }

  return first;
}

function getInitials(guest: Guest) {
  const first =
    guest.firstName1.trim().charAt(0).toUpperCase();

  const last =
    guest.lastName1.trim().charAt(0).toUpperCase();

  return `${first}${last}` || "I";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | GuestStatus>("all");
  const [typeFilter, setTypeFilter] =
    useState<"all" | GuestType>("all");
  const [checkInFilter, setCheckInFilter] =
    useState<"all" | "checked-in" | "not-checked-in">("all");

  const [copiedGuestId, setCopiedGuestId] =
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

      const { data: event, error: eventError } =
        await supabase
          .from("events")
          .select("id, name")
          .eq("id", eventId)
          .eq("owner_id", user.id)
          .single();

      if (eventError || !event) {
        console.error("❌ Erreur événement :", eventError);

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
        console.error("❌ Erreur invités :", guestsError);

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
    if (saving) return;
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

    try {
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
          setErrorMessage("Impossible de modifier cet invité. Réessayez.");
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
          setErrorMessage("Impossible d'ajouter cet invité. Réessayez.");
          return;
        }

        setGuests((current) => [
          ...current,
          mapGuest(data),
        ]);
      }

      resetForm();
      setShowForm(false);
    } catch {
      setErrorMessage(
        "Une erreur inattendue est survenue. Vérifiez votre connexion puis réessayez.",
      );
    } finally {
      setSaving(false);
    }
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

  const handleCopyInvitationLink = async (guest: Guest) => {
    const link =
      window.location.origin + "/i/" + guest.slug;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedGuestId(guest.id);

      window.setTimeout(() => {
        setCopiedGuestId((current) =>
          current === guest.id ? null : current,
        );
      }, 1800);
    } catch (error) {
      console.error(
        "❌ Impossible de copier le lien :",
        error,
      );

      setErrorMessage(
        "Impossible de copier le lien d'invitation.",
      );
    }
  };

  const handleWhatsAppGuest = (guest: Guest) => {
    const link =
      window.location.origin + "/i/" + guest.slug;

    const recipientName =
      guest.type === "couple"
        ? getGuestName(guest)
        : guest.firstName1;

    const message =
      "Bonjour " +
      recipientName +
      ", voici votre invitation : " +
      link;

    const whatsappUrl =
      "https://wa.me/" +
      guest.whatsapp.replace(/[^0-9]/g, "") +
      "?text=" +
      encodeURIComponent(message);

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
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

  const checkedInGuests = guests.filter(
    (guest) => guest.checkedIn,
  ).length;

  const confirmedRate =
    totalGuests > 0
      ? Math.round((confirmedGuests / totalGuests) * 100)
      : 0;

  const pendingRate =
    totalGuests > 0
      ? Math.round((pendingGuests / totalGuests) * 100)
      : 0;

  const declinedRate =
    totalGuests > 0
      ? Math.round((declinedGuests / totalGuests) * 100)
      : 0;

  const normalizedSearch = normalizeSearchText(searchQuery);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const guestName = getGuestName(guest);

      const searchableText = normalizeSearchText([
        guestName,
        guest.firstName1,
        guest.lastName1,
        guest.firstName2,
        guest.lastName2,
        guest.whatsapp,
        guest.slug,
        guest.id,
      ].join(" "));

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        guest.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        guest.type === typeFilter;

      const matchesCheckIn =
        checkInFilter === "all" ||
        (checkInFilter === "checked-in" &&
          guest.checkedIn) ||
        (checkInFilter === "not-checked-in" &&
          !guest.checkedIn);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesCheckIn
      );
    });
  }, [
    guests,
    normalizedSearch,
    statusFilter,
    typeFilter,
    checkInFilter,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] event-page-motion">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
            <p className="mt-4 text-sm font-medium text-zinc-500">
              Chargement de vos invités...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage && !eventName) {
    return (
      <main className="min-h-screen bg-[#f8fafc] event-page-motion">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[28px] border border-red-200 bg-white p-8 shadow-sm">
            <div className="text-4xl">⚠️</div>

            <h1 className="mt-5 text-2xl font-bold text-zinc-900">
              Événement inaccessible
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] event-page-motion">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <EventNavigation eventId={eventId} eventName={eventName} />

        <button
          type="button"
          onClick={() =>
            router.push("/events/" + eventId)
          }
          className="mt-5 inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          <span>←</span>
          Retour à l&apos;événement
        </button>

        <header className="mt-5 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(24,24,27,0.04)]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
                  <span>Event Studio</span>
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  <span>Invités</span>
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                  Gestion des invités
                </h1>

                <p className="mt-2 text-base font-semibold text-zinc-700">
                  {eventName}
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Gérez les invitations, les réponses RSVP et
                  le suivi des entrées depuis un seul espace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
              >
                <span className="text-lg">+</span>
                Ajouter un invité
              </button>
            </div>
          </div>
        </header>

        {errorMessage && (
          <div role="alert" aria-live="assertive" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat
            title="Total"
            value={String(totalGuests)}
            icon="👥"
          />

          <Stat
            title="Confirmés"
            value={String(confirmedGuests)}
            icon="✓"
            tone="success"
          />

          <Stat
            title="En attente"
            value={String(pendingGuests)}
            icon="◷"
            tone="warning"
          />

          <Stat
            title="Refusés"
            value={String(declinedGuests)}
            icon="×"
            tone="danger"
          />

          <Stat
            title="Entrés"
            value={String(checkedInGuests)}
            icon="✓"
            tone="indigo"
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(24,24,27,0.04)]">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Vue RSVP
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-950">
                  Réponses à l’invitation
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Une lecture rapide de l’engagement de vos invités.
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-right ring-1 ring-indigo-100">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                  Taux de confirmation
                </p>
                <p className="mt-1 text-2xl font-black text-indigo-700">
                  {confirmedRate}%
                </p>
              </div>
            </div>

            <div className="mt-7 h-3 overflow-hidden rounded-full bg-zinc-100">
              <div className="flex h-full w-full">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: confirmedRate + "%" }}
                />

                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: pendingRate + "%" }}
                />

                <div
                  className="bg-red-400 transition-all duration-500"
                  style={{ width: declinedRate + "%" }}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <RsvpSummaryItem
                label="Confirmés"
                value={confirmedGuests}
                percentage={confirmedRate}
                dot="bg-emerald-500"
                tone="text-emerald-700"
              />

              <RsvpSummaryItem
                label="En attente"
                value={pendingGuests}
                percentage={pendingRate}
                dot="bg-amber-400"
                tone="text-amber-700"
              />

              <RsvpSummaryItem
                label="Refusés"
                value={declinedGuests}
                percentage={declinedRate}
                dot="bg-red-400"
                tone="text-red-700"
              />
            </div>
          </div>
        </section>

        {showForm && (
          <section className="mt-8 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(24,24,27,0.05)]">
            <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    {editingGuestId !== null
                      ? "Modification"
                      : "Nouvelle invitation"}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-950">
                    {editingGuestId !== null
                      ? "Modifier l&apos;invité"
                      : "Ajouter un invité"}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Les informations seront utilisées pour
                    l&apos;invitation personnalisée.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <GuestTypeButton
                  active={guestType === "individual"}
                  icon="👤"
                  title="Invité individuel"
                  description="Une personne dans une invitation dédiée."
                  onClick={() => setGuestType("individual")}
                />

                <GuestTypeButton
                  active={guestType === "couple"}
                  icon="👥"
                  title="Couple"
                  description="Deux personnes réunies dans une invitation."
                  onClick={() => setGuestType("couple")}
                />
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <InputField
                  id="first-name-1"
                  label={
                    guestType === "individual"
                      ? "Prénom"
                      : "Prénom — personne 1"
                  }
                  value={firstName1}
                  onChange={setFirstName1}
                  placeholder="Ex. Jean"
                />

                <InputField
                  id="last-name-1"
                  label={
                    guestType === "individual"
                      ? "Nom"
                      : "Nom — personne 1"
                  }
                  value={lastName1}
                  onChange={setLastName1}
                  placeholder="Ex. Kabongo"
                />

                {guestType === "couple" && (
                  <>
                    <InputField
                      id="first-name-2"
                      label="Prénom — personne 2"
                      value={firstName2}
                      onChange={setFirstName2}
                      placeholder="Ex. Marie"
                    />

                    <InputField
                      id="last-name-2"
                      label="Nom — personne 2"
                      value={lastName2}
                      onChange={setLastName2}
                      placeholder="Ex. Mulamba"
                    />
                  </>
                )}

                <div className="sm:col-span-2">
                  <InputField
                    id="whatsapp"
                    label="Numéro WhatsApp"
                    value={whatsapp}
                    onChange={setWhatsapp}
                    placeholder="+243 9XX XXX XXX"
                    type="tel"
                    maxLength={30}
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    Utilisé pour l&apos;envoi de l&apos;invitation et
                    le suivi RSVP.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={saving}
                  aria-busy={saving}
                  onClick={handleSaveGuest}
                  className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Enregistrement..."
                    : editingGuestId !== null
                      ? "Enregistrer les modifications"
                      : "Ajouter l'invité"}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(24,24,27,0.04)]">
          <div className="border-b border-zinc-100 p-5 sm:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Annuaire événement
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-zinc-950">
                    Liste des invités
                  </h2>
                </div>

                <p className="text-sm font-medium text-zinc-500">
                  <span className="font-bold text-zinc-900">
                    {filteredGuests.length}
                  </span>{" "}
                  affiché
                  {filteredGuests.length > 1 ? "s" : ""}
                  {filteredGuests.length !== guests.length
                    ? ` sur ${guests.length}`
                    : ""}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px_185px]">
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-zinc-400"
                    aria-hidden="true"
                  >
                    🔎
                  </span>

                  <input
                    id="guest-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder="Rechercher un nom, WhatsApp ou lien..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    aria-label="Rechercher un invité"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900"
                      aria-label="Effacer la recherche"
                    >
                      ×
                    </button>
                  )}
                </div>

                <FilterSelect
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(
                      value as "all" | GuestStatus,
                    )
                  }
                  ariaLabel="Filtrer par statut RSVP"
                  options={[
                    ["all", "Tous les RSVP"],
                    ["confirmed", "Confirmés"],
                    ["pending", "En attente"],
                    ["declined", "Refusés"],
                  ]}
                />

                <FilterSelect
                  value={typeFilter}
                  onChange={(value) =>
                    setTypeFilter(
                      value as "all" | GuestType,
                    )
                  }
                  ariaLabel="Filtrer par type"
                  options={[
                    ["all", "Tous les types"],
                    ["individual", "Individuels"],
                    ["couple", "Couples"],
                  ]}
                />

                <FilterSelect
                  value={checkInFilter}
                  onChange={(value) =>
                    setCheckInFilter(
                      value as
                        | "all"
                        | "checked-in"
                        | "not-checked-in",
                    )
                  }
                  ariaLabel="Filtrer par entrée"
                  options={[
                    ["all", "Toutes les entrées"],
                    ["checked-in", "Déjà entrés"],
                    ["not-checked-in", "Pas encore entrés"],
                  ]}
                />
              </div>

              {(searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                checkInFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setCheckInFilter("all");
                  }}
                  className="w-fit rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {guests.length === 0 ? (
            <EmptyGuests
              onAdd={() => {
                resetForm();
                setShowForm(true);
              }}
            />
          ) : filteredGuests.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center px-6 py-12 sm:px-8">
              <div className="w-full max-w-md text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-zinc-200 bg-zinc-50 text-3xl shadow-sm">
                  🔎
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Recherche
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-tight text-zinc-950">
                  Aucun invité trouvé
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                  Aucun invité ne correspond aux critères actuellement
                  sélectionnés. Essayez une autre recherche ou réinitialisez
                  les filtres.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setCheckInFilter("all");
                  }}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredGuests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  copied={copiedGuestId === guest.id}
                  onCopyLink={() =>
                    handleCopyInvitationLink(guest)
                  }
                  onWhatsApp={() =>
                    handleWhatsAppGuest(guest)
                  }
                  onQr={() =>
                    handleViewQrCode(guest.id)
                  }
                  onEdit={() =>
                    handleEditGuest(guest)
                  }
                  onDelete={() =>
                    handleDeleteGuest(guest.id)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function GuestRow({
  guest,
  copied,
  onCopyLink,
  onWhatsApp,
  onQr,
  onEdit,
  onDelete,
}: {
  guest: Guest;
  copied: boolean;
  onCopyLink: () => void;
  onWhatsApp: () => void;
  onQr: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group relative border-b border-zinc-100 p-4 last:border-b-0 transition duration-300 hover:bg-zinc-50/60 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-sm font-black text-indigo-700 ring-1 ring-indigo-100 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-sm sm:h-16 sm:w-16">
              {getInitials(guest)}
            </div>

            <span
              className={[
                "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white",
                guest.checkedIn
                  ? "bg-emerald-500"
                  : guest.status === "confirmed"
                    ? "bg-indigo-500"
                    : guest.status === "declined"
                      ? "bg-red-500"
                      : "bg-amber-400",
              ].join(" ")}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="max-w-full truncate text-base font-black tracking-[-0.025em] text-zinc-950 sm:text-lg">
                {getGuestName(guest)}
              </h3>

              {guest.type === "couple" && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] text-violet-700 ring-1 ring-violet-100">
                  Couple
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {guest.whatsapp ? (
                <p className="text-sm font-medium text-zinc-500">
                  {guest.whatsapp}
                </p>
              ) : (
                <p className="text-sm font-medium text-zinc-400">
                  WhatsApp non renseigné
                </p>
              )}

              {guest.checkedIn && guest.checkedInAt && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Entré à{" "}
                  {new Date(
                    guest.checkedInAt,
                  ).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={guest.status} />

              {guest.checkedIn ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                  <span aria-hidden="true">✓</span>
                  Entré
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
                  Pas encore entré
                </span>
              )}
            </div>

            <div className="mt-3 flex max-w-xl items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs text-zinc-400 shadow-sm"
                aria-hidden="true"
              >
                🔗
              </span>

              <span className="min-w-0 truncate font-mono text-xs font-medium text-zinc-400">
                /i/{guest.slug}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:items-center lg:justify-end">
          <button
            type="button"
            onClick={onQr}
            className="order-first inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
          >
            <span aria-hidden="true">▣</span>
            QR Code
          </button>

          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-700 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
          >
            <span aria-hidden="true">💬</span>
            WhatsApp
          </button>

          <button
            type="button"
            onClick={onCopyLink}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition duration-200",
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-700 shadow-sm hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
            ].join(" ")}
          >
            <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
            {copied ? "Copié" : "Copier le lien"}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <span aria-hidden="true">✎</span>
            Modifier
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 sm:col-span-1"
          >
            <span aria-hidden="true">×</span>
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}

function GuestTypeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "group relative overflow-hidden rounded-[24px] border p-5 text-left transition duration-300 sm:p-6",
        active
          ? "border-indigo-300 bg-indigo-50/60 shadow-[0_10px_30px_rgba(79,70,229,0.10)] ring-4 ring-indigo-50"
          : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md",
      ].join(" ")}
    >
      {active && (
        <span
          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-sm"
          aria-hidden="true"
        >
          ✓
        </span>
      )}

      <div className="flex items-start gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition duration-300",
            active
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-800",
          ].join(" ")}
          aria-hidden="true"
        >
          {icon}
        </div>

        <div className="min-w-0 pr-7">
          <div className="flex items-center gap-2">
            <h3 className="font-black tracking-tight text-zinc-950">
              {title}
            </h3>
          </div>

          <p className="mt-1.5 text-sm leading-6 text-zinc-500">
            {description}
          </p>

          <p
            className={[
              "mt-3 text-xs font-black uppercase tracking-[0.16em]",
              active ? "text-indigo-600" : "text-zinc-400",
            ].join(" ")}
          >
            {active ? "Sélectionné" : "Choisir ce format"}
          </p>
        </div>
      </div>
    </button>
  );
}
function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength = 120,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-bold text-zinc-900"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

function RsvpSummaryItem({
  label,
  value,
  percentage,
  dot,
  tone,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
  tone: string;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`}
          />

          <span className="truncate text-sm font-bold text-zinc-800">
            {label}
          </span>
        </div>

        <span
          className={`shrink-0 text-sm font-black tabular-nums ${tone}`}
        >
          {percentage}%
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <span className="text-3xl font-black tracking-[-0.04em] text-zinc-950">
            {value}
          </span>

          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            invité{value > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mb-1 h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full ${dot} transition-all duration-500`}
            style={{ width: percentage + "%" }}
          />
        </div>
      </div>
    </div>
  );
}
function StatusBadge({
  status,
}: {
  status: GuestStatus;
}) {
  const config = {
    confirmed: {
      label: "Confirmé",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-100",
      dot: "bg-emerald-500",
    },
    declined: {
      label: "Refusé",
      className:
        "bg-red-50 text-red-700 ring-red-100",
      dot: "bg-red-500",
    },
    pending: {
      label: "En attente",
      className:
        "bg-amber-50 text-amber-700 ring-amber-100",
      dot: "bg-amber-500",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />
      {config.label}
    </span>
  );
}

function Stat({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  icon: string;
  tone?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "indigo";
}) {
  const tones = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_8px_30px_rgba(24,24,27,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function EmptyGuests({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="relative flex min-h-80 items-center justify-center overflow-hidden px-6 py-12 sm:px-8">
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-100/60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-12 h-48 w-48 rounded-full bg-violet-100/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 text-4xl shadow-sm">
          👥
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          Votre espace invités
        </p>

        <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Construisez votre liste d’invités
        </h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
          Ajoutez vos invités pour centraliser les invitations, suivre les
          réponses RSVP et préparer le contrôle des entrées.
        </p>

        <button
          type="button"
          onClick={onAdd}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
        >
          <span className="text-base" aria-hidden="true">
            +
          </span>
          Ajouter le premier invité
        </button>

        <p className="mt-4 text-xs text-zinc-400">
          Vous pourrez ensuite suivre les confirmations et les entrées.
        </p>
      </div>
    </div>
  );
}
