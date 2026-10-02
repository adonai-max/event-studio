"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Guest,
  GuestType,
  GuestStatus,
  useEvent,
} from "../../../context/EventContext";
import EventNavigation from "../../../components/EventNavigation";

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
    `${firstName1}-${lastName1}`,
  );

  if (type === "couple") {
    const secondaryName = normalizeText(
      `${firstName2}-${lastName2}`,
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
  currentGuestId?: number,
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

  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter += 1;
  }

  return `${baseSlug}-${counter}`;
}

export default function GuestsPage() {
  const router = useRouter();

  const {
    guests,
    addGuest,
    updateGuest,
    deleteGuest,
    updateGuestStatus,
  } = useEvent();

  const [showForm, setShowForm] = useState(false);
  const [guestType, setGuestType] =
    useState<GuestType>("individual");

  const [firstName1, setFirstName1] = useState("");
  const [lastName1, setLastName1] = useState("");
  const [firstName2, setFirstName2] = useState("");
  const [lastName2, setLastName2] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [editingGuestId, setEditingGuestId] =
    useState<number | null>(null);

  const resetForm = () => {
    setFirstName1("");
    setLastName1("");
    setFirstName2("");
    setLastName2("");
    setWhatsapp("");
    setGuestType("individual");
    setEditingGuestId(null);
  };

  const handleSaveGuest = () => {
    if (
      !firstName1.trim() ||
      !lastName1.trim() ||
      !whatsapp.trim()
    ) {
      return;
    }

    if (
      guestType === "couple" &&
      (!firstName2.trim() || !lastName2.trim())
    ) {
      return;
    }

    const slug = createUniqueGuestSlug(
      firstName1.trim(),
      lastName1.trim(),
      firstName2.trim(),
      lastName2.trim(),
      guestType,
      guests,
      editingGuestId ?? undefined,
    );

    const guestData = {
      type: guestType,
      firstName1: firstName1.trim(),
      lastName1: lastName1.trim(),
      firstName2: firstName2.trim(),
      lastName2: lastName2.trim(),
      whatsapp: whatsapp.trim(),
      slug,
    };

    if (editingGuestId !== null) {
      const existingGuest = guests.find(
        (guest) => guest.id === editingGuestId,
      );

      if (existingGuest) {
        updateGuest({
          ...existingGuest,
          ...guestData,
        });
      }

      resetForm();
      setShowForm(false);
      return;
    }

    const newGuest: Guest = {
      id: Date.now(),
      ...guestData,
      status: "pending",
      checkedIn: false,
      checkedInAt: null,
    };

    addGuest(newGuest);

    resetForm();
    setShowForm(false);
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

  const handleDeleteGuest = (guestId: number) => {
    deleteGuest(guestId);
  };

  const handleViewQrCode = (guestId: number) => {
    router.push(`/events/demo/guests/${guestId}`);
  };

  const handleChangeStatus = (
    guest: Guest,
    status: GuestStatus,
  ) => {
    /*
     * Si l'invité a déjà été enregistré à l'entrée,
     * on ne modifie pas son statut depuis cette interface.
     * Cela évite de créer une incohérence dans Event Control.
     */
    if (guest.checkedIn) {
      return;
    }

    updateGuestStatus(guest.id, status);
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

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <EventNavigation />

        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              EVENT STUDIO
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
              Gestion des invités
            </h1>

            <p className="mt-3 text-zinc-600">
              Ajoutez, gérez et suivez le statut de vos invités.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            + Ajouter un invité
          </button>
        </header>

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
                className={`rounded-2xl border p-5 text-left transition ${
                  guestType === "individual"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
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
                className={`rounded-2xl border p-5 text-left transition ${
                  guestType === "couple"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
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

            <div className="mt-6 rounded-xl bg-zinc-50 p-5">
              <p className="text-sm font-medium text-zinc-700">
                Type sélectionné
              </p>

              <p className="mt-1 text-lg font-semibold text-indigo-600">
                {guestType === "individual"
                  ? "Invité individuel"
                  : "Couple"}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSaveGuest}
                className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                {editingGuestId !== null
                  ? "Enregistrer les modifications"
                  : "Ajouter l'invité"}
              </button>
            </div>
          </section>
        )}

        {/* STATISTIQUES */}
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

        {/* LISTE DES INVITÉS */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-6">
            <h2 className="text-xl font-semibold text-zinc-900">
              Liste des invités
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Le statut RSVP détermine automatiquement
              l'autorisation d'entrée dans Event Control.
            </p>
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
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900">
                          {guest.type === "couple"
                            ? `${guest.firstName1} ${guest.lastName1} & ${guest.firstName2} ${guest.lastName2}`
                            : `${guest.firstName1} ${guest.lastName1}`}
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
                        <StatusBadge
                          status={guest.status}
                          checkedIn={guest.checkedIn}
                        />

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

                    {/* GESTION DU RSVP */}
                    {!guest.checkedIn && (
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              Statut de présence
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              Ce statut sera utilisé par Event Control lors du contrôle d'entrée.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <StatusButton
                              active={
                                guest.status === "pending"
                              }
                              onClick={() =>
                                handleChangeStatus(
                                  guest,
                                  "pending",
                                )
                              }
                              className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              🟠 En attente
                            </StatusButton>

                            <StatusButton
                              active={
                                guest.status === "confirmed"
                              }
                              onClick={() =>
                                handleChangeStatus(
                                  guest,
                                  "confirmed",
                                )
                              }
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              🟢 Confirmer
                            </StatusButton>

                            <StatusButton
                              active={
                                guest.status === "declined"
                              }
                              onClick={() =>
                                handleChangeStatus(
                                  guest,
                                  "declined",
                                )
                              }
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              🔴 Refuser
                            </StatusButton>
                          </div>
                        </div>
                      </div>
                    )}

                    {guest.checkedIn && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-700">
                          ⛔ Entrée déjà enregistrée
                        </p>

                        {guest.checkedInAt && (
                          <p className="mt-1 text-xs text-red-600">
                            Enregistrée le{" "}
                            {new Date(
                              guest.checkedInAt,
                            ).toLocaleString("fr-FR")}
                          </p>
                        )}
                      </div>
                    )}
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
  checkedIn,
}: {
  status: Guest["status"];
  checkedIn: boolean;
}) {
  if (checkedIn) {
    return (
      <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        ⛔ Déjà entré
      </span>
    );
  }

  if (status === "confirmed") {
    return (
      <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        🟢 Confirmé
      </span>
    );
  }

  if (status === "declined") {
    return (
      <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        🔴 Refusé
      </span>
    );
  }

  return (
    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      🟠 En attente
    </span>
  );
}

function StatusButton({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-zinc-900 text-white border-zinc-900"
          : `bg-white ${className}`
      }`}
    >
      {children}
    </button>
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