"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import EventNavigation from "@/app/components/EventNavigation";

type InvitationStyle =
  | "elegant"
  | "minimal"
  | "romantic"
  | "luxury"
  | "modern";

type InvitationLayout =
  | "classic"
  | "editorial"
  | "split"
  | "modern"
  | "romantic";

type TitleFont =
  | "serif"
  | "sans"
  | "display";

type BodyFont =
  | "serif"
  | "sans";

type InvitationBackground =
  | "color"
  | "gradient"
  | "image"
  | "texture";

type InvitationDensity =
  | "compact"
  | "balanced"
  | "airy";

type InvitationRadius =
  | "soft"
  | "elegant"
  | "square";

type InvitationDecoration =
  | "none"
  | "minimal"
  | "floral"
  | "geometric"
  | "romantic";

type InvitationPalette = {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

type InvitationDesign = {
  style: InvitationStyle;
  layout: InvitationLayout;
  palette: InvitationPalette;
  accentColor: string;
  titleFont: TitleFont;
  bodyFont: BodyFont;
  background: InvitationBackground;
  customBackgroundColor: string;
  density: InvitationDensity;
  radius: InvitationRadius;
  decoration: InvitationDecoration;
};

type EventData = {
  id: string;
  name: string;
  type: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  design: InvitationDesign;
};

const palettes: InvitationPalette[] = [
  {
    name: "Royal",
    primary: "#4f46e5",
    secondary: "#7c3aed",
    background: "#eef2ff",
    surface: "#ffffff",
    text: "#18181b",
    muted: "#71717a",
    border: "#c7d2fe",
  },
  {
    name: "Émeraude",
    primary: "#047857",
    secondary: "#059669",
    background: "#ecfdf5",
    surface: "#ffffff",
    text: "#17201b",
    muted: "#64756d",
    border: "#a7f3d0",
  },
  {
    name: "Bordeaux",
    primary: "#9f1239",
    secondary: "#be123c",
    background: "#fff1f2",
    surface: "#ffffff",
    text: "#3f1722",
    muted: "#7f5662",
    border: "#fecdd3",
  },
  {
    name: "Or & Ivoire",
    primary: "#a16207",
    secondary: "#ca8a04",
    background: "#fffbeb",
    surface: "#fffdf5",
    text: "#292524",
    muted: "#78716c",
    border: "#fde68a",
  },
  {
    name: "Champagne",
    primary: "#b08d57",
    secondary: "#d4af37",
    background: "#faf6ee",
    surface: "#fffdf8",
    text: "#29251f",
    muted: "#81766a",
    border: "#e8d7b7",
  },
  {
    name: "Rose poudré",
    primary: "#be185d",
    secondary: "#db2777",
    background: "#fdf2f8",
    surface: "#fffafd",
    text: "#3b1728",
    muted: "#86536b",
    border: "#fbcfe8",
  },
  {
    name: "Océan",
    primary: "#0369a1",
    secondary: "#0891b2",
    background: "#f0f9ff",
    surface: "#ffffff",
    text: "#082f49",
    muted: "#527187",
    border: "#bae6fd",
  },
  {
    name: "Terracotta",
    primary: "#c2410c",
    secondary: "#ea580c",
    background: "#fff7ed",
    surface: "#fffdfa",
    text: "#431407",
    muted: "#8a6354",
    border: "#fed7aa",
  },
  {
    name: "Noir Prestige",
    primary: "#d4af37",
    secondary: "#f1c453",
    background: "#09090b",
    surface: "#18181b",
    text: "#fafafa",
    muted: "#a1a1aa",
    border: "#52525b",
  },
];

const defaultDesign: InvitationDesign = {
  style: "elegant",
  layout: "classic",
  palette: palettes[0],
  accentColor: palettes[0].primary,
  titleFont: "serif",
  bodyFont: "sans",
  background: "color",
  customBackgroundColor: "#f8f5ed",
  density: "balanced",
  radius: "elegant",
  decoration: "minimal",
};

const styles: {
  name: string;
  value: InvitationStyle;
  description: string;
  icon: string;
}[] = [
  {
    name: "Élégant",
    value: "elegant",
    description: "Raffiné et intemporel",
    icon: "✦",
  },
  {
    name: "Minimaliste",
    value: "minimal",
    description: "Simple et épuré",
    icon: "○",
  },
  {
    name: "Romantique",
    value: "romantic",
    description: "Doux et chaleureux",
    icon: "♡",
  },
  {
    name: "Luxe",
    value: "luxury",
    description: "Prestige et contraste",
    icon: "◆",
  },
  {
    name: "Moderne",
    value: "modern",
    description: "Contemporain et dynamique",
    icon: "▰",
  },
];

const layouts: {
  name: string;
  value: InvitationLayout;
  description: string;
}[] = [
  {
    name: "Classique",
    value: "classic",
    description: "Centré, intemporel et cérémoniel",
  },
  {
    name: "Éditorial",
    value: "editorial",
    description: "Asymétrique, typographique et sophistiqué",
  },
  {
    name: "Split",
    value: "split",
    description: "Deux zones visuelles clairement séparées",
  },
  {
    name: "Moderne",
    value: "modern",
    description: "Géométrique, contemporain et dynamique",
  },
  {
    name: "Romantique",
    value: "romantic",
    description: "Expressif, doux et cérémoniel",
  },
];

const backgrounds: {
  name: string;
  value: InvitationBackground;
  preview: string;
}[] = [
  {
    name: "Couleur",
    value: "color",
    preview: "#f8f5ed",
  },
  {
    name: "Dégradé",
    value: "gradient",
    preview: "linear-gradient(135deg,#4f46e5,#db2777)",
  },
  {
    name: "Image",
    value: "image",
    preview: "linear-gradient(135deg,#d4af37,#f8f5ed)",
  },
  {
    name: "Texture",
    value: "texture",
    preview: "repeating-linear-gradient(45deg,#f8f5ed 0,#f8f5ed 8px,#eee5d5 8px,#eee5d5 16px)",
  },
];

const titleFonts: {
  name: string;
  value: TitleFont;
  previewClass: string;
}[] = [
  {
    name: "Classique",
    value: "serif",
    previewClass: "font-serif",
  },
  {
    name: "Moderne",
    value: "sans",
    previewClass: "font-sans",
  },
  {
    name: "Prestige",
    value: "display",
    previewClass: "font-semibold tracking-wide",
  },
];

const decorations: {
  name: string;
  value: InvitationDecoration;
  symbol: string;
}[] = [
  {
    name: "Aucune",
    value: "none",
    symbol: "—",
  },
  {
    name: "Minimal",
    value: "minimal",
    symbol: "✦",
  },
  {
    name: "Floral",
    value: "floral",
    symbol: "❋",
  },
  {
    name: "Géométrique",
    value: "geometric",
    symbol: "◆",
  },
  {
    name: "Romantique",
    value: "romantic",
    symbol: "♡",
  },
];

function normalizeDesign(value: unknown): InvitationDesign {
  if (!value || typeof value !== "object") {
    return defaultDesign;
  }

  const raw = value as Partial<InvitationDesign> & {
    background?: string;
    decoration?: string;
    layout?: string;
  };

  const palette =
    raw.palette &&
    typeof raw.palette === "object" &&
    typeof raw.palette.primary === "string"
      ? {
          ...defaultDesign.palette,
          ...raw.palette,
        }
      : defaultDesign.palette;

  const legacyLayoutMap: Record<string, InvitationLayout> = {
    classic: "classic",
    split: "split",
    modern: "modern",
    romantic: "romantic",
    editorial: "editorial",
  };

  const legacyBackgroundMap: Record<string, InvitationBackground> = {
    ivory: "color",
    white: "color",
    black: "color",
    beige: "color",
    lavender: "color",
    custom: "color",
    gradient: "gradient",
    night: "gradient",
    image: "image",
    texture: "texture",
  };

  const legacyDecorationMap: Record<string, InvitationDecoration> = {
    none: "none",
    sparkle: "minimal",
    minimal: "minimal",
    floral: "floral",
    geometric: "geometric",
    hearts: "romantic",
    romantic: "romantic",
  };

  const normalizedLayout =
    typeof raw.layout === "string" && legacyLayoutMap[raw.layout]
      ? legacyLayoutMap[raw.layout]
      : defaultDesign.layout;

  const normalizedBackground =
    typeof raw.background === "string" && legacyBackgroundMap[raw.background]
      ? legacyBackgroundMap[raw.background]
      : defaultDesign.background;

  const normalizedDecoration =
    typeof raw.decoration === "string" && legacyDecorationMap[raw.decoration]
      ? legacyDecorationMap[raw.decoration]
      : defaultDesign.decoration;

  return {
    style:
      raw.style &&
      ["elegant", "minimal", "romantic", "luxury", "modern"].includes(
        raw.style,
      )
        ? raw.style
        : defaultDesign.style,

    layout: normalizedLayout,

    palette,

    accentColor:
      typeof raw.accentColor === "string"
        ? raw.accentColor
        : palette.primary,

    titleFont:
      raw.titleFont &&
      ["serif", "sans", "display"].includes(raw.titleFont)
        ? raw.titleFont
        : defaultDesign.titleFont,

    bodyFont:
      raw.bodyFont &&
      ["serif", "sans"].includes(raw.bodyFont)
        ? raw.bodyFont
        : defaultDesign.bodyFont,

    background: normalizedBackground,

    customBackgroundColor:
      typeof raw.customBackgroundColor === "string"
        ? raw.customBackgroundColor
        : defaultDesign.customBackgroundColor,

    density:
      raw.density &&
      ["compact", "balanced", "airy"].includes(raw.density)
        ? raw.density
        : defaultDesign.density,

    radius:
      raw.radius &&
      ["soft", "elegant", "square"].includes(raw.radius)
        ? raw.radius
        : defaultDesign.radius,

    decoration: normalizedDecoration,
  };
}

function formatDate(date: string | null) {
  if (!date) return "Date à définir";

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function getTitleFontClass(font: TitleFont) {
  if (font === "sans") return "font-sans tracking-tight";
  if (font === "display") {
    return "font-semibold tracking-[0.04em]";
  }
  return "font-serif tracking-tight";
}

function getBodyFontClass(font: BodyFont) {
  return font === "serif" ? "font-serif" : "font-sans";
}

function getRadiusClass(radius: InvitationRadius) {
  if (radius === "soft") return "rounded-[2rem]";
  if (radius === "square") return "rounded-md";
  return "rounded-2xl";
}

function getDensityClasses(density: InvitationDensity) {
  if (density === "compact") {
    return {
      card: "p-5 sm:p-7",
      title: "mt-4",
      message: "mt-5",
      info: "mt-6",
      button: "mt-6",
    };
  }

  if (density === "airy") {
    return {
      card: "p-8 sm:p-12",
      title: "mt-7",
      message: "mt-9",
      info: "mt-10",
      button: "mt-10",
    };
  }

  return {
    card: "p-6 sm:p-10",
    title: "mt-5",
    message: "mt-7",
    info: "mt-8",
    button: "mt-8",
  };
}

function getBackgroundStyle(design: InvitationDesign) {
  const palette = design.palette;

  switch (design.background) {
    case "gradient":
      return {
        background: `linear-gradient(rgba(0,0,0,0.16), rgba(0,0,0,0.24)), linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 52%, ${palette.background} 100%)`,
        color: "#ffffff",
      };

    case "image":
      return {
        background: `linear-gradient(rgba(0,0,0,0.32), rgba(0,0,0,0.48)), linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 45%, ${palette.background} 100%)`,
        color: "#ffffff",
      };

    case "texture":
      return {
        background: `repeating-linear-gradient(45deg, ${palette.background} 0, ${palette.background} 10px, ${palette.border} 10px, ${palette.border} 11px)`,
        color: palette.text,
      };

    case "color":
    default:
      return {
        background: design.customBackgroundColor || palette.background,
        color: palette.text,
      };
  }
}

function getDecoration(
  decoration: InvitationDecoration,
) {
  switch (decoration) {
    case "minimal":
      return "✦";
    case "floral":
      return "❋";
    case "geometric":
      return "◆";
    case "romantic":
      return "♡";
    case "none":
    default:
      return "";
  }
}

export default function InvitationBuilderPage() {
  const params = useParams();
  const eventId = String(params.eventId);

  const [event, setEvent] =
    useState<EventData | null>(null);

  const [message, setMessage] = useState("");

  const [design, setDesign] =
    useState<InvitationDesign>(defaultDesign);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [messageStatus, setMessageStatus] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage(
          "Votre session a expiré. Veuillez vous reconnecter.",
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, name, type, date, time, location, description, design",
        )
        .eq("id", eventId)
        .eq("owner_id", user.id)
        .single();

      if (error || !data) {
        console.error(
          "Erreur chargement invitation:",
          error,
        );

        setErrorMessage(
          "Impossible de charger cet événement.",
        );
        setLoading(false);
        return;
      }

      const normalizedDesign =
        normalizeDesign(data.design);

      setEvent({
        id: data.id,
        name: data.name,
        type: data.type,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.description,
        design: normalizedDesign,
      });

      setMessage(
        data.description ||
          "Nous avons le plaisir de vous inviter à partager avec nous ce moment exceptionnel.",
      );

      setDesign(normalizedDesign);
      setLoading(false);
    }

    void loadEvent();
  }, [eventId]);

  function updateDesign(
    changes: Partial<InvitationDesign>,
  ) {
    setDesign((current) => ({
      ...current,
      ...changes,
    }));

    setMessageStatus("");
  }

  function selectPalette(
    palette: InvitationPalette,
  ) {
    updateDesign({
      palette,
      accentColor: palette.primary,
    });
  }

  async function handleSave() {
    if (!event) return;

    setSaving(true);
    setMessageStatus("");
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "Votre session a expiré. Veuillez vous reconnecter.",
      );
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .update({
        description: message,
        design,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id)
      .eq("owner_id", user.id)
      .select(
        "id, name, type, date, time, location, description, design",
      )
      .single();

    if (error || !data) {
      console.error(
        "Erreur sauvegarde invitation:",
        error,
      );

      setErrorMessage(
        "Impossible de sauvegarder les modifications.",
      );
      setSaving(false);
      return;
    }

    const normalizedDesign =
      normalizeDesign(data.design);

    setEvent({
      id: data.id,
      name: data.name,
      type: data.type,
      date: data.date,
      time: data.time,
      location: data.location,
      description: data.description,
      design: normalizedDesign,
    });

    setDesign(normalizedDesign);
    setMessage(data.description || message);
    setMessageStatus(
      "✓ Invitation et design sauvegardés.",
    );

    setSaving(false);
  }

  const backgroundStyle = useMemo(
    () => getBackgroundStyle(design),
    [design],
  );

  const densityClasses = useMemo(
    () => getDensityClasses(design.density),
    [design.density],
  );

  const radiusClass = getRadiusClass(
    design.radius,
  );

  const titleFontClass = getTitleFontClass(
    design.titleFont,
  );

  const bodyFontClass = getBodyFontClass(
    design.bodyFont,
  );

  const decorationSymbol =
    getDecoration(design.decoration);

  const isDarkPreview =
    design.background === "gradient" ||
    design.background === "image" ||
    design.palette.background === "#09090b" ||
    design.palette.surface === "#18181b";

  const previewText =
    isDarkPreview
      ? "#ffffff"
      : design.palette.text;

  const previewMuted =
    isDarkPreview
      ? "rgba(255,255,255,0.78)"
      : design.palette.muted;

  const previewSurface =
    isDarkPreview
      ? "rgba(0,0,0,0.24)"
      : design.palette.surface;

  const previewBorder =
    isDarkPreview
      ? "rgba(255,255,255,0.18)"
      : design.palette.border;

  const previewOverlay =
    design.background === "image"
      ? "linear-gradient(180deg, rgba(0,0,0,0.30), rgba(0,0,0,0.46))"
      : undefined;

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 event-page-motion">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="h-7 w-64 animate-pulse rounded bg-zinc-200" />
            <div className="mt-6 h-4 w-96 animate-pulse rounded bg-zinc-100" />
            <div className="mt-10 h-96 animate-pulse rounded-3xl bg-zinc-100" />
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 event-page-motion">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-600">
            {errorMessage ||
              "Événement introuvable."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 event-page-motion">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <EventNavigation eventId={event.id} eventName={event.name} />

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
            Invitation Builder
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Créez une invitation qui vous ressemble.
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                Contrôlez la composition, les couleurs,
                la typographie et l&apos;ambiance de votre
                invitation avec un aperçu immédiat.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
              ✨ Aperçu en temps réel
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {messageStatus && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {messageStatus}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[430px_minmax(0,1fr)]">
          <section className="space-y-5 xl:max-h-[calc(100vh-180px)] xl:overflow-y-auto xl:pr-2">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-xl font-black">
                  1. Contenu
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Les informations de votre événement.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Événement", event.name],
                  ["Type", event.type || "Événement"],
                  ["Date", formatDate(event.date)],
                  ["Heure", event.time || "À définir"],
                  ["Lieu", event.location || "À définir"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <label className="mt-5 block text-sm font-bold">
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setMessageStatus("");
                }}
                rows={6}
                className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Votre message..."
              />
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                2. Style
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                L&apos;identité générale de l&apos;invitation.
              </p>

              <div className="mt-4 grid gap-3">
                {styles.map((item) => {
                  const active =
                    design.style === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        updateDesign({
                          style: item.value,
                        })
                      }
                      className={[
                        "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                        style={{
                          backgroundColor:
                            design.accentColor,
                        }}
                      >
                        {item.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block font-black">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-500">
                          {item.description}
                        </span>
                      </span>

                      {active && (
                        <span className="ml-auto rounded-full bg-indigo-600 px-2 py-1 text-xs font-black text-white">
                          ACTIF
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                3. Mise en page
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Déterminez la position des différents éléments.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {layouts.map((item) => {
                  const active =
                    design.layout === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        updateDesign({
                          layout: item.value,
                        })
                      }
                      className={[
                        "rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 hover:border-indigo-300",
                      ].join(" ")}
                    >
                      <div className="mb-3 flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white">
                        {item.value === "classic" && (
                          <div className="w-16 space-y-1 text-center">
                            <div className="mx-auto h-1 w-8 rounded bg-zinc-300" />
                            <div className="h-1 rounded bg-zinc-200" />
                            <div className="mx-auto h-1 w-10 rounded bg-zinc-200" />
                          </div>
                        )}

                        {item.value === "split" && (
                          <div className="flex w-16 gap-2">
                            <div className="h-8 flex-1 rounded bg-zinc-200" />
                            <div className="h-8 flex-1 rounded bg-zinc-300" />
                          </div>
                        )}

                        {item.value === "modern" && (
                          <div className="w-16">
                            <div className="h-2 w-10 rounded bg-zinc-300" />
                            <div className="mt-2 h-5 w-full rounded bg-zinc-200" />
                          </div>
                        )}

                        {item.value === "romantic" && (
                          <div className="text-lg text-zinc-400">
                            ♡
                          </div>
                        )}
                      </div>

                      <p className="font-black">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                4. Couleurs
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Des palettes complètes pour garder une harmonie visuelle.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {palettes.map((palette) => {
                  const active =
                    design.palette.name === palette.name;

                  return (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() =>
                        selectPalette(palette)
                      }
                      className={[
                        "overflow-hidden rounded-2xl border text-left transition-all",
                        active
                          ? "border-indigo-500 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 hover:-translate-y-0.5",
                      ].join(" ")}
                    >
                      <div className="flex h-12">
                        <span
                          className="flex-1"
                          style={{
                            backgroundColor:
                              palette.primary,
                          }}
                        />
                        <span
                          className="flex-1"
                          style={{
                            backgroundColor:
                              palette.secondary,
                          }}
                        />
                        <span
                          className="flex-1"
                          style={{
                            backgroundColor:
                              palette.background,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between bg-white p-3">
                        <span className="text-xs font-black">
                          {palette.name}
                        </span>

                        {active && (
                          <span className="text-xs font-black text-indigo-600">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">
                      Couleur personnalisée
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {design.accentColor}
                    </p>
                  </div>

                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={(e) =>
                      updateDesign({
                        accentColor:
                          e.target.value,
                      })
                    }
                    className="h-11 w-16 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                5. Arrière-plan
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                L&apos;arrière-plan de l&apos;invitation, indépendant du thème Event Studio.
              </p>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {backgrounds.map((item) => {
                  const active =
                    design.background === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      title={item.name}
                      onClick={() =>
                        updateDesign({
                          background: item.value,
                        })
                      }
                      className={[
                        "relative h-14 rounded-2xl border-2 transition-all hover:scale-105",
                        active
                          ? "border-indigo-600 ring-4 ring-indigo-500/15"
                          : "border-zinc-200",
                      ].join(" ")}
                      style={{
                        background:
                          item.preview,
                      }}
                    >
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white drop-shadow">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div>
                  <p className="text-sm font-black">
                    Couleur personnalisée
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Utilisée lorsque « Personnalisé » est sélectionné.
                  </p>
                </div>

                <input
                  type="color"
                  value={
                    design.customBackgroundColor
                  }
                  onChange={(e) =>
                    updateDesign({
                      background: "color",
                      customBackgroundColor:
                        e.target.value,
                    })
                  }
                  className="h-11 w-16 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                6. Typographie
              </h2>

              <div className="mt-4">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Titre
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {titleFonts.map((font) => {
                    const active =
                      design.titleFont ===
                      font.value;

                    return (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() =>
                          updateDesign({
                            titleFont:
                              font.value,
                          })
                        }
                        className={[
                          "rounded-2xl border p-3 transition-all",
                          active
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                            : "border-zinc-200 hover:border-indigo-300",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "text-base",
                            font.previewClass,
                          ].join(" ")}
                        >
                          Aa
                        </span>

                        <span className="mt-1 block text-xs font-bold text-zinc-500">
                          {font.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Corps
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["sans", "serif"] as BodyFont[]).map(
                    (font) => {
                      const active =
                        design.bodyFont ===
                        font;

                      return (
                        <button
                          key={font}
                          type="button"
                          onClick={() =>
                            updateDesign({
                              bodyFont: font,
                            })
                          }
                          className={[
                            "rounded-2xl border p-3 text-left transition-all",
                            active
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                              : "border-zinc-200 hover:border-indigo-300",
                          ].join(" ")}
                        >
                          <span
                            className={
                              font === "serif"
                                ? "font-serif"
                                : "font-sans"
                            }
                          >
                            Exemple de texte
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">
                7. Finition
              </h2>

              <div className="mt-4">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Espacement
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    ["Compact", "compact"],
                    ["Équilibré", "balanced"],
                    ["Aéré", "airy"],
                  ].map(([label, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        updateDesign({
                          density:
                            value as InvitationDensity,
                        })
                      }
                      className={[
                        "rounded-2xl border p-3 text-xs font-black transition-all",
                        design.density ===
                        value
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 hover:border-indigo-300",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Arrondis
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    ["Doux", "soft"],
                    ["Élégant", "elegant"],
                    ["Carré", "square"],
                  ].map(([label, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        updateDesign({
                          radius:
                            value as InvitationRadius,
                        })
                      }
                      className={[
                        "border p-3 text-xs font-black transition-all",
                        value === "soft"
                          ? "rounded-[2rem]"
                          : value === "square"
                            ? "rounded-md"
                            : "rounded-2xl",
                        design.radius ===
                        value
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 hover:border-indigo-300",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Décoration
                </p>

                <div className="mt-3 grid grid-cols-5 gap-2">
                  {decorations.map((item) => {
                    const active =
                      design.decoration ===
                      item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        title={item.name}
                        onClick={() =>
                          updateDesign({
                            decoration:
                              item.value,
                          })
                        }
                        className={[
                          "rounded-2xl border p-3 text-center transition-all",
                          active
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                            : "border-zinc-200 hover:border-indigo-300",
                        ].join(" ")}
                      >
                        <span className="text-lg">
                          {item.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleSave()
              }
              disabled={saving}
              className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Enregistrement..."
                : "💾 Enregistrer le design"}
            </button>
          </section>

          <section className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                    Live Preview
                  </p>

                  <h2 className="mt-1 text-lg font-black">
                    Résultat final
                  </h2>
                </div>

                <div
                  className="h-9 w-9 rounded-full border-4 border-white shadow-sm"
                  style={{
                    backgroundColor:
                      design.accentColor,
                  }}
                />
              </div>

              <div
                className="min-h-[760px] overflow-hidden p-4 transition-all sm:p-8"
                style={{
                  background:
                    backgroundStyle.background,
                }}
              >
                <article
                  className={[
                    "relative mx-auto max-w-2xl overflow-hidden shadow-2xl transition-all",
                    radiusClass,
                    densityClasses.card,
                  ].join(" ")}
                  style={{
                    ...backgroundStyle,
                    color:
                      previewText,
                    border: `1px solid ${previewBorder}`,
                  }}
                >
                  {previewOverlay && (
                    <div
                      className="pointer-events-none absolute inset-0 z-0"
                      style={{
                        background: previewOverlay,
                      }}
                    />
                  )}

                  <div className="relative z-10">
                  {design.decoration !== "none" && (
                    <>
                      <div
                        className="absolute left-5 top-5 text-2xl opacity-70"
                        style={{
                          color:
                            design.accentColor,
                        }}
                      >
                        {decorationSymbol}
                      </div>

                      <div
                        className="absolute right-5 top-5 text-2xl opacity-70"
                        style={{
                          color:
                            design.accentColor,
                        }}
                      >
                        {decorationSymbol}
                      </div>
                    </>
                  )}

                  {design.layout === "classic" && (
                    <div className="text-center">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg"
                        style={{
                          backgroundColor: design.accentColor,
                        }}
                      >
                        {decorationSymbol || "✦"}
                      </div>

                      <p
                        className="mt-5 text-xs font-black uppercase tracking-[0.28em]"
                        style={{
                          color: design.accentColor,
                        }}
                      >
                        Invitation
                      </p>

                      <h3
                        className={[
                          "mt-3 text-3xl sm:text-5xl",
                          densityClasses.title,
                          titleFontClass,
                        ].join(" ")}
                      >
                        {event.name}
                      </h3>

                      <div
                        className="mx-auto mt-5 h-1 w-16 rounded-full"
                        style={{
                          backgroundColor: design.accentColor,
                        }}
                      />

                      <p
                        className={[
                          "mx-auto max-w-xl text-sm leading-7 sm:text-base",
                          densityClasses.message,
                          bodyFontClass,
                        ].join(" ")}
                        style={{
                          color: previewMuted,
                        }}
                      >
                        {message ||
                          "Votre message d'invitation apparaîtra ici."}
                      </p>

                      <PreviewInformation
                        event={event}
                        bodyFontClass={bodyFontClass}
                        mutedColor={previewMuted}
                        surfaceColor={previewSurface}
                        borderColor={previewBorder}
                        densityClass={densityClasses.info}
                      />
                    </div>
                  )}

                  {design.layout === "editorial" && (
                    <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr] md:items-end">
                      <div className="border-l-4 pl-6 text-left sm:pl-8" style={{ borderColor: design.accentColor }}>
                        <p
                          className="text-xs font-black uppercase tracking-[0.3em]"
                          style={{ color: design.accentColor }}
                        >
                          Event Studio / Invitation
                        </p>

                        <p
                          className={[
                            "mt-8 text-sm uppercase tracking-[0.2em]",
                            bodyFontClass,
                          ].join(" ")}
                          style={{ color: previewMuted }}
                        >
                          Nous avons le plaisir de vous inviter
                        </p>
                      </div>

                      <div className="text-left">
                        <h3
                          className={[
                            "text-5xl leading-[0.95] sm:text-7xl",
                            densityClasses.title,
                            titleFontClass,
                          ].join(" ")}
                        >
                          {event.name}
                        </h3>

                        <div
                          className="mt-7 h-px w-full"
                          style={{ backgroundColor: design.accentColor }}
                        />

                        <p
                          className={[
                            "mt-7 max-w-xl text-sm leading-7 sm:text-base",
                            densityClasses.message,
                            bodyFontClass,
                          ].join(" ")}
                          style={{ color: previewMuted }}
                        >
                          {message ||
                            "Votre message d'invitation apparaîtra ici."}
                        </p>

                        <div className="mt-8">
                          <PreviewInformation
                            event={event}
                            bodyFontClass={bodyFontClass}
                            mutedColor={previewMuted}
                            surfaceColor={previewSurface}
                            borderColor={previewBorder}
                            densityClass={densityClasses.info}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {design.layout === "split" && (
                    <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-stretch">
                      <div
                        className="flex min-h-[360px] flex-col justify-between rounded-3xl p-7 text-left sm:p-9"
                        style={{
                          backgroundColor: design.accentColor,
                          color: "#ffffff",
                        }}
                      >
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.28em] opacity-80">
                            Invitation
                          </p>

                          <h3
                            className={[
                              "mt-8 text-4xl leading-tight sm:text-5xl",
                              densityClasses.title,
                              titleFontClass,
                            ].join(" ")}
                          >
                            {event.name}
                          </h3>
                        </div>

                        <div className="text-5xl opacity-80">
                          {decorationSymbol || "✦"}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <p
                          className={[
                            "text-sm leading-7 sm:text-base",
                            densityClasses.message,
                            bodyFontClass,
                          ].join(" ")}
                          style={{ color: previewMuted }}
                        >
                          {message ||
                            "Votre message d'invitation apparaîtra ici."}
                        </p>

                        <div className="mt-7">
                          <PreviewInformation
                            event={event}
                            bodyFontClass={bodyFontClass}
                            mutedColor={previewMuted}
                            surfaceColor={previewSurface}
                            borderColor={previewBorder}
                            densityClass={densityClasses.info}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {design.layout === "modern" && (
                    <div>
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p
                            className="text-xs font-black uppercase tracking-[0.25em]"
                            style={{
                              color: design.accentColor,
                            }}
                          >
                            Invitation
                          </p>

                          <h3
                            className={[
                              "max-w-lg text-4xl sm:text-6xl",
                              densityClasses.title,
                              titleFontClass,
                            ].join(" ")}
                          >
                            {event.name}
                          </h3>
                        </div>

                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
                          style={{
                            backgroundColor: design.accentColor,
                          }}
                        >
                          {decorationSymbol || "✦"}
                        </div>
                      </div>

                      <div
                        className={[
                          "mt-8 rounded-3xl border p-5 sm:p-7",
                          densityClasses.message,
                        ].join(" ")}
                        style={{
                          borderColor: previewBorder,
                          backgroundColor: previewSurface,
                        }}
                      >
                        <p
                          className={[
                            "text-sm leading-7 sm:text-base",
                            bodyFontClass,
                          ].join(" ")}
                          style={{ color: previewMuted }}
                        >
                          {message ||
                            "Votre message d'invitation apparaîtra ici."}
                        </p>
                      </div>

                      <div className="mt-6">
                        <PreviewInformation
                          event={event}
                          bodyFontClass={bodyFontClass}
                          mutedColor={previewMuted}
                          surfaceColor={previewSurface}
                          borderColor={previewBorder}
                          densityClass={densityClasses.info}
                        />
                      </div>
                    </div>
                  )}

                  {design.layout === "romantic" && (
                    <div className="relative text-center">
                      <div
                        className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
                        style={{
                          backgroundColor: design.accentColor,
                        }}
                      />

                      <p
                        className="relative text-xs font-black uppercase tracking-[0.3em]"
                        style={{ color: design.accentColor }}
                      >
                        Avec joie
                      </p>

                      <div className="relative mx-auto mt-6 flex items-center justify-center gap-4">
                        <span
                          className="h-px w-14"
                          style={{ backgroundColor: design.accentColor }}
                        />
                        <span
                          className="text-2xl"
                          style={{ color: design.accentColor }}
                        >
                          {decorationSymbol || "♡"}
                        </span>
                        <span
                          className="h-px w-14"
                          style={{ backgroundColor: design.accentColor }}
                        />
                      </div>

                      <h3
                        className={[
                          "relative mt-7 text-4xl leading-tight sm:text-6xl",
                          densityClasses.title,
                          titleFontClass,
                        ].join(" ")}
                      >
                        {event.name}
                      </h3>

                      <p
                        className={[
                          "relative mx-auto max-w-xl text-sm leading-8 sm:text-base",
                          densityClasses.message,
                          bodyFontClass,
                        ].join(" ")}
                        style={{ color: previewMuted }}
                      >
                        {message ||
                          "Votre message d'invitation apparaîtra ici."}
                      </p>

                      <div className="relative mt-8">
                        <PreviewInformation
                          event={event}
                          bodyFontClass={bodyFontClass}
                          mutedColor={previewMuted}
                          surfaceColor={previewSurface}
                          borderColor={previewBorder}
                          densityClass={densityClasses.info}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={[
                      "text-center",
                      densityClasses.button,
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      className="rounded-2xl px-7 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor:
                          design.accentColor,
                      }}
                    >
                      Confirmer ma présence
                    </button>

                    <p
                      className="mt-4 text-xs"
                      style={{
                        color:
                          previewMuted,
                      }}
                    >
                      RSVP personnalisé pour vos invités
                    </p>
                  </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function PreviewInformation({
  event,
  bodyFontClass,
  mutedColor,
  surfaceColor,
  borderColor,
  densityClass,
}: {
  event: EventData;
  bodyFontClass: string;
  mutedColor: string;
  surfaceColor: string;
  borderColor: string;
  densityClass: string;
}) {
  return (
    <div
      className={[
        "grid gap-3 sm:grid-cols-3",
        densityClass,
        bodyFontClass,
      ].join(" ")}
    >
      <div
        className="rounded-2xl border p-4 text-center"
        style={{
          backgroundColor:
            surfaceColor,
          borderColor,
        }}
      >
        <p className="text-lg">
          📅
        </p>

        <p
          className="mt-2 text-xs font-black uppercase tracking-wide"
          style={{
            color: mutedColor,
          }}
        >
          Date
        </p>

        <p className="mt-1 text-xs font-bold">
          {formatDate(event.date)}
        </p>
      </div>

      <div
        className="rounded-2xl border p-4 text-center"
        style={{
          backgroundColor:
            surfaceColor,
          borderColor,
        }}
      >
        <p className="text-lg">
          🕐
        </p>

        <p
          className="mt-2 text-xs font-black uppercase tracking-wide"
          style={{
            color: mutedColor,
          }}
        >
          Heure
        </p>

        <p className="mt-1 text-xs font-bold">
          {event.time || "À définir"}
        </p>
      </div>

      <div
        className="rounded-2xl border p-4 text-center"
        style={{
          backgroundColor:
            surfaceColor,
          borderColor,
        }}
      >
        <p className="text-lg">
          📍
        </p>

        <p
          className="mt-2 text-xs font-black uppercase tracking-wide"
          style={{
            color: mutedColor,
          }}
        >
          Lieu
        </p>

        <p className="mt-1 text-xs font-bold">
          {event.location || "À définir"}
        </p>
      </div>
    </div>
  );
}
