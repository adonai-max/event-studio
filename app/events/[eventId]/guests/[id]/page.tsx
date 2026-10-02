"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useParams } from "next/navigation";
import EventNavigation from "../../../../components/EventNavigation";
import { supabase } from "../../../../../lib/supabase";

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

type EventInfo = {
  id: string;
  name: string;
};

function mapGuest(row: any): Guest {
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

export default function GuestDetailPage() {
  const params = useParams();

  const eventId = String(params.eventId);
  const guestId = String(params.id);

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);

  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [qrError, setQrError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadGuest = async () => {
      try {
        setLoading(true);

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser();

        if (!user) {
          setEvent(null);
          setGuest(null);
          return;
        }

        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, name")
          .eq("id", eventId)
          .eq("owner_id", user.id)
          .single();

        if (eventError || !eventData) {
          setEvent(null);
          setGuest(null);
          return;
        }

        const { data: guestData, error: guestError } = await supabase
          .from("guests")
          .select("*")
          .eq("id", guestId)
          .eq("event_id", eventId)
          .single();

        if (guestError || !guestData) {
          setEvent(eventData);
          setGuest(null);
          return;
        }

        setEvent(eventData);
        setGuest(mapGuest(guestData));
      } finally {
        setLoading(false);
      }
    };

    loadGuest();
  }, [eventId, guestId]);

  useEffect(() => {
    if (!guest) {
      setQrCode("");
      return;
    }

    const generateQR = async () => {
      try {
        setQrError(false);

        const invitationUrl =
          window.location.origin + "/i/" + guest.slug;

        const qr = await QRCode.toDataURL(invitationUrl, {
          width: 500,
          margin: 2,
          errorCorrectionLevel: "H",
        });

        setQrCode(qr);
      } catch {
        setQrCode("");
        setQrError(true);
      }
    };

    generateQR();
  }, [guest]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <section className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">⏳</div>

          <h1 className="mt-5 text-2xl font-bold text-zinc-900">
            Chargement...
          </h1>

          <p className="mt-3 text-zinc-500">
            Récupération des informations de l'invité.
          </p>
        </section>
      </main>
    );
  }

  if (!event || !guest) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <section className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">👤</div>

          <h1 className="mt-5 text-2xl font-bold text-zinc-900">
            Invité introuvable
          </h1>

          <p className="mt-3 leading-7 text-zinc-500">
            Aucun invité ne correspond à cet identifiant ou cet événement.
          </p>

          <p className="mt-6 text-xs font-semibold tracking-wide text-zinc-400">
            Event Studio
          </p>
        </section>
      </main>
    );
  }

  const guestName =
    guest.type === "couple"
      ? guest.firstName1 +
        " " +
        guest.lastName1 +
        " & " +
        guest.firstName2 +
        " " +
        guest.lastName2
      : guest.firstName1 + " " + guest.lastName1;

  const invitationUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/i/" + guest.slug
      : "/i/" + guest.slug;

  const handleDownloadQr = () => {
    if (!qrCode) {
      return;
    }

    const link = document.createElement("a");

    link.href = qrCode;
    link.download = "event-studio-qr-" + guest.slug + ".png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppShare = () => {
    const message =
      "Bonjour " +
      guest.firstName1 +
      ",%0A%0AVous êtes cordialement invité(e) à notre événement " +
      event.name +
      ".%0A%0AVotre invitation personnelle :%0A" +
      encodeURIComponent(invitationUrl) +
      "%0A%0AMerci de confirmer votre présence.";

    const whatsappUrl = "https://wa.me/?text=" + message;

    window.open(whatsappUrl, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <EventNavigation eventId={eventId} />

        <header className="border-b border-zinc-200 pb-8">
          <p className="text-sm font-semibold text-indigo-600">
            EVENT STUDIO
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
            QR Code de l'invité
          </h1>

          <p className="mt-3 text-zinc-600">
            {event.name}
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Gérez le QR Code personnel associé à cette invitation.
          </p>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Invité
            </p>

            <h2 className="mt-3 text-3xl font-bold text-zinc-900">
              {guestName}
            </h2>

            <div className="mt-8 space-y-5">
              <GuestInfo
                label="Type"
                value={
                  guest.type === "couple"
                    ? "Couple"
                    : "Invité individuel"
                }
              />

              <GuestInfo
                label="WhatsApp"
                value={guest.whatsapp || "Non renseigné"}
              />

              <GuestInfo
                label="Statut"
                value={
                  guest.status === "confirmed"
                    ? "Confirmé"
                    : guest.status === "declined"
                      ? "Refusé"
                      : "En attente"
                }
              />

              <GuestInfo
                label="Entrée"
                value={
                  guest.checkedIn
                    ? "✓ Entrée enregistrée"
                    : "Non enregistrée"
                }
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Lien personnalisé
                </p>

                <p className="mt-2 break-all rounded-xl bg-zinc-50 px-4 py-3 font-mono text-sm text-indigo-600">
                  {invitationUrl}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  {copied ? "✓ Lien copié" : "🔗 Copier le lien"}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Accès invitation
            </p>

            <h2 className="mt-3 text-2xl font-bold text-zinc-900">
              QR Code personnel
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Ce QR Code ouvre directement l'invitation personnalisée
              de cet invité.
            </p>

            <div className="mt-8 flex justify-center">
              {qrCode ? (
                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <img
                    src={qrCode}
                    alt={"QR Code de " + guestName}
                    width={500}
                    height={500}
                    className="h-80 w-80 max-w-full rounded-xl"
                  />
                </div>
              ) : (
                <div className="flex h-80 w-80 max-w-full items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50">
                  <p className="px-6 text-center text-sm text-zinc-500">
                    {qrError
                      ? "Impossible de générer le QR Code."
                      : "Génération du QR Code..."}
                  </p>
                </div>
              )}
            </div>

            <p className="mt-6 text-sm font-semibold text-zinc-800">
              Scanner pour ouvrir l'invitation
            </p>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-500">
              Ce QR Code est unique à cet invité et utilise son lien
              personnalisé.
            </p>

            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrCode}
              className="mt-7 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ⬇ Télécharger le QR Code
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function GuestInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-zinc-800">
        {value}
      </p>
    </div>
  );
}
