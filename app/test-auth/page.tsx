"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserInfo = {
  id: string;
  email: string | null;
};

export default function TestAuthPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError("Aucun utilisateur connecté.");
        setLoading(false);
        return;
      }

      setUser({
        id: user.id,
        email: user.email ?? null,
      });

      setLoading(false);
    }

    void getUser();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-600">
          Event Studio
        </p>

        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Test d’authentification
        </h1>

        {loading && (
          <div className="mt-6 rounded-2xl bg-zinc-100 p-5">
            <p className="text-zinc-700">
              Vérification de l’utilisateur...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              ❌ {error}
            </p>
          </div>
        )}

        {user && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-green-50 p-5">
              <p className="font-semibold text-green-700">
                🟢 Utilisateur authentifié
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5">
              <p className="text-sm font-medium text-zinc-500">
                Auth User ID / auth.uid()
              </p>

              <p className="mt-2 break-all font-mono text-sm text-zinc-900">
                {user.id}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5">
              <p className="text-sm font-medium text-zinc-500">
                Adresse e-mail
              </p>

              <p className="mt-2 text-zinc-900">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
