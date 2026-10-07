"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import EventNavigation from "@/app/components/EventNavigation";

type EventForm = {
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = String(params.eventId);

  const [form, setForm] = useState<EventForm>({
    name: "",
    type: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, type, date, time, location, description, owner_id",
        )
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (error || !data) {
        setErrorMessage(
          "Impossible de charger cet événement ou vous n'avez pas accès à celui-ci.",
        );
        setLoading(false);
        return;
      }

      setForm({
        name: data.name ?? "",
        type: data.type ?? "",
        date: data.date ?? "",
        time: data.time ? String(data.time).slice(0, 5) : "",
        location: data.location ?? "",
        description: data.description ?? "",
      });

      setLoading(false);
    }

    void loadEvent();
  }, [eventId, router]);

  function updateField(field: keyof EventForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage("Le nom de l'événement est obligatoire.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("events")
      .update({
        name: form.name.trim(),
        type: form.type.trim(),
        date: form.date || null,
        time: form.time || null,
        location: form.location.trim(),
        description: form.description.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Erreur mise à jour événement:", error);

      setErrorMessage(
        "Impossible d'enregistrer les modifications. Veuillez réessayer.",
      );

      setSaving(false);
      return;
    }

    setSuccessMessage("Événement mis à jour avec succès.");
    setSaving(false);

    setTimeout(() => {
      router.push(`/events/${eventId}`);
      router.refresh();
    }, 700);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 event-page-motion">
        <div className="mx-auto max-w-4xl">
        <EventNavigation eventId={eventId} />
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-zinc-200" />

            <div className="mt-8 space-y-4">
              <div className="h-12 animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-12 animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-12 animate-pulse rounded-xl bg-zinc-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage && !form.name) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 event-page-motion">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-red-600">
              {errorMessage}
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 event-page-motion">
      <div className="mx-auto max-w-4xl">
        <EventNavigation eventId={eventId} eventName={form.name || "Modifier l'événement"} />

        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-semibold text-indigo-100">
              EVENT STUDIO
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Modifier l&apos;événement
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Modifiez les informations principales de votre événement.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Nom de l&apos;événement
                </label>

                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex. Mariage Adonaï & Sarah"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Type d&apos;événement
                </label>

                <input
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  placeholder="Ex. Mariage, anniversaire..."
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Date
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Heure
                </label>

                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => updateField("time", e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Lieu
                </label>

                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Ex. Likasi, RDC"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Ajoutez une description de l'événement..."
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                href={`/events/${eventId}`}
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
