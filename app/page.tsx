"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push("/events/new");
  };

  const handleDemo = () => {
    router.push("/events/demo");
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="text-2xl font-bold tracking-tight">
          Event<span className="text-indigo-600">Studio</span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#fonctionnalites" className="hover:text-indigo-600">
            Fonctionnalités
          </a>

          <a href="#comment-ca-marche" className="hover:text-indigo-600">
            Comment ça marche
          </a>

          <button
            type="button"
            onClick={handleDemo}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-white transition hover:bg-zinc-700"
          >
            Connexion
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            ✨ Vos événements, votre style
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Créez des invitations
            <span className="block text-indigo-600">
              qui marquent les esprits.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Event Studio vous permet de créer, personnaliser et gérer
            facilement des invitations digitales élégantes pour vos événements.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={handleCreateEvent}
              className="rounded-full bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-indigo-700"
            >
              Créer mon événement
            </button>

            <button
              type="button"
              onClick={handleDemo}
              className="rounded-full border border-zinc-300 px-7 py-3.5 font-semibold transition hover:bg-zinc-50"
            >
              Voir une démo
            </button>
          </div>
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="border-y border-zinc-200 bg-zinc-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-semibold text-indigo-600">FONCTIONNALITÉS</p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce qu'il faut pour gérer vos invitations.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Feature
              title="Création"
              description="Créez rapidement une invitation adaptée à votre événement."
            />

            <Feature
              title="Personnalisation"
              description="Adaptez les textes, visuels et informations selon vos besoins."
            />

            <Feature
              title="Gestion"
              description="Suivez vos invités et centralisez les réponses RSVP."
            />
          </div>
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="grid gap-12 md:grid-cols-3">
          <Step number="01" title="Créez votre événement" />
          <Step number="02" title="Personnalisez votre invitation" />
          <Step number="03" title="Invitez et suivez les réponses" />
        </div>
      </section>

      <footer className="border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Event Studio. Tous droits réservés.
      </footer>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
        ✓
      </div>

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-zinc-600">{description}</p>
    </div>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-indigo-600">{number}</p>

      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
    </div>
  );
}