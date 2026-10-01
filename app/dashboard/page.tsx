export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header>
          <p className="text-sm font-semibold text-indigo-600">
            EVENT STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>

          <p className="mt-3 text-zinc-600">
            Gérez vos événements, vos invitations et vos invités depuis un
            seul espace.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Événements</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Invités</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Réponses RSVP</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            Aucun événement pour le moment
          </h2>

          <p className="mx-auto mt-2 max-w-md text-zinc-500">
            Créez votre premier événement pour commencer à construire votre
            invitation.
          </p>

          <button className="mt-6 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700">
            Créer un événement
          </button>
        </section>
      </div>
    </main>
  );
}
