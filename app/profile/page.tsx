"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const metadata = user.user_metadata ?? {};

      setFullName(metadata.full_name ?? metadata.name ?? "");
      setEmail(user.email ?? "");
      setPhone(metadata.phone ?? "");
      setOrganization(metadata.organization ?? "");
      setDescription(metadata.description ?? "");
      setAvatarUrl(metadata.avatar_url ?? "");

      setLoading(false);
    }

    void loadProfile();
  }, []);


  async function handleAvatarUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarMessage("");

    if (!file.type.startsWith("image/")) {
      setAvatarMessage("Veuillez sélectionner une image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage("La photo ne doit pas dépasser 5 Mo.");
      event.target.value = "";
      return;
    }

    setAvatarUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

      console.log("=== EVENT STUDIO STORAGE DEBUG ===");
      console.log("User ID:", user.id);
      console.log("User email:", user.email);
      console.log("File path:", filePath);
      console.log("Bucket:", "avatars");
      console.log("=================================");

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        setAvatarMessage("Impossible d'envoyer la photo.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateError) {
        console.error(updateError);
        setAvatarMessage("Photo envoyée, mais profil non mis à jour.");
        return;
      }

      setAvatarUrl(publicUrl);
      setAvatarMessage("Photo de profil mise à jour.");
    } catch (error) {
      console.error(error);
      setAvatarMessage("Une erreur est survenue pendant l'envoi.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  async function handleAvatarDelete() {
    setAvatarUploading(true);
    setAvatarMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: "",
        },
      });

      if (error) {
        console.error(error);
        setAvatarMessage("Impossible de supprimer la photo.");
        return;
      }

      setAvatarUrl("");
      setAvatarMessage("Photo de profil supprimée.");
    } catch (error) {
      console.error(error);
      setAvatarMessage("Une erreur est survenue.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        description: description.trim(),
        avatar_url: avatarUrl.trim(),
      },
    });

    if (error) {
      setMessage("Une erreur est survenue pendant la sauvegarde.");
      setSaving(false);
      return;
    }

    setMessage("Profil mis à jour avec succès.");
    setSaving(false);
  }

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ES";

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-zinc-200" />
          <div className="mt-8 h-72 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-950"
            >
              <span className="text-lg">←</span>
              Tableau de bord
            </Link>

            <h1 className="text-3xl font-black tracking-tight">
              Mon profil
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Gérez vos informations personnelles et votre identité Event Studio.
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-black text-white shadow-lg shadow-indigo-600/20">
            ES
          </div>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40">
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-indigo-950 to-violet-900 px-6 py-10 text-white sm:px-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="group relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Photo de profil"
                    className="h-28 w-28 rounded-[2rem] object-cover ring-4 ring-white/20"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/10 text-3xl font-black ring-4 ring-white/20 backdrop-blur">
                    {initials}
                  </div>
                )}

                <label className="absolute inset-x-2 bottom-2 cursor-pointer rounded-xl bg-black/70 px-2 py-1.5 text-center text-xs font-bold text-white backdrop-blur transition hover:bg-black/85">
                  {avatarUploading ? "Envoi..." : "Changer la photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="text-sm font-semibold text-indigo-200">
                  Votre espace personnel
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {fullName || "Utilisateur Event Studio"}
                </h2>

                <p className="mt-1 text-sm text-zinc-300">
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_0.7fr]">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black">Informations personnelles</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Ces informations permettent de personnaliser votre espace.
                </p>
              </div>

              <div className="space-y-5">
                <Field
                  label="Nom complet"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Adonaï Nkwambe"
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-800">
                    Adresse e-mail
                  </label>

                  <input
                    value={email}
                    disabled
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3.5 text-sm text-zinc-500 outline-none"
                  />

                  <p className="mt-2 text-xs text-zinc-400">
                    L’adresse e-mail est gérée par votre compte sécurisé.
                  </p>
                </div>

                <Field
                  label="Téléphone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+243 ..."
                />

                <Field
                  label="Organisation / entreprise"
                  value={organization}
                  onChange={setOrganization}
                  placeholder="Nom de votre organisation"
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-800">
                    À propos de vous
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Présentez-vous en quelques mots..."
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
                  </button>

                  {message && (
                    <p className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                      <span aria-hidden="true">✓</span>
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                  Compte
                </p>

                <h3 className="mt-3 text-lg font-black">
                  Event Studio
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Votre profil centralisera bientôt vos préférences,
                  notifications, sécurité et personnalisation.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6">
                <p className="text-sm font-bold text-zinc-900">
                  Photo de profil
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Votre photo est stockée dans Supabase Storage et associée
                  uniquement à votre compte Event Studio.
                </p>

                <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 px-4 py-4 text-sm font-bold text-zinc-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700">
                  {avatarUploading
                    ? "Téléversement en cours..."
                    : "Choisir une nouvelle photo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => void handleAvatarDelete()}
                    disabled={avatarUploading}
                    className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Supprimer la photo
                  </button>
                )}

                {avatarMessage && (
                  <p className="mt-3 text-xs font-semibold text-indigo-600">
                    {avatarMessage}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-zinc-800">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}
