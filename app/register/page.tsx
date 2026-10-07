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
    <main className="auth-shell flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-orb-one" aria-hidden="true" />
      <div className="auth-orb-two" aria-hidden="true" />
      <div className="auth-card w-full max-w-md rounded-3xl p-8">
        <div className="mb-8">
          <p className="auth-brand rounded-full px-3 py-1 text-sm font-black uppercase tracking-widest text-sky-600">
            Event Studio
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Créer un compte
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Créez votre espace organisateur.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form space-y-5">
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
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
            <div className="rounded-xl bg-sky-50 p-4 text-sm text-sky-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Vous avez déjà un compte ?
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="ml-1 font-semibold text-sky-600 hover:text-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>

      <style jsx>{`
        .auth-shell {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 15% 20%, rgba(56,189,248,.16), transparent 28%),
            radial-gradient(circle at 85% 80%, rgba(37,99,235,.20), transparent 30%),
            linear-gradient(135deg,#020617 0%,#07152d 48%,#0b2a55 100%);
        }

        .auth-grid {
          position: absolute;
          inset: 0;
          opacity: .16;
          background-image:
            linear-gradient(rgba(125,211,252,.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125,211,252,.14) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }

        .auth-orb-one,
        .auth-orb-two {
          position: absolute;
          border-radius: 9999px;
          filter: blur(2px);
          pointer-events: none;
        }

        .auth-orb-one {
          width: 280px;
          height: 280px;
          top: -110px;
          left: -90px;
          background: radial-gradient(circle, rgba(56,189,248,.30), transparent 68%);
          animation: authOrbOne 9s ease-in-out infinite;
        }

        .auth-orb-two {
          width: 360px;
          height: 360px;
          right: -130px;
          bottom: -150px;
          background: radial-gradient(circle, rgba(37,99,235,.32), transparent 68%);
          animation: authOrbTwo 11s ease-in-out infinite;
        }

        .auth-card {
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255,255,255,.16);
          background: linear-gradient(145deg, rgba(255,255,255,.97), rgba(248,250,252,.94));
          box-shadow:
            0 30px 80px rgba(0,0,0,.38),
            0 0 0 1px rgba(125,211,252,.06),
            inset 0 1px 0 rgba(255,255,255,.9);
          backdrop-filter: blur(24px);
          animation: authReveal .75s cubic-bezier(.22,1,.36,1) both;
        }

        .auth-brand {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(14,165,233,.16);
          background: linear-gradient(135deg, rgba(14,165,233,.08), rgba(37,99,235,.04));
          box-shadow: 0 8px 24px rgba(14,165,233,.08);
        }

        .auth-form > div {
          animation: authField .6s cubic-bezier(.22,1,.36,1) both;
        }

        .auth-form > div:nth-child(1) { animation-delay: .08s; }
        .auth-form > div:nth-child(2) { animation-delay: .14s; }
        .auth-form > div:nth-child(3) { animation-delay: .20s; }
        .auth-form > div:nth-child(4) { animation-delay: .26s; }
        .auth-form > div:nth-child(5) { animation-delay: .32s; }

        @keyframes authReveal {
          from {
            opacity: 0;
            transform: translateY(22px) scale(.975);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes authField {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes authOrbOne {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(45px,28px,0) scale(1.12);
          }
        }

        @keyframes authOrbTwo {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(-35px,-25px,0) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-card,
          .auth-form > div,
          .auth-orb-one,
          .auth-orb-two {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
