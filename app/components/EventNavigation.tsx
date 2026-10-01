"use client";

import Link from "next/link";

export default function EventNavigation() {
  return (
    <nav className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">

      <Link
        href="/dashboard"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        ← Dashboard
      </Link>

      <Link
        href="/events/demo"
        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Événement
      </Link>

      <Link
        href="/events/demo/invitation"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        💌 Invitation
      </Link>

      <Link
        href="/events/demo/guests"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        👥 Invités
      </Link>

      <Link
        href="/events/demo/control"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        📊 Event Control
      </Link>

    </nav>
  );
}