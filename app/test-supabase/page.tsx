"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("Test de connexion...");
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .limit(1);

      if (error) {
        console.error("Erreur Supabase :", error);
        setStatus(`❌ Erreur : ${error.message}`);
        return;
      }

      setTables(data?.length ? ["events"] : []);
      setStatus("🟢 Connexion Supabase réussie !");
    }

    void testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-zinc-900">
          Test Supabase
        </h1>

        <p className="mt-4 text-lg font-semibold text-zinc-800">
          {status}
        </p>

        {tables.length > 0 && (
          <p className="mt-3 text-sm text-zinc-600">
            Table accessible : {tables.join(", ")}
          </p>
        )}
      </div>
    </main>
  );
}
