"use client";

import { use, useEffect, useState } from "react";
import QRCode from "qrcode";
import { useEvent } from "../../context/EventContext";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

  const { event, guests, updateGuestStatus } = useEvent();

  const slug = normalizeSlug(decodeURIComponent(rawSlug));

  const guest = guests.find(
    (currentGuest) =>
      normalizeSlug(currentGuest.slug) === slug,
  );

  const [responseSubmitted, setResponseSubmitted] = useState(
    guest?.status === "confirmed" ||
      guest?.status === "declined",
  );

  const [responseStatus, setResponseStatus] = useState(
    guest?.status ?? "pending",
  );

  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (!guest) {
      return;
    }

    const invitationUrl = `${window.location.origin}/i/${guest.slug}`;

    QRCode.toDataURL(invitationUrl, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch(() => {
        setQrCodeUrl("");
      });
  }, [guest]);

  if (!guest) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <section className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="text-5xl">💌</div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Invitation introuvable
          </h1>

          <p className="mt-3 leading-7 text-zinc-400">
            Ce lien d'invitation n'est pas associé à un invité
            enregistré dans cet événement.
          </p>

          <div className="mt-6 rounded-xl bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Slug recherché
            </p>

            <p className="mt-2 break-all font-mono text-sm text-indigo-400">
              {slug || "aucun slug"}
            </p>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Event Studio
          </p>
        </section>
      </main>
    );
  }

  const eventName = event.name || "Mon événement";
  const eventDate = event.date || "Date à définir";
  const eventTime = event.time || "Heure à définir";
  const eventLocation = event.location || "Lieu à définir";

  const guestName =
    guest.type === "couple"
      ? `${guest.firstName1} ${guest.lastName1} & ${guest.firstName2} ${guest.lastName2}`
      : `${guest.firstName1} ${guest.lastName1}`;

  const invitationMessage =
    event.description ||
    "Nous avons le plaisir de vous inviter à partager avec nous ce moment exceptionnel.";

  const handleResponse = (
    status: "confirmed" | "declined",
  ) => {
    updateGuestStatus(guest.id, status);

    setResponseStatus(status);
    setResponseSubmitted(true);
  };

  const handleChangeResponse = () => {
    setResponseSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <article className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-2 bg-indigo-600" />

          <div className="px-6 py-12 text-center sm:px-12 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600">
              Invitation personnelle
            </p>

            <div className="mx-auto mt-8 h-px w-20 bg-indigo-600" />

            <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Cher invité,
            </p>

            <h1 className="mt-4 text-4xl font-serif font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              {guestName}
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-zinc-600">
              {invitationMessage}
            </p>

            <div className="mx-auto mt-10 max-w-md rounded-2xl bg-zinc-50 p-6 text-left">
              <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
                {eventName}
              </p>

              <div className="mt-6 space-y-4">
                <InvitationInfo
                  icon="📅"
                  label="Date"
                  value={eventDate}
                />

                <InvitationInfo
                  icon="🕐"
                  label="Heure"
                  value={eventTime}
                />

                <InvitationInfo
                  icon="📍"
                  label="Lieu"
                  value={eventLocation}
                />
              </div>
            </div>

            <section className="mx-auto mt-10 max-w-md">
              {!responseSubmitted ? (
                <>
                  <p className="text-sm leading-6 text-zinc-500">
                    Merci de nous indiquer votre réponse afin de
                    nous aider à préparer votre accueil.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleResponse("confirmed")}
                      className="rounded-2xl bg-emerald-600 px-5 py-4 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                    >
                      <span className="block text-xl">✓</span>

                      <span className="mt-1 block">
                        Je confirme
                      </span>

                      <span className="mt-1 block text-xs font-normal text-emerald-100">
                        Je serai présent(e)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResponse("declined")}
                      className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 font-semibold text-zinc-800 transition hover:bg-zinc-50"
                    >
                      <span className="block text-xl">×</span>

                      <span className="mt-1 block">
                        Je refuse
                      </span>

                      <span className="mt-1 block text-xs font-normal text-zinc-500">
                        Je ne pourrai pas venir
                      </span>
                    </button>
                  </div>
                </>
              ) : responseStatus === "confirmed" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                  <div className="text-5xl">🎉</div>

                  <h2 className="mt-4 text-xl font-bold text-emerald-800">
                    Présence confirmée
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-emerald-700">
                    Merci {guest.firstName1} !
                    <br />
                    Nous sommes heureux de vous compter parmi
                    nous.
                  </p>

                  <button
                    type="button"
                    onClick={handleChangeResponse}
                    className="mt-5 rounded-full border border-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Modifier ma réponse
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                  <div className="text-5xl">💙</div>

                  <h2 className="mt-4 text-xl font-bold text-zinc-800">
                    Réponse enregistrée
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    Merci de nous avoir informés.
                    <br />
                    Nous regrettons de ne pas pouvoir vous compter
                    parmi nous cette fois-ci.
                  </p>

                  <button
                    type="button"
                    onClick={handleChangeResponse}
                    className="mt-5 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-white"
                  >
                    Modifier ma réponse
                  </button>
                </div>
              )}
            </section>

            <section className="mx-auto mt-12 max-w-md border-t border-zinc-100 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Accès rapide
              </p>

              <div className="mt-5 flex justify-center">
                {qrCodeUrl ? (
                  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt={`QR Code de ${guestName}`}
                      width={220}
                      height={220}
                      className="h-[220px] w-[220px]"
                    />
                  </div>
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50">
                    <p className="px-6 text-center text-sm text-zinc-500">
                      Génération du QR Code...
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm font-semibold text-zinc-800">
                Votre QR Code personnel
              </p>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-500">
                Ce QR Code est associé à votre invitation.
                Il pourra être utilisé à l'entrée de l'événement
                pour vous identifier rapidement.
              </p>
            </section>

            <div className="mt-10 border-t border-zinc-100 pt-6">
              <p className="text-xs font-semibold tracking-wide text-zinc-400">
                Créé avec Event Studio
              </p>
            </div>
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
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
        {icon}
      </span>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {label}
        </p>

        <p className="mt-1 font-semibold text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  );
}