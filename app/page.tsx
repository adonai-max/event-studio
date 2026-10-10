"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-[#101a2e]">
      <section className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-40 -top-36 h-[34rem] w-[34rem] rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -left-48 top-64 h-[28rem] w-[28rem] rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-white" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[0.94fr_1.06fr] lg:gap-12 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-blue-800 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(66,99,235,0.12)]" />
              L’atelier de vos événements
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-[-0.055em] text-[#101a2e] sm:text-5xl lg:text-[4.25rem]">
              Chaque événement mérite{" "}
              <span className="bg-gradient-to-r from-[#4263eb] via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                sa signature.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Créez des invitations digitales élégantes, rassemblez vos invités
              et gardez le contrôle des réponses depuis un espace unique.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/events/new")}
                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-[#4263eb] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(66,99,235,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-[0_16px_34px_rgba(66,99,235,0.32)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Créer mon événement
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/events/demo")}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                  <path d="m9 5 10 7-10 7V5Z" strokeLinejoin="round" />
                </svg>
                Explorer la démo
              </button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2"><CheckIcon /> Invitations personnalisées</span>
              <span className="inline-flex items-center gap-2"><CheckIcon /> Suivi des réponses RSVP</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-white/20 to-cyan-100/70 blur-2xl" />
            <div className="relative rounded-[1.8rem] border border-white/90 bg-white/90 p-2.5 shadow-[0_32px_90px_rgba(16,26,46,0.16)] ring-1 ring-slate-200/70 backdrop-blur sm:rounded-[2rem] sm:p-3.5">
              <div className="overflow-hidden rounded-[1.3rem] border border-slate-200 bg-[#f7f9fd] sm:rounded-[1.5rem]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4263eb] text-[10px] font-black text-white shadow-sm">ES</div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Event Studio</p>
                      <p className="text-[10px] text-slate-500">Centre de pilotage</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Espace organisé</span>
                </div>

                <div className="grid min-h-[330px] sm:min-h-[385px] sm:grid-cols-[132px_1fr]">
                  <aside className="hidden border-r border-slate-200 bg-white p-3 sm:block">
                    <p className="px-2 pb-3 pt-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Espace</p>
                    <div className="space-y-1">
                      <MockNav active label="Vue d’ensemble" icon="▦" />
                      <MockNav label="Mes événements" icon="◇" />
                      <MockNav label="Invités" icon="♧" />
                      <MockNav label="Invitations" icon="▤" />
                      <MockNav label="Event Control" icon="⌗" />
                    </div>
                    <div className="mt-8 rounded-xl bg-blue-50 p-3">
                      <div className="mb-2 h-1.5 w-12 rounded-full bg-blue-200" />
                      <div className="h-1.5 w-16 rounded-full bg-blue-100" />
                      <div className="mt-3 h-1.5 w-10 rounded-full bg-blue-100" />
                    </div>
                  </aside>

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Votre espace événementiel</p>
                        <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Tout est sous contrôle.</h2>
                        <p className="mt-1 text-[11px] text-slate-500">Vos événements, réunis au même endroit.</p>
                      </div>
                      <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm sm:flex">✦</div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                      <MetricCard label="Événements" value="01" icon="◇" tint="blue" />
                      <MetricCard label="Invitations" value="Prêtes" icon="▤" tint="violet" />
                      <MetricCard label="Invités" value="Suivis" icon="♧" tint="cyan" />
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-900">Un événement à votre image</p>
                          <p className="mt-1 text-[10px] text-slate-500">Invitation digitale personnalisée</p>
                        </div>
                        <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">APERÇU</span>
                      </div>
                      <div className="mt-3 overflow-hidden rounded-xl bg-gradient-to-br from-[#101a2e] via-[#1e3a8a] to-[#4263eb] p-4 text-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-200">Vous êtes invités</p>
                            <p className="mt-2 text-lg font-black leading-tight sm:text-xl">Un moment<br />qui compte.</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl">✦</div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[9px] text-blue-100">
                          <span>Un design unique</span><span>Une expérience simple ↗</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-xs text-emerald-700">✓</div>
                      <p className="text-[10px] font-medium text-slate-600">Invitations, réponses et accès : une gestion centralisée.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_14px_38px_rgba(16,26,46,0.13)] sm:flex lg:-left-7">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckIcon /></div>
              <div><p className="text-xs font-extrabold text-slate-900">Simple à piloter</p><p className="mt-0.5 text-[10px] text-slate-500">Du premier clic au jour J</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="border-y border-slate-200/80 bg-white/75">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Marque ton événement</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#101a2e] sm:text-4xl">L’essentiel, sans la complexité.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Une expérience fluide pour concevoir vos invitations et organiser vos invités avec confiance.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Feature icon="✦" number="01" title="Créez à votre image" description="Composez une invitation soignée et personnalisez les informations importantes de votre événement." />
            <Feature icon="♧" number="02" title="Invitez en toute simplicité" description="Centralisez vos invités et partagez votre invitation digitale facilement." />
            <Feature icon="⌗" number="03" title="Gardez le contrôle" description="Suivez les réponses RSVP et préparez l’accueil de vos invités depuis Event Control." />
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Comment ça marche</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#101a2e] sm:text-4xl">De l’idée au jour J, en quelques étapes.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">Moins de dispersion, plus de sérénité. Event Studio vous accompagne à chaque étape de l’organisation.</p>
            <button type="button" onClick={() => router.push("/events/new")} className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-blue-700 transition hover:gap-3">Lancer mon événement <span aria-hidden="true">→</span></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Step number="01" title="Créez" description="Renseignez les informations de votre événement." />
            <Step number="02" title="Personnalisez" description="Donnez à votre invitation le style qui vous ressemble." />
            <Step number="03" title="Partagez" description="Invitez vos proches et suivez leurs réponses." />
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#101a2e] px-6 py-10 text-center shadow-[0_24px_60px_rgba(16,26,46,0.18)] sm:px-12 sm:py-14">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.2em] text-blue-300">Event Studio</p>
          <h2 className="relative mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Prêt à marquer ton événement ?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Commencez à créer une expérience mémorable pour vos invités.</p>
          <button type="button" onClick={() => router.push("/events/new")} className="relative mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#101a2e] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50">Créer mon événement <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div><p className="text-sm font-black tracking-tight text-[#101a2e]">Event <span className="text-blue-600">Studio</span></p><p className="mt-1 text-xs text-slate-500">Marque ton événement.</p></div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Event Studio. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
      <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MockNav({ label, icon, active = false }: { label: string; icon: string; active?: boolean }) {
  return <div className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[9px] font-bold ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"}`}><span className="text-xs">{icon}</span><span>{label}</span></div>;
}

function MetricCard({ label, value, icon, tint }: { label: string; value: string; icon: string; tint: "blue" | "violet" | "cyan" }) {
  const tintClass = tint === "blue" ? "bg-blue-50 text-blue-700" : tint === "violet" ? "bg-violet-50 text-violet-700" : "bg-cyan-50 text-cyan-700";
  return <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3"><div className={`mb-3 flex h-7 w-7 items-center justify-center rounded-lg text-xs ${tintClass}`}>{icon}</div><p className="truncate text-[9px] font-medium text-slate-500">{label}</p><p className="mt-1 truncate text-xs font-black text-slate-900 sm:text-sm">{value}</p></div>;
}

function Feature({ icon, number, title, description }: { icon: string; number: string; title: string; description: string }) {
  return <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgba(16,26,46,0.025)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(16,26,46,0.08)] sm:p-7"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">{icon}</span><span className="text-xs font-extrabold tracking-[0.15em] text-slate-300">{number}</span></div><h3 className="mt-6 text-lg font-extrabold tracking-tight text-slate-900">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{description}</p></article>;
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-black tracking-[0.18em] text-blue-700">{number}</p><h3 className="mt-4 text-base font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>;
}
