"use client";

import { useState } from "react";
import EventNavigation from "../../../components/EventNavigation";
import { useDemoEvent } from "../../../context/DemoEventContext";

const colorPalettes = [
  { name: "Élégant", color: "#4f46e5" },
  { name: "Classique", color: "#1d4ed8" },
  { name: "Nature", color: "#15803d" },
  { name: "Passion", color: "#dc2626" },
  { name: "Luxe", color: "#18181b" },
  { name: "Doux", color: "#db2777" },
];

const invitationStyles = [
  { name: "Élégant", value: "elegant" },
  { name: "Minimaliste", value: "minimal" },
  { name: "Romantique", value: "romantic" },
  { name: "Luxe", value: "luxury" },
  { name: "Moderne", value: "modern" },
];

function getStyleClasses(style: string) {
  switch (style) {
    case "minimal":
      return "rounded-xl border border-zinc-200 bg-white shadow-sm";
    case "romantic":
      return "rounded-[2rem] border border-pink-200 bg-pink-50 shadow-lg";
    case "luxury":
      return "rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl";
    case "modern":
      return "rounded-3xl border border-zinc-300 bg-zinc-50 shadow-xl";
    case "elegant":
    default:
      return "rounded-2xl border border-zinc-200 bg-white shadow-xl";
  }
}

function getTitleClasses(style: string) {
  switch (style) {
    case "minimal":
      return "mt-6 text-4xl font-semibold tracking-tight text-zinc-900";
    case "romantic":
      return "mt-6 text-4xl font-serif font-semibold tracking-tight text-pink-900";
    case "luxury":
      return "mt-6 text-4xl font-serif font-bold tracking-[0.03em] text-white";
    case "modern":
      return "mt-6 text-4xl font-bold tracking-[-0.03em] text-zinc-900";
    case "elegant":
    default:
      return "mt-6 text-4xl font-serif font-semibold tracking-tight text-zinc-900";
  }
}

function getMessageClasses(style: string) {
  switch (style) {
    case "minimal":
      return "mt-6 leading-7 text-sm text-zinc-600";
    case "romantic":
      return "mt-6 font-serif leading-8 text-pink-800";
    case "luxury":
      return "mt-6 font-serif leading-8 text-zinc-300";
    case "modern":
      return "mt-6 leading-7 text-base text-zinc-600";
    case "elegant":
    default:
      return "mt-6 font-serif leading-8 text-zinc-600";
  }
}

export default function InvitationBuilderPage() {
  const { event } = useDemoEvent();

  const [message, setMessage] = useState(
    event.description ||
      "Nous avons le plaisir de vous inviter à partager avec nous ce moment exceptionnel.",
  );

  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [invitationStyle, setInvitationStyle] = useState("elegant");

  const eventName = event.name || "Mon événement";
  const eventDate = event.date || "";
  const eventTime = event.time || "";
  const location = event.location || "";

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <EventNavigation eventId="demo" />

        <header className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            EVENT STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
            Invitation Builder
          </h1>

          <p className="mt-3 text-zinc-600">
            Créez et personnalisez votre invitation avec un aperçu en temps réel.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">
              Contenu
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="event-name"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Nom de l&apos;événement
                </label>

                <input
                  id="event-name"
                  type="text"
                  value={eventName}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Date
                </label>

                <input
                  id="date"
                  type="date"
                  value={eventDate}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Heure
                </label>

                <input
                  id="time"
                  type="time"
                  value={eventTime}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Lieu
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-zinc-900"
                >
                  Message d&apos;invitation
                </label>

                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  Style de l&apos;invitation
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {invitationStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setInvitationStyle(style.value)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        invitationStyle === style.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  Palettes prédéfinies
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => setAccentColor(palette.color)}
                      className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-800 transition hover:bg-zinc-50"
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-zinc-200"
                        style={{ backgroundColor: palette.color }}
                      />

                      <span>{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <label
                  htmlFor="accent-color"
                  className="block text-sm font-semibold text-zinc-900"
                >
                  Couleur principale
                </label>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
                  />

                  <span className="text-sm text-zinc-600">
                    {accentColor}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl px-5 py-3 font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Personnaliser le design
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600">
                  APERÇU
                </p>

                <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                  Votre invitation
                </h2>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                Aperçu
              </span>
            </div>

            <div className="mt-6 flex min-h-[600px] items-center justify-center rounded-2xl bg-zinc-100 p-6">
              <div
                className={`w-full max-w-md p-10 text-center ${getStyleClasses(
                  invitationStyle,
                )}`}
              >
                <p
                  className="text-sm font-medium uppercase tracking-[0.25em]"
                  style={{ color: accentColor }}
                >
                  Invitation
                </p>

                <h3 className={getTitleClasses(invitationStyle)}>
                  {eventName}
                </h3>

                <div
                  className="mx-auto mt-6 h-px w-20"
                  style={{ backgroundColor: accentColor }}
                />

                <p className={getMessageClasses(invitationStyle)}>
                  {message}
                </p>

                <div
                  className={`mt-8 space-y-2 text-sm ${
                    invitationStyle === "luxury"
                      ? "text-zinc-300"
                      : invitationStyle === "romantic"
                        ? "text-pink-800"
                        : "text-zinc-700"
                  }`}
                >
                  <p>📅 {eventDate || "Date à définir"}</p>
                  <p>🕐 {eventTime || "Heure à définir"}</p>
                  <p>📍 {location || "Lieu à définir"}</p>
                </div>

                <button
                  type="button"
                  className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
                >
                  Confirmer ma présence
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}