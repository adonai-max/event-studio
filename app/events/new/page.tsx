"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const defaultDesign = {
  style: "elegant",
  layout: "classic",
  palette: {
    name: "Ivoire Royal",
    primary: "#4f46e5",
    secondary: "#7c3aed",
    background: "#f8f5ed",
    surface: "#ffffff",
    text: "#18181b",
    muted: "#71717a",
    border: "#e4e4e7",
  },
  accentColor: "#4f46e5",
  titleFont: "serif",
  bodyFont: "sans",
  background: "ivory",
  customBackgroundColor: "#f8f5ed",
  density: "balanced",
  radius: "elegant",
  decoration: "none",
};

export default function NewEventPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !type ||
      !date ||
      !time ||
      !location.trim()
    ) {
      setError(
        "Veuillez remplir tous les champs obligatoires.",
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: newEvent, error: insertError } =
        await supabase
          .from("events")
          .insert({
            owner_id: user.id,
            name: name.trim(),
            type,
            date: date || null,
            time: time || null,
            location: location.trim(),
            description: description.trim(),
            design: defaultDesign,
          })
          .select(
            "id, name, type, date, time, location, description, design",
          )
          .single();

      if (insertError || !newEvent) {
        console.error(
          "❌ ERREUR SUPABASE — création événement :",
          insertError,
        );

        setError(
          "Impossible d’enregistrer l’événement. Vérifiez la connexion à votre compte.",
        );

        setLoading(false);
        return;
      }

      const finalEvent = {
        id: newEvent.id,
        name: newEvent.name ?? "",
        type: newEvent.type ?? "",
        date: newEvent.date ?? "",
        time: newEvent.time ?? "",
        location: newEvent.location ?? "",
        description: newEvent.description ?? "",
        design: newEvent.design ?? defaultDesign,
      };

      localStorage.setItem(
        "event-studio-event",
        JSON.stringify(finalEvent),
      );

      router.push("/events/" + newEvent.id);
    } catch (error) {
      console.error(
        "❌ ERREUR CRÉATION ÉVÉNEMENT :",
        error,
      );

      setError(
        "Une erreur est survenue lors de la création de l’événement.",
      );

      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 dark:text-blue-300 dark:hover:text-blue-200"
          >
            ← Retour au Dashboard
          </button>

          <div className="rounded-[28px] bg-gradient-to-br from-[#101a2e] via-[#172b4d] to-[#234c86] p-8 text-white shadow-xl sm:p-10">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold ring-1 ring-white/15">
              ES
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
              Event Studio
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Créer votre événement
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Préparez votre événement et personnalisez ensuite
              son invitation depuis votre espace.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Nom de l&apos;événement
              </label>

              <input
                id="name"
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Mariage Adonaï & Grâce"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Type d&apos;événement
              </label>

              <select
                id="type"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950"
              >
                <option value="">Sélectionner</option>
                <option value="Mariage">Mariage</option>
                <option value="Anniversaire">Anniversaire</option>
                <option value="Baptême">Baptême</option>
                <option value="Conférence">Conférence</option>
                <option value="Église">Église</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Lieu
              </label>

              <input
                id="location"
                type="text"
                required
                maxLength={200}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex. Salle des fêtes"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Date
              </label>

              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Heure
              </label>

              <input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-zinc-900"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajoutez quelques détails sur votre événement..."
                rows={5}
                maxLength={2000}
                className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-blue-950"
              />
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Création en cours..."
                : "Créer mon événement"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
