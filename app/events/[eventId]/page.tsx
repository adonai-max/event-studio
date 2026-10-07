"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import EventNavigation from "@/app/components/EventNavigation";

type EventItem = {
  id: string;
  name: string;
  type: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
};


const pageIcons = {
  type: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16M6.5 4v4.5M17.5 4v4.5M6 10.5h12M6 14h5M6 17.5h8" /></svg>,
  date: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" /><path d="M7.5 13h.01M12 13h.01M16.5 13h.01M7.5 16.5h.01M12 16.5h.01" /></svg>,
  time: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5l3.5 2" /></svg>,
  location: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10.5c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10.5" r="2.3" /></svg>,
  invitation: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v10A1.5 1.5 0 0 1 20 18.5H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5Z" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>,
  guests: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="8" r="3" /><path d="M3 19.5a5.5 5.5 0 0 1 11 0" /><circle cx="17.2" cy="9" r="2.4" /><path d="M14.7 19.5a4.1 4.1 0 0 1 6.1-3.55" /></svg>,
  control: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 8h10M7 12h10M7 16h6" /><circle cx="17" cy="16" r="1.6" /></svg>,
  edit: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17.5-.8 3.3 3.3-.8L18.2 8.3a2.4 2.4 0 0 0-3.4-3.4L3.1 16.9Z" /><path d="m13.5 6.5 4 4" /></svg>,
};

const details = (event: EventItem) => [
  { label: "Type", value: event.type || "Événement", icon: pageIcons.type, tone: "sky" },
  { label: "Date", value: event.date || "Non définie", icon: pageIcons.date, tone: "violet" },
  { label: "Heure", value: event.time || "Non définie", icon: pageIcons.time, tone: "amber" },
  { label: "Lieu", value: event.location || "Non défini", icon: pageIcons.location, tone: "emerald" },
];

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = String(params.eventId);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("id, name, type, date, time, location, description")
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (error || !data) {
        console.error("❌ Erreur chargement événement :", error);
        setErrorMessage(
          "Événement introuvable ou vous n'avez pas accès à cet événement.",
        );
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    if (eventId) loadEvent();
  }, [eventId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_10%_5%,rgba(14,165,233,.14),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(99,102,241,.12),transparent_30%),#f7f9fc]">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="h-16 animate-pulse rounded-2xl bg-white/80 shadow-sm" />
          <div className="mt-6 h-[360px] animate-pulse rounded-[32px] bg-white shadow-[0_24px_70px_rgba(15,23,42,.06)]" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-52 animate-pulse rounded-[28px] bg-white" />
            <div className="h-52 animate-pulse rounded-[28px] bg-white" />
            <div className="h-52 animate-pulse rounded-[28px] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">!</div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">Événement indisponible</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{errorMessage || "Impossible de charger cet événement."}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            ← Retour au Dashboard
          </button>
        </div>
      </main>
    );
  }

  const eventDetails = details(event);
  const eventInitials =
    event.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "ES";

  return (
    <main className="event-page-motion min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_5%,rgba(14,165,233,.15),transparent_27%),radial-gradient(circle_at_92%_10%,rgba(99,102,241,.14),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f7f8fc_48%,#f8fafc_100%)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="overview-orb overview-orb-one" />
        <div className="overview-orb overview-orb-two" />
        <div className="overview-grid" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <EventNavigation eventId={event.id} eventName={event.name} />

        <section className="overview-hero event-motion-card relative mt-6 overflow-hidden rounded-[32px] border border-white/80 bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,23,42,.20)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(56,189,248,.24),transparent_26%),radial-gradient(circle_at_72%_100%,rgba(99,102,241,.28),transparent_34%),linear-gradient(115deg,#020617,#0f172a_48%,#111827)]" />
          <div className="overview-sheen pointer-events-none absolute -inset-y-20 -left-1/3 w-1/3 rotate-12 bg-white/10 blur-2xl" />
          <div className="relative grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_300px] lg:p-11">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-sky-200">
                  {event.type || "Événement"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3.5 py-1.5 text-[10px] font-black text-emerald-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
                  Espace actif
                </span>
              </div>

              <p className="mt-8 text-[10px] font-black uppercase tracking-[.24em] text-slate-400">Centre de pilotage</p>
              <h1 className="mt-2 max-w-4xl text-4xl font-black tracking-[-.045em] sm:text-6xl">
                {event.name}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Tout votre événement, au même endroit. Préparez l'expérience, organisez vos invités et gardez le contrôle jusqu'à l'entrée.
              </p>

              <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
                {[
                  { label: "Date", value: event.date || "À définir", icon: pageIcons.date },
                  { label: "Heure", value: event.time || "À définir", icon: pageIcons.time },
                  { label: "Lieu", value: event.location || "À définir", icon: pageIcons.location },
                ].map((item) => (
                  <div key={item.label} className="overview-glass event-motion-interactive rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3.5 backdrop-blur-md">
                    <p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">{item.label}</p>
                    <p className="mt-1.5 truncate text-sm font-bold text-white">{item.icon} {item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-command-panel flex flex-col justify-between gap-6 rounded-[28px] border border-white/10 bg-white/[.06] p-5 backdrop-blur-xl">
              <div>
                <div className="overview-command-visual">
                  <div className="overview-command-ring overview-command-ring-one" />
                  <div className="overview-command-ring overview-command-ring-two" />
                  <span>{eventInitials}</span>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400">Espace événement</p>
                </div>
                <h2 className="mt-3 text-xl font-black">Votre événement prend forme</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Construisez l'expérience de vos invités, de la première invitation jusqu'au contrôle d'accès.
                </p>
              </div>
              <button
                onClick={() => router.push("/events/" + event.id + "/edit")}
                className="event-motion-interactive group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl transition hover:bg-sky-50"
              >
                Modifier l'événement
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </section>

        <section className="overview-focus-strip event-motion-card mt-7 overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/85 shadow-[0_16px_45px_rgba(15,23,42,.055)] backdrop-blur">
          <div className="px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="overview-focus-mark">✦</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-sky-600">Fil conducteur</p>
                  <p className="mt-0.5 text-sm font-black text-slate-800">Un parcours pensé pour avancer sans friction</p>
                </div>
              </div>
              <div className="overview-steps" aria-label="Parcours Event Studio">
                <div className="overview-step overview-step-active"><span>01</span><b>Créez</b></div>
                <i />
                <div className="overview-step"><span>02</span><b>Organisez</b></div>
                <i />
                <div className="overview-step"><span>03</span><b>Contrôlez</b></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-sky-600">Parcours Event Studio</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-.025em] text-slate-950">Pilotez votre événement</h2>
            </div>
            <span className="hidden text-xs font-semibold text-slate-400 sm:block">3 espaces · 1 événement</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <button onClick={() => router.push("/events/" + event.id + "/invitation")} className="overview-action event-motion-card event-motion-interactive group text-left">
              <div className="overview-action-top">
                <span className="overview-icon overview-icon-sky">{pageIcons.invitation}</span>
                <span className="overview-number">01</span>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-sky-600">Création</p>
                <h3 className="mt-1.5 text-2xl font-black text-slate-950">Invitation</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Créez l'univers visuel de votre événement et préparez l'expérience RSVP.</p>
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black text-slate-400">
                <span>Ouvrir l'espace</span>
                <span className="text-lg transition-transform group-hover:translate-x-1 group-hover:text-sky-600">→</span>
              </div>
            </button>

            <button onClick={() => router.push("/events/" + event.id + "/guests")} className="overview-action event-motion-card event-motion-interactive group text-left">
              <div className="overview-action-top">
                <span className="overview-icon overview-icon-violet">{pageIcons.guests}</span>
                <span className="overview-number">02</span>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-600">Organisation</p>
                <h3 className="mt-1.5 text-2xl font-black text-slate-950">Invités</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Centralisez les invités, les couples, les confirmations et les réponses RSVP.</p>
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black text-slate-400">
                <span>Gérer les invités</span>
                <span className="text-lg transition-transform group-hover:translate-x-1 group-hover:text-violet-600">→</span>
              </div>
            </button>

            <button onClick={() => router.push("/events/" + event.id + "/control")} className="overview-action event-motion-card event-motion-interactive group text-left">
              <div className="overview-action-top">
                <span className="overview-icon overview-icon-emerald">{pageIcons.control}</span>
                <span className="overview-number">03</span>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-600">Contrôle</p>
                <h3 className="mt-1.5 text-2xl font-black text-slate-950">Event Control</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Scannez les QR codes, validez les entrées et gardez une vision en temps réel.</p>
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black text-slate-400">
                <span>Accéder au contrôle</span>
                <span className="text-lg transition-transform group-hover:translate-x-1 group-hover:text-emerald-600">→</span>
              </div>
            </button>
          </div>
        </section>

        <section className="event-motion-card mt-8 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,.07)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-sky-600">Vue d'ensemble</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-.025em] text-slate-950">Les informations essentielles</h2>
            </div>
            <button
              onClick={() => router.push("/events/" + event.id + "/edit")}
              className="event-motion-interactive rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-black text-slate-600 hover:border-slate-300 hover:text-slate-950"
            >
              Modifier
            </button>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            {eventDetails.map((item) => (
              <div key={item.label} className="overview-detail event-motion-interactive rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="overview-detail-icon">{item.icon}</span>
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <p className="mt-6 text-[9px] font-black uppercase tracking-[.18em] text-slate-400">{item.label}</p>
                <p className="mt-1.5 truncate text-sm font-black text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,#f8fafc,#f0f9ff)] p-5 sm:mx-6 sm:mb-6 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="description-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">{pageIcons.edit}</div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">Description</p>
                <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">
                  {event.description || "Aucune description n'a encore été ajoutée à cet événement."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-xs font-medium text-slate-400">
            Event Studio <span className="mx-1.5 text-slate-300">•</span> Centre de pilotage
          </p>
          <button onClick={() => router.push("/dashboard")} className="text-xs font-black text-slate-500 transition hover:text-sky-700">
            ← Retour au Dashboard
          </button>
        </footer>
      </div>

      <style jsx>{`
        .overview-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          opacity: .42;
        }
        .overview-orb-one {
          top: 18%;
          left: -90px;
          width: 240px;
          height: 240px;
          background: rgba(14,165,233,.14);
          animation: overviewFloat 10s ease-in-out infinite;
        }
        .overview-orb-two {
          top: 52%;
          right: -110px;
          width: 280px;
          height: 280px;
          background: rgba(99,102,241,.12);
          animation: overviewFloat 13s ease-in-out infinite reverse;
        }
        .overview-grid {
          position: absolute;
          inset: 0;
          opacity: .18;
          background-image: linear-gradient(rgba(148,163,184,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.12) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black, transparent 65%);
        }
        .overview-sheen {
          animation: overviewSheen 8s ease-in-out infinite;
        }
.overview-command-panel {
          position: relative;
        }
        .overview-command-visual {
          position: relative;
          display: flex;
          width: 132px;
          height: 132px;
          align-items: center;
          justify-content: center;
          margin: 2px auto 0;
          overflow: hidden;
          border-radius: 38px;
          border: 1px solid rgba(125,211,252,.18);
          background: radial-gradient(circle at 50% 35%,rgba(56,189,248,.22),transparent 42%),rgba(2,6,23,.34);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 18px 45px rgba(0,0,0,.16);
        }
        .overview-command-visual span {
          position: relative;
          z-index: 2;
          font-size: 31px;
          font-weight: 950;
          letter-spacing: -.06em;
          color: #fff;
          text-shadow: 0 0 28px rgba(56,189,248,.35);
        }
        .overview-command-ring {
          position: absolute;
          border: 1px solid rgba(125,211,252,.18);
          border-radius: 9999px;
        }
        .overview-command-ring-one {
          inset: 14px;
          animation: overviewRing 8s linear infinite;
        }
        .overview-command-ring-two {
          inset: 30px;
          border-color: rgba(129,140,248,.22);
          animation: overviewRing 6s linear infinite reverse;
        }
        .overview-focus-strip {
          transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
        }
        .overview-focus-mark {
          display:flex;
          width:42px;
          height:42px;
          flex:0 0 auto;
          align-items:center;
          justify-content:center;
          border-radius:14px;
          color:#fff;
          background:linear-gradient(135deg,#0f172a,#334155);
          box-shadow:0 10px 22px rgba(15,23,42,.16);
          animation:focusMarkPulse 3.5s ease-in-out infinite;
        }
        .overview-steps {
          display:flex;
          align-items:center;
          gap:.55rem;
        }
        .overview-steps i {
          width:34px;
          height:1px;
          background:linear-gradient(90deg,#bae6fd,#cbd5e1);
        }
        .overview-step {
          display:flex;
          align-items:center;
          gap:.5rem;
          padding:.45rem .65rem;
          border-radius:999px;
          color:#94a3b8;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          transition:transform .25s ease,border-color .25s ease,background .25s ease;
        }
        .overview-step span {
          display:flex;
          width:22px;
          height:22px;
          align-items:center;
          justify-content:center;
          border-radius:999px;
          font-size:8px;
          font-weight:900;
          background:#e2e8f0;
          color:#64748b;
        }
        .overview-step b {
          font-size:9px;
          text-transform:uppercase;
          letter-spacing:.12em;
        }
        .overview-step-active {
          color:#1d4ed8;
          background:#eff8ff;
          border-color:#bae6fd;
          box-shadow:0 8px 20px rgba(37,99,235,.08);
        }
        .overview-step-active span {
          color:#fff;
          background:linear-gradient(135deg,#0ea5e9,#2563eb);
        }
        .overview-step:hover { transform:translateY(-2px); border-color:#93c5fd; }
        .overview-focus-strip:hover {
          transform: translateY(-2px);
          border-color: rgba(125,211,252,.45);
          box-shadow: 0 18px 45px rgba(15,23,42,.08);
        }
        .overview-glass {
          transition: transform .25s ease, background .25s ease, border-color .25s ease;
        }
        .overview-glass:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,.10);
          border-color: rgba(255,255,255,.18);
        }
        .overview-action {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          border: 1px solid rgba(226,232,240,.9);
          background: rgba(255,255,255,.94);
          padding: 26px;
          box-shadow: 0 14px 40px rgba(15,23,42,.06);
          transition: transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease, border-color .28s ease;
        }
        .overview-action::after {
          content: "";
          position: absolute;
          inset: auto -30% -70% 30%;
          height: 170px;
          border-radius: 9999px;
          background: rgba(14,165,233,.06);
          filter: blur(35px);
          transition: transform .4s ease;
        }
        .overview-action:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 55px rgba(15,23,42,.11);
          border-color: rgba(148,163,184,.8);
        }
        .overview-action:hover::after {
          transform: translate(-18px,-18px);
        }
        .overview-action-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .overview-icon {
          display: flex;
          width: 52px;
          height: 52px;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.75), 0 8px 18px rgba(15,23,42,.06);
          transition: transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s ease;
        }
        .overview-icon svg { width:25px; height:25px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
        .overview-icon-sky { color:#0284c7; background:linear-gradient(145deg,#eff6ff,#e0f2fe); box-shadow:inset 0 0 0 1px rgba(125,211,252,.55),0 10px 22px rgba(14,165,233,.12); }
        .overview-icon-violet { color:#7c3aed; background:linear-gradient(145deg,#f5f3ff,#ede9fe); box-shadow:inset 0 0 0 1px rgba(196,181,253,.6),0 10px 22px rgba(124,58,237,.11); }
        .overview-icon-emerald { color:#059669; background:linear-gradient(145deg,#ecfdf5,#d1fae5); box-shadow:inset 0 0 0 1px rgba(110,231,183,.6),0 10px 22px rgba(5,150,105,.11); }
        .overview-action:hover .overview-icon {
          transform: translateY(-4px) rotate(-2deg) scale(1.06);
          box-shadow: 0 14px 28px rgba(15,23,42,.12), inset 0 0 0 1px rgba(255,255,255,.8);
        }
        .overview-number {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .2em;
          color: #cbd5e1;
        }
        .overview-detail {
          position:relative;
          overflow:hidden;
          transition: transform .28s cubic-bezier(.22,1,.36,1), border-color .25s ease, background .25s ease, box-shadow .28s ease;
        }
        .overview-detail::after{content:"";position:absolute;inset:auto -25% -65% 35%;height:110px;border-radius:999px;background:rgba(56,189,248,.06);filter:blur(24px);transition:transform .4s ease}
        .overview-detail-icon{position:relative;z-index:1;display:flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:11px;background:#fff;color:#475569;box-shadow:0 5px 12px rgba(15,23,42,.06),inset 0 0 0 1px rgba(226,232,240,.8)}
        .overview-detail-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .description-icon{color:#2563eb}
        .description-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
        .overview-detail:hover {
          transform: translateY(-4px);
          border-color: #cbd5e1;
          background: white;
          box-shadow:0 14px 28px rgba(15,23,42,.07);
        }
        .overview-detail:hover::after{transform:translate(-16px,-10px)}
        @keyframes overviewFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-18px,0) scale(1.04); }
        }
        @keyframes overviewSheen {
          0%, 45% { transform: translateX(-120%) rotate(12deg); opacity: 0; }
          55% { opacity: .75; }
          75%, 100% { transform: translateX(520%) rotate(12deg); opacity: 0; }
        }
        @keyframes overviewRing {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes focusMarkPulse {
          0%,100% { box-shadow:0 10px 22px rgba(15,23,42,.16); transform:translateY(0); }
          50% { box-shadow:0 14px 28px rgba(37,99,235,.18); transform:translateY(-2px); }
        }
        @media (max-width: 767px) {
          .overview-steps { width:100%; justify-content:space-between; gap:.35rem; }
          .overview-steps i { flex:1; min-width:10px; }
          .overview-step { padding:.4rem .5rem; }
          .overview-step b { font-size:8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .overview-orb, .overview-sheen, .overview-command-ring-one, .overview-command-ring-two, .overview-focus-mark { animation:none; }
          .overview-action, .overview-icon, .overview-detail, .overview-glass, .overview-focus-strip, .overview-step { transition:none; }
        }
      `}</style>
    </main>
  );
}
