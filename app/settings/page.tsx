"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useTheme, type Theme } from "../context/ThemeContext";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return (
      window.localStorage.getItem(
        "event-studio-notifications",
      ) !== "false"
    );
  });

  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "fr";
    }

    return (
      window.localStorage.getItem(
        "event-studio-language",
      ) || "fr"
    );
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
    router.replace("/login");
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    // La langue et les notifications sont déjà persistées dans localStorage ;
    // le thème est géré par ThemeContext. On confirme sans simuler une sauvegarde serveur.
    setSaving(false);
    setMessage("Vos préférences sont enregistrées sur cet appareil.");
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
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Retour au tableau de bord
            </Link>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              Event Studio
            </div>

            <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Paramètres
            </h1>

            <p className="mt-2 text-sm text-zinc-500 sm:text-base dark:text-zinc-400">
              Configurez votre compte et votre expérience Event Studio.
            </p>
          </div>

          <Link
            href="/profile"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              👤
            </span>
            Mon profil
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">

          {/* Sidebar */}
          <aside className="h-fit rounded-[28px] border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-6">
            <div className="px-3 pb-3 pt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Réglages
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Votre espace
              </p>
            </div>

            <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              <a
                href="#compte"
                className="group flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm dark:bg-zinc-900">
                  👤
                </span>
                <span>Compte</span>
              </a>

              <a
                href="#preferences"
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-base transition group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-900">
                  ⚙️
                </span>
                <span>Préférences</span>
              </a>

              <a
                href="#apparence"
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-base transition group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-900">
                  🎨
                </span>
                <span>Apparence</span>
              </a>

              <a
                href="#securite"
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-base transition group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-900">
                  🔐
                </span>
                <span>Sécurité</span>
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
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
                  className="rounded-2xl border border-zinc-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-zinc-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
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
                      Langue principale de l&apos;interface.
                    </p>
                  </div>

                  <select
                    value={language}
                    onChange={(event) =>
                      changeLanguage(event.target.value)
                    }
                    id="language-setting" aria-label="Langue de l’interface" className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
                        ? "bg-blue-600"
                        : "bg-zinc-300 dark:bg-zinc-700",
                    ].join(" ")}
                    aria-label="Activer ou désactiver les notifications"
                    aria-pressed={notifications}
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  Apparence
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Personnalisez l&apos;interface
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
                      aria-pressed={active}
                      className={[
                        "group relative overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300",
                        active
                          ? "border-blue-400 bg-blue-50 shadow-[0_12px_30px_rgba(79,70,229,0.10)] ring-4 ring-blue-50 dark:border-blue-600 dark:bg-blue-950/50 dark:ring-blue-950"
                          : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/30",
                      ].join(" ")}
                    >
                      {active && (
                        <span
                          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-sm"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}

                      <div
                        className={[
                          "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all duration-300",
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-zinc-100 text-zinc-500 group-hover:scale-105 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-300",
                        ].join(" ")}
                      >
                        {item.icon}
                      </div>

                      <h3 className="mt-4 font-black tracking-tight text-zinc-950 dark:text-zinc-100">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                        {item.text}
                      </p>

                      <p
                        className={[
                          "mt-4 text-[10px] font-black uppercase tracking-[0.16em]",
                          active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-400 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400",
                        ].join(" ")}
                      >
                        {active ? "Sélectionné" : "Choisir ce thème"}
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  Sécurité
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Sécurité du compte
                </h2>
              </div>

              <div className="space-y-4">

                {/* Password */}
                <div className="group flex flex-col gap-5 rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm dark:bg-zinc-900">
                      🔑
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black tracking-tight text-zinc-950 dark:text-zinc-100">
                          Mot de passe
                        </h3>

                        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          À venir
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        La gestion avancée du mot de passe sera ajoutée dans la prochaine étape sécurité.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600 sm:w-auto"
                  >
                    Bientôt
                  </button>
                </div>

                {/* Sign out */}
                <div className="group flex flex-col gap-5 rounded-[24px] border border-red-100 bg-red-50/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md dark:border-red-950 dark:bg-red-950/20 dark:hover:border-red-900 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm dark:bg-zinc-900">
                      🚪
                    </div>

                    <div>
                      <h3 className="font-black tracking-tight text-red-700 dark:text-red-400">
                        Déconnexion
                      </h3>

                      <p className="mt-1.5 text-sm leading-6 text-red-600/70 dark:text-red-400/70">
                        Fermer la session Event Studio sur cet appareil.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md sm:w-auto"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="overflow-hidden rounded-[28px] bg-zinc-950 p-6 text-white shadow-xl dark:bg-black sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg">
                      ✓
                    </div>

                    <div>
                      <h2 className="font-black tracking-tight">
                        Préférences Event Studio
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Vos préférences locales sont conservées sur cet appareil.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                  {message && (
                    <span role="status" aria-live="polite" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-blue-200">
                      <span aria-hidden="true">✓</span>
                      {message}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    aria-busy={saving}
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-black shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
      </div>
    </main>
  );
}
