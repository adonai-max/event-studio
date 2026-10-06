"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: (firstName.trim() + " " + lastName.trim()).trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setError("Impossible de créer le compte.");
      setLoading(false);
      return;
    }

    setMessage(
      "Compte créé avec succès ! Votre espace organisateur est prêt.",
    );

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Event Studio
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Créer un compte
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Créez votre espace organisateur.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Nom complet
            </label>

            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Votre prénom"
              required
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-zinc-700">Nom</label>
            <input id="lastName" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Votre nom" required className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Adresse e-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.com"
              required
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Mot de passe
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 caractères"
              minLength={6}
              required
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Vous avez déjà un compte ?
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    </main>
  );
}
