"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useTheme, type Theme } from "../context/ThemeContext";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("fr");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedNotifications =
      localStorage.getItem("event-studio-notifications");

    const savedLanguage =
      localStorage.getItem("event-studio-language") || "fr";

    setNotifications(savedNotifications !== "false");
    setLanguage(savedLanguage);
  }, []);

  function toggleNotifications() {
    const next = !notifications;

    setNotifications(next);
    localStorage.setItem(
      "event-studio-notifications",
      String(next),
    );
  }

  function changeLanguage(value: string) {
    setLanguage(value);
    localStorage.setItem("event-studio-language", value);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    setSaving(false);
    setMessage("Vos préférences ont été enregistrées.");
  }

  const themeOptions: {
    value: Theme;
    title: string;
    icon: string;
    text: string;
  }[] = [
    {
      value: "system",
      title: "Système",
      icon: "💻",
      text: "Selon votre appareil",
    },
    {
      value: "light",
      title: "Clair",
      icon: "☀️",
      text: "Interface lumineuse",
    },
    {
      value: "dark",
      title: "Sombre",
      icon: "🌙",
      text: "Interface sombre",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Retour au tableau de bord
            </Link>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Paramètres
            </h1>

            <p className="mt-2 text-sm text-zinc-500 sm:text-base dark:text-zinc-400">
              Configurez votre compte et votre expérience Event Studio.
            </p>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            👤 Mon profil
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">

          {/* Sidebar */}
          <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <nav className="space-y-1">
              <a
                href="#compte"
                className="block rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
              >
                👤 Compte
              </a>

              <a
                href="#preferences"
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                ⚙️ Préférences
              </a>

              <a
                href="#apparence"
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                🎨 Apparence
              </a>

              <a
                href="#securite"
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                🔐 Sécurité
              </a>
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-6">

            {/* Compte */}
            <section
              id="compte"
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  Compte
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Informations du compte
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Gérez les informations principales associées à votre compte.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/profile"
                  className="rounded-2xl border border-zinc-200 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-zinc-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <div className="text-2xl">👤</div>

                  <h3 className="mt-3 font-bold">
                    Profil personnel
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Nom, photo, téléphone et présentation.
                  </p>
                </Link>

                <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                  <div className="text-2xl">✉️</div>

                  <h3 className="mt-3 font-bold">
                    Adresse e-mail
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Votre adresse e-mail est gérée par Supabase Auth.
                  </p>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section
              id="preferences"
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  Préférences
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Votre expérience
                </h2>
              </div>

              <div className="space-y-5">

                {/* Language */}
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold">Langue</h3>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Langue principale de l'interface.
                    </p>
                  </div>

                  <select
                    value={language}
                    onChange={(event) =>
                      changeLanguage(event.target.value)
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold">
                      Notifications
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Recevoir les notifications importantes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleNotifications}
                    className={[
                      "relative h-7 w-12 rounded-full transition",
                      notifications
                        ? "bg-indigo-600"
                        : "bg-zinc-300 dark:bg-zinc-700",
                    ].join(" ")}
                    aria-label="Activer ou désactiver les notifications"
                  >
                    <span
                      className={[
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                        notifications
                          ? "left-6"
                          : "left-1",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Apparence */}
            <section
              id="apparence"
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  Apparence
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Personnalisez l'interface
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Choisissez comment Event Studio doit gérer son apparence.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {themeOptions.map((item) => {
                  const active = theme === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setTheme(item.value)}
                      className={[
                        "rounded-2xl border p-5 text-left transition",
                        active
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100 dark:border-indigo-500 dark:bg-indigo-950/50 dark:ring-indigo-900"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      <div className="text-2xl">
                        {item.icon}
                      </div>

                      <h3 className="mt-3 font-bold">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {item.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sécurité */}
            <section
              id="securite"
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  Sécurité
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Sécurité du compte
                </h2>
              </div>

              <div className="space-y-3">

                {/* Password */}
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold">
                      Mot de passe
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      La gestion avancée du mot de passe sera ajoutée dans la prochaine étape sécurité.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                  >
                    Bientôt
                  </button>
                </div>

                {/* Sign out */}
                <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-red-950 dark:bg-red-950/20">
                  <div>
                    <h3 className="font-bold text-red-700 dark:text-red-400">
                      Déconnexion
                    </h3>

                    <p className="mt-1 text-sm text-red-600/70 dark:text-red-400/70">
                      Fermer la session Event Studio sur cet appareil.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-zinc-950 p-6 text-white shadow-xl dark:bg-black sm:flex-row sm:items-center">
              <div>
                <h2 className="font-black">
                  Préférences Event Studio
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Vos préférences locales sont conservées sur cet appareil.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {message && (
                  <span className="text-sm font-semibold text-emerald-400">
                    ✓ {message}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
