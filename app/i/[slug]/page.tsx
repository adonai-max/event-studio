"use client";

import Image from "next/image";

import { use, useEffect, useState } from "react";
import QRCode from "qrcode";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ResponseStatus = "pending" | "confirmed" | "declined";

type PublicGuest = {
  id: string;
  type: "individual" | "couple";
  firstName1: string;
  lastName1: string;
  firstName2: string;
  lastName2: string;
  whatsapp: string;
  status: ResponseStatus;
  slug: string;
  checkedIn: boolean;
  checkedInAt: string | null;
};

type PublicEvent = {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
  design: unknown;
};

type PublicInvitation = {
  guest: PublicGuest;
  event: PublicEvent;
};

function getInvitationAccentColor(design: unknown): string {
  if (!design || typeof design !== "object") return "#4f46e5";
  const palette = (design as { palette?: unknown }).palette;
  if (!palette || typeof palette !== "object") return "#4f46e5";
  const primary = (palette as { primary?: unknown }).primary;
  return typeof primary === "string" && /^#[0-9a-fA-F]{6}$/.test(primary)
    ? primary
    : "#4f46e5";
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PublicInvitationPage({
  params,
}: InvitationPageProps) {
  const { slug: rawSlug } = use(params);

  const slug = normalizeSlug(decodeURIComponent(rawSlug));

  const [invitation, setInvitation] =
    useState<PublicInvitation | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [responseSubmitted, setResponseSubmitted] =
    useState(false);

  const [responseStatus, setResponseStatus] =
    useState<ResponseStatus>("pending");

  const [responseLoading, setResponseLoading] =
    useState(false);

  const [responseError, setResponseError] = useState("");

  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    async function loadInvitation() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          `/api/public/invitation/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Invitation introuvable.",
          );
        }

        setInvitation(data);

        const status = data.guest?.status ?? "pending";

        setResponseStatus(status);

        setResponseSubmitted(
          status === "confirmed" || status === "declined",
        );
      } catch (error) {
        console.error(
          "❌ Chargement invitation publique :",
          error,
        );

        setInvitation(null);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Invitation introuvable.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInvitation();
  }, [slug]);

  useEffect(() => {
    if (!invitation?.guest) {
      return;
    }

    const invitationUrl = `${window.location.origin}/i/${invitation.guest.slug}`;

    QRCode.toDataURL(invitationUrl, {
      width: 260,
      margin: 2,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch(() => {
        setQrCodeUrl("");
      });
  }, [invitation]);

  const handleResponse = async (
    status: "confirmed" | "declined",
  ) => {
    if (responseLoading || !invitation?.guest) {
      return;
    }

    try {
      setResponseLoading(true);
      setResponseError("");

      const response = await fetch(
        `/api/public/invitation/${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Impossible d&apos;enregistrer votre réponse.",
        );
      }

      const updatedGuest: PublicGuest = data.guest;

      setInvitation((current) =>
        current
          ? {
              ...current,
              guest: updatedGuest,
            }
          : current,
      );

      setResponseStatus(updatedGuest.status);
      setResponseSubmitted(true);
    } catch (error) {
      console.error(
        "❌ Réponse RSVP publique :",
        error,
      );

      setResponseError(
        error instanceof Error
          ? error.message
          : "Impossible d&apos;enregistrer votre réponse.",
      );
    } finally {
      setResponseLoading(false);
    }
  };

  const handleChangeResponse = () => {
    setResponseSubmitted(false);
    setResponseStatus("pending");
    setResponseError("");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-10">
        <section className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />

          <div className="px-7 py-12 text-center sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 text-4xl">
              💌
            </div>

            <h1 className="mt-7 text-2xl font-bold tracking-tight text-zinc-900">
              Chargement de votre invitation
            </h1>

            <p className="mt-3 leading-7 text-zinc-500">
              Nous préparons votre invitation personnelle...
            </p>

            <div className="mx-auto mt-7 h-2 w-48 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-600" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-10">
        <section className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />

          <div className="px-7 py-12 text-center sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-50 text-4xl">
              💌
            </div>

            <h1 className="mt-7 text-2xl font-bold tracking-tight text-zinc-900">
              Invitation introuvable
            </h1>

            <p className="mt-3 leading-7 text-zinc-500">
              {loadError ||
                "Ce lien d&apos;invitation n&apos;est pas associé à un invité enregistré."}
            </p>

            <div className="mt-7 rounded-2xl bg-zinc-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Référence recherchée
              </p>

              <p className="mt-2 break-all font-mono text-sm text-violet-600">
                {slug || "aucun slug"}
              </p>
            </div>

            <p className="mt-7 text-xs font-semibold tracking-wide text-zinc-400">
              Créé avec Event Studio
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { event, guest } = invitation;

  const eventName = event.name || "Mon événement";
  const eventDate = event.date || "Date à définir";
  const eventTime = event.time || "Heure à définir";
  const eventLocation = event.location || "Lieu à définir";
  const accentColor = getInvitationAccentColor(event.design);

  const guestName =
    guest.type === "couple"
      ? `${guest.firstName1} ${guest.lastName1} & ${guest.firstName2} ${guest.lastName2}`
      : `${guest.firstName1} ${guest.lastName1}`;

  const invitationMessage =
    event.description ||
    "Nous avons le plaisir de vous inviter à partager avec nous ce moment exceptionnel.";

  return (
    <main className="min-h-screen bg-[#09090b] px-3 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl justify-center">
        <article className="relative w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:rounded-[2.5rem]">
          <div className="h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-48 h-64 w-64 rounded-full bg-fuchsia-100/50 blur-3xl" />

          <div className="relative px-5 py-10 sm:px-12 sm:py-14">
            <header className="text-center">
              <div className="mx-auto inline-flex items-center rounded-full border px-4 py-2" style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}12` }}>
                <span className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] sm:text-xs" style={{ color: accentColor }}>
                  Invitation personnelle
                </span>
              </div>

              <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
                Cher invité,
              </p>

              <h1 className="mt-3 text-4xl font-serif font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                {guestName}
              </h1>

              <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

              <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
                {invitationMessage}
              </p>
            </header>

            <section className="relative mt-10 overflow-hidden rounded-[1.75rem] bg-zinc-950 p-6 text-white shadow-xl sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-fuchsia-600/10 blur-3xl" />

              <div className="relative">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] sm:text-xs" style={{ color: accentColor }}>
                  Vous êtes invité(e) à
                </p>

                <h2 className="mt-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
                  {eventName}
                </h2>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <InvitationInfo
                    icon="📅"
                    label="Date"
                    value={eventDate}
                    dark
                  />

                  <InvitationInfo
                    icon="🕐"
                    label="Heure"
                    value={eventTime}
                    dark
                  />

                  <InvitationInfo
                    icon="📍"
                    label="Lieu"
                    value={eventLocation}
                    dark
                  />
                </div>
              </div>
            </section>

            <section className="mt-10">
              {!responseSubmitted ? (
                <div className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5 sm:p-7">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                      💌
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-zinc-900">
                      Votre réponse
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                      Merci de nous indiquer votre présence afin de
                      nous aider à préparer votre accueil.
                    </p>
                  </div>

                  {responseError && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                      {responseError}
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={responseLoading}
                      onClick={() =>
                        void handleResponse("confirmed")
                      }
                      className="group rounded-2xl bg-emerald-600 px-5 py-5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-2 text-lg">
                        <span>✓</span>
                        {responseLoading
                          ? "Enregistrement..."
                          : "Je confirme"}
                      </span>

                      <span className="mt-1 block text-xs font-normal text-emerald-100">
                        Je serai présent(e)
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={responseLoading}
                      onClick={() =>
                        void handleResponse("declined")
                      }
                      className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-2 text-lg">
                        <span>×</span>
                        Je refuse
                      </span>

                      <span className="mt-1 block text-xs font-normal text-zinc-500">
                        Je ne pourrai pas venir
                      </span>
                    </button>
                  </div>
                </div>
              ) : responseStatus === "confirmed" ? (
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                    ✓
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-emerald-800 sm:text-2xl">
                    Présence confirmée
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-700">
                    Merci {guest.firstName1} ! Nous sommes heureux
                    de vous compter parmi nous.
                  </p>

                  <button
                    type="button"
                    onClick={handleChangeResponse}
                    className="mt-6 rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Modifier ma réponse
                  </button>
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-6 text-center sm:p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                    💙
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-zinc-800 sm:text-2xl">
                    Réponse enregistrée
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
                    Merci de nous avoir informés. Nous regrettons
                    de ne pas pouvoir vous compter parmi nous cette
                    fois-ci.
                  </p>

                  <button
                    type="button"
                    onClick={handleChangeResponse}
                    className="mt-6 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                  >
                    Modifier ma réponse
                  </button>
                </div>
              )}
            </section>

            <section className="mt-10 overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white">
                  🎟️
                </div>

                <h2 className="mt-3 text-lg font-bold text-zinc-900">
                  Votre pass d&apos;accès
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  QR Code personnel de {guestName}
                </p>
              </div>

              <div className="px-5 py-7 text-center sm:py-9">
                <div className="mx-auto inline-block rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm">
                  {qrCodeUrl ? (
                    <Image
                      src={qrCodeUrl}
                      alt={`QR Code de ${guestName}`}
                      width={260}
                      height={260}
                      className="h-[220px] w-[220px] sm:h-[260px] sm:w-[260px]"
                    />
                  ) : (
                    <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl bg-zinc-50 sm:h-[260px] sm:w-[260px]">
                      <p className="px-6 text-center text-sm text-zinc-500">
                        Génération du QR Code...
                      </p>
                    </div>
                  )}
                </div>

                <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-zinc-500">
                  Présentez ce QR Code à l&apos;entrée de l&apos;événement.
                  Il permettra à l&apos;équipe d&apos;accueil de retrouver
                  rapidement votre invitation.
                </p>

                <div className="mx-auto mt-5 inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  ● QR Code personnel
                </div>
              </div>
            </section>

            <footer className="mt-10 border-t border-zinc-100 pt-7 text-center">
              <p className="text-xs font-semibold tracking-[0.12em] text-zinc-400">
                CRÉÉ AVEC EVENT STUDIO
              </p>

              <p className="mt-2 text-[10px] text-zinc-400">
                Une invitation. Une expérience. Un souvenir.
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}

function InvitationInfo({
  icon,
  label,
  value,
  dark = false,
}: {
  icon: string;
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        dark
          ? "border border-white/10 bg-white/5"
          : "border border-zinc-100 bg-zinc-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
            dark ? "bg-white/10" : "bg-white shadow-sm"
          }`}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
              dark ? "text-zinc-400" : "text-zinc-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-1 break-words text-sm font-semibold ${
              dark ? "text-white" : "text-zinc-800"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
