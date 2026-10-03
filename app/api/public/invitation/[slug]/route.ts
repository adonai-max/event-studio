import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "get_public_invitation",
      {
        p_slug: decodeURIComponent(slug),
      },
    );

    if (error) {
      console.error(
        "❌ Erreur API invitation publique :",
        error,
      );

      return NextResponse.json(
        {
          error: "Impossible de charger l'invitation.",
        },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Invitation introuvable.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "❌ Erreur serveur invitation publique :",
      error,
    );

    return NextResponse.json(
      {
        error: "Erreur serveur.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const status = body?.status;

    if (status !== "confirmed" && status !== "declined") {
      return NextResponse.json(
        {
          error: "Statut RSVP invalide.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "respond_to_invitation",
      {
        p_slug: decodeURIComponent(slug),
        p_status: status,
      },
    );

    if (error) {
      console.error(
        "❌ Erreur RSVP public :",
        error,
      );

      return NextResponse.json(
        {
          error: "Impossible d'enregistrer votre réponse.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      guest: data,
    });
  } catch (error) {
    console.error(
      "❌ Erreur serveur RSVP public :",
      error,
    );

    return NextResponse.json(
      {
        error: "Erreur serveur.",
      },
      { status: 500 },
    );
  }
}
