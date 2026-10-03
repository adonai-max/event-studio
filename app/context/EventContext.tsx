"use client";

import {
createContext,
useContext,
useEffect,
useState,
} from "react";
import { supabase } from "@/lib/supabase";

export type GuestType = "individual" | "couple";

export type GuestStatus = "pending" | "confirmed" | "declined";

export type Guest = {
id: string;
type: GuestType;
firstName1: string;
lastName1: string;
firstName2: string;
lastName2: string;
whatsapp: string;
status: GuestStatus;
slug: string;
checkedIn: boolean;
checkedInAt: string | null;
};

export type EventDesign = {
style: string;
layout: string;
palette: {
name: string;
primary: string;
secondary: string;
background: string;
surface: string;
text: string;
muted: string;
border: string;
};
accentColor: string;
titleFont: string;
bodyFont: string;
background: string;
customBackgroundColor: string;
density: string;
radius: string;
decoration: string;
};

export type EventData = {
id?: string;
name: string;
type: string;
date: string;
time: string;
location: string;
description: string;
design: EventDesign;
};

type EventContextType = {
event: EventData;
guests: Guest[];

saveEvent: (data: EventData) => Promise<EventData | null>;
clearEvent: () => void;

addGuest: (guest: Omit<Guest, "id">) => Promise<Guest | null>;
updateGuest: (guest: Guest) => void;
deleteGuest: (guestId: string) => void;

updateGuestStatus: (
guestId: string,
status: GuestStatus,
) => void;

confirmGuestAttendance: (guestId: string) => void;

checkInGuest: (guestId: string) => void;
resetGuestCheckIn: (guestId: string) => void;
};

const defaultEvent: EventData = {
id: undefined,
name: "",
type: "",
date: "",
time: "",
location: "",
description: "",
design: {
style: "elegant",
layout: "classic",
palette: {
name: "Ivoire Royal",
primary: "#4f46e5",
secondary: "#7c3aed",
background: "#f8f5ed",
surface: "#ffffff",
text: "#18181b",
muted: "#71717a",
border: "#e4e4e7",
},
accentColor: "#4f46e5",
titleFont: "serif",
bodyFont: "sans",
background: "ivory",
customBackgroundColor: "#f8f5ed",
density: "balanced",
radius: "elegant",
decoration: "none",
},
};

const EventContext = createContext<
EventContextType | undefined

> (undefined);

export function EventProvider({
children,
}: {
children: React.ReactNode;
}) {
const [event, setEvent] =
useState<EventData>(defaultEvent);

const [guests, setGuests] = useState<Guest[]>([]);

useEffect(() => {
  async function loadEvent() {
    // Vérification de l'utilisateur connecté
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Erreur lors de la récupération de l'utilisateur :",
        userError,
      );
      return;
    }

    if (!user) {
      console.warn(
        "Aucun utilisateur Supabase connecté.",
      );
      return;
    }

    // Chargement du dernier événement de l'utilisateur
    const {
      data: eventData,
      error: eventError,
    } = await supabase
      .from("events")
      .select(
        "id, name, type, date, time, location, description, design",
      )
      .eq("owner_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (eventError) {
      console.error(
        "Erreur lors du chargement de l'événement Supabase :",
        eventError,
      );
      return;
    }

    if (!eventData) {
      console.warn(
        "Aucun événement Supabase trouvé pour cet utilisateur.",
      );
      return;
    }

    const remoteEvent: EventData = {
      id: eventData.id,
      name: eventData.name ?? "",
      type: eventData.type ?? "",
      date: eventData.date ?? "",
      time: eventData.time ?? "",
      location: eventData.location ?? "",
      description: eventData.description ?? "",
      design: eventData.design ?? defaultEvent.design,
    };

    setEvent(remoteEvent);

    localStorage.setItem(
      "event-studio-event",
      JSON.stringify(remoteEvent),
    );

    console.log(
      "🟢 Événement chargé depuis Supabase :",
      remoteEvent,
    );

    // Chargement des invités depuis Supabase
    const {
      data: guestsData,
      error: guestsError,
    } = await supabase
      .from("guests")
      .select(
        "id, type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug, checked_in, checked_in_at",
      )
      .eq("event_id", remoteEvent.id)
      .order("created_at", {
        ascending: true,
      });

    if (guestsError) {
      console.error(
        "❌ Erreur lors du chargement des invités Supabase :",
        guestsError,
      );
      return;
    }

    const remoteGuests: Guest[] = (guestsData ?? []).map(
      (guest) => ({
        id: guest.id,
        type: guest.type,
        firstName1: guest.first_name_1,
        lastName1: guest.last_name_1,
        firstName2: guest.first_name_2 ?? "",
        lastName2: guest.last_name_2 ?? "",
        whatsapp: guest.whatsapp ?? "",
        status: guest.status,
        slug:
          guest.slug ||
          createGuestSlug(
            guest.first_name_1,
            guest.last_name_1,
            guest.first_name_2,
            guest.last_name_2,
            guest.type,
          ),
        checkedIn: guest.checked_in ?? false,
        checkedInAt: guest.checked_in_at ?? null,
      }),
    );

    setGuests(remoteGuests);

    localStorage.setItem(
      "event-studio-guests",
      JSON.stringify(remoteGuests),
    );

    console.log(
      "🟢 Invités chargés depuis Supabase :",
      remoteGuests,
    );
  }

  void loadEvent();
}, []);

const saveEvent = async (
data: EventData,
): Promise<EventData | null> => {
console.log(
"🟢 SAVE EVENT APPELÉ :",
data,
);

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError) {
  console.error(
    "❌ Erreur lors de la récupération de l'utilisateur :",
    userError,
  );

  return null;
}

if (!user) {
  console.error(
    "❌ Aucun utilisateur Supabase connecté.",
  );

  return null;
}

// Mise à jour d'un événement existant
if (data.id) {
  console.log(
    "🔵 Mise à jour de l'événement Supabase :",
    data.id,
  );

  const {
    data: updatedEvent,
    error,
  } = await supabase
    .from("events")
    .update({
      name: data.name,
      type: data.type,
      date: data.date || null,
      time: data.time || null,
      location: data.location,
      description: data.description,
      design: data.design,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id)
    .eq("owner_id", user.id)
    .select(
      "id, name, type, date, time, location, description, design",
    )
    .single();

  if (error) {
    console.error(
      "❌ Erreur lors de la mise à jour Supabase :",
      error,
    );

    return null;
  }

  const finalEvent: EventData = {
    id: updatedEvent.id,
    name: updatedEvent.name ?? "",
    type: updatedEvent.type ?? "",
    date: updatedEvent.date ?? "",
    time: updatedEvent.time ?? "",
    location: updatedEvent.location ?? "",
    description: updatedEvent.description ?? "",
    design: updatedEvent.design ?? defaultEvent.design,
  };

  setEvent(finalEvent);

  localStorage.setItem(
    "event-studio-event",
    JSON.stringify(finalEvent),
  );

  console.log(
    "🟢 Événement mis à jour dans Supabase :",
    finalEvent,
  );

  return finalEvent;
}

// Création d'un nouvel événement
console.log(
  "🟡 Création de l'événement dans Supabase...",
);

const {
  data: newEvent,
  error,
} = await supabase
  .from("events")
  .insert({
    owner_id: user.id,
    name: data.name,
    type: data.type,
    date: data.date || null,
    time: data.time || null,
    location: data.location,
    description: data.description,
    design: data.design,
  })
  .select(
    "id, name, type, date, time, location, description, design",
  )
  .single();

if (error) {
  console.error(
    "❌ ERREUR SUPABASE — création événement :",
    error,
  );

  return null;
}

const finalEvent: EventData = {
  id: newEvent.id,
  name: newEvent.name ?? "",
  type: newEvent.type ?? "",
  date: newEvent.date ?? "",
  time: newEvent.time ?? "",
  location: newEvent.location ?? "",
  description:
    newEvent.description ?? "",
  design: newEvent.design ?? defaultEvent.design,
};

setEvent(finalEvent);

localStorage.setItem(
  "event-studio-event",
  JSON.stringify(finalEvent),
);

console.log(
  "🟢 ÉVÉNEMENT CRÉÉ DANS SUPABASE :",
  finalEvent,
);

return finalEvent;

};

const clearEvent = () => {
setEvent(defaultEvent);
setGuests([]);

localStorage.removeItem(
  "event-studio-event",
);

localStorage.removeItem(
  "event-studio-guests",
);

};

const addGuest = async (
  guest: Omit<Guest, "id">,
): Promise<Guest | null> => {
  console.log("🟡 Création de l'invité dans Supabase...", guest);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ Aucun utilisateur Supabase connecté :", userError);
    return null;
  }

  if (!event.id) {
    console.error("❌ Aucun événement Supabase sélectionné.");
    return null;
  }

  const { data: newGuest, error } = await supabase
    .from("guests")
    .insert({
      event_id: event.id,
      type: guest.type,
      first_name_1: guest.firstName1,
      last_name_1: guest.lastName1,
      first_name_2: guest.firstName2 || null,
      last_name_2: guest.lastName2 || null,
      whatsapp: guest.whatsapp,
      status: guest.status,
      slug: guest.slug,
      checked_in: guest.checkedIn,
      checked_in_at: guest.checkedInAt,
    })
    .select("id, type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug, checked_in, checked_in_at")
    .single();

  if (error) {
    console.error("❌ ERREUR SUPABASE — création invité :", error);
    return null;
  }

  const createdGuest: Guest = {
    id: newGuest.id,
    type: newGuest.type,
    firstName1: newGuest.first_name_1,
    lastName1: newGuest.last_name_1,
    firstName2: newGuest.first_name_2 ?? "",
    lastName2: newGuest.last_name_2 ?? "",
    whatsapp: newGuest.whatsapp ?? "",
    status: newGuest.status,
    slug: newGuest.slug,
    checkedIn: newGuest.checked_in ?? false,
    checkedInAt: newGuest.checked_in_at ?? null,
  };

  setGuests((currentGuests) => {
    const updatedGuests = [...currentGuests, createdGuest];
    localStorage.setItem("event-studio-guests", JSON.stringify(updatedGuests));
    return updatedGuests;
  });

  console.log("🟢 INVITÉ CRÉÉ DANS SUPABASE :", createdGuest);
  return createdGuest;
};

const updateGuest = async (
  updatedGuest: Guest,
): Promise<Guest | null> => {
  console.log(
    "🟡 Modification de l'invité dans Supabase...",
    updatedGuest,
  );

  const { data: updatedData, error } = await supabase
    .from("guests")
    .update({
      type: updatedGuest.type,
      first_name_1: updatedGuest.firstName1,
      last_name_1: updatedGuest.lastName1,
      first_name_2: updatedGuest.firstName2 || null,
      last_name_2: updatedGuest.lastName2 || null,
      whatsapp: updatedGuest.whatsapp,
      status: updatedGuest.status,
      slug: updatedGuest.slug,
      checked_in: updatedGuest.checkedIn,
      checked_in_at: updatedGuest.checkedInAt,
    })
    .eq("id", updatedGuest.id)
    .select(
      "id, type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug, checked_in, checked_in_at",
    )
    .single();

  if (error) {
    console.error(
      "❌ ERREUR SUPABASE — modification invité :",
      error,
    );
    return null;
  }

  const updatedGuestFromSupabase: Guest = {
    id: updatedData.id,
    type: updatedData.type,
    firstName1: updatedData.first_name_1,
    lastName1: updatedData.last_name_1,
    firstName2: updatedData.first_name_2 ?? "",
    lastName2: updatedData.last_name_2 ?? "",
    whatsapp: updatedData.whatsapp ?? "",
    status: updatedData.status,
    slug: updatedData.slug,
    checkedIn: updatedData.checked_in ?? false,
    checkedInAt: updatedData.checked_in_at ?? null,
  };

  setGuests((currentGuests) => {
    const guests = currentGuests.map((guest) =>
      guest.id === updatedGuestFromSupabase.id
        ? updatedGuestFromSupabase
        : guest,
    );

    localStorage.setItem(
      "event-studio-guests",
      JSON.stringify(guests),
    );

    return guests;
  });

  console.log(
    "🟢 INVITÉ MODIFIÉ DANS SUPABASE :",
    updatedGuestFromSupabase,
  );

  return updatedGuestFromSupabase;
};

const deleteGuest = async (
  guestId: string,
): Promise<boolean> => {
  console.log(
    "🟡 Suppression de l'invité dans Supabase...",
    guestId,
  );

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", guestId);

  if (error) {
    console.error(
      "❌ ERREUR SUPABASE — suppression invité :",
      error,
    );
    return false;
  }

  setGuests((currentGuests) => {
    const updatedGuests = currentGuests.filter(
      (guest) => guest.id !== guestId,
    );

    localStorage.setItem(
      "event-studio-guests",
      JSON.stringify(updatedGuests),
    );

    return updatedGuests;
  });

  console.log(
    "🟢 INVITÉ SUPPRIMÉ DE SUPABASE :",
    guestId,
  );

  return true;
};

const updateGuestStatus = async (
  guestId: string,
  status: GuestStatus,
): Promise<Guest | null> => {
  console.log(
    "🟡 Modification du statut de l'invité dans Supabase...",
    {
      guestId,
      status,
    },
  );

  const { data: updatedData, error } = await supabase
    .from("guests")
    .update({
      status,
    })
    .eq("id", guestId)
    .select(
      "id, type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug, checked_in, checked_in_at",
    )
    .single();

  if (error) {
    console.error(
      "❌ ERREUR SUPABASE — modification statut invité :",
      error,
    );
    return null;
  }

  const updatedGuest: Guest = {
    id: updatedData.id,
    type: updatedData.type,
    firstName1: updatedData.first_name_1,
    lastName1: updatedData.last_name_1,
    firstName2: updatedData.first_name_2 ?? "",
    lastName2: updatedData.last_name_2 ?? "",
    whatsapp: updatedData.whatsapp ?? "",
    status: updatedData.status,
    slug: updatedData.slug,
    checkedIn: updatedData.checked_in ?? false,
    checkedInAt: updatedData.checked_in_at ?? null,
  };

  setGuests((currentGuests) => {
    const updatedGuests = currentGuests.map((guest) =>
      guest.id === updatedGuest.id
        ? updatedGuest
        : guest,
    );

    localStorage.setItem(
      "event-studio-guests",
      JSON.stringify(updatedGuests),
    );

    return updatedGuests;
  });

  console.log(
    "🟢 STATUT INVITÉ MODIFIÉ DANS SUPABASE :",
    updatedGuest,
  );

  return updatedGuest;
};

const confirmGuestAttendance = async (
  guestId: string,
): Promise<Guest | null> => {
  const updatedGuest = await updateGuestStatus(
    guestId,
    "confirmed",
  );

  if (!updatedGuest) {
    console.error(
      "❌ Impossible de confirmer la présence de l'invité.",
    );
    return null;
  }

  console.log(
    "🟢 PRÉSENCE DE L'INVITÉ CONFIRMÉE :",
    updatedGuest,
  );

  return updatedGuest;
};

const checkInGuest = async (
  guestId: string,
): Promise<Guest | null> => {
  console.log(
    "🟡 Enregistrement de l'entrée de l'invité dans Supabase...",
    guestId,
  );

  const checkedInAt = new Date().toISOString();

  const { data: updatedData, error } = await supabase
    .from("guests")
    .update({
      checked_in: true,
      checked_in_at: checkedInAt,
    })
    .eq("id", guestId)
    .select(
      "id, type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug, checked_in, checked_in_at",
    )
    .single();

  if (error) {
    console.error(
      "❌ ERREUR SUPABASE — check-in invité :",
      error,
    );
    return null;
  }

  const updatedGuest: Guest = {
    id: updatedData.id,
    type: updatedData.type,
    firstName1: updatedData.first_name_1,
    lastName1: updatedData.last_name_1,
    firstName2: updatedData.first_name_2 ?? "",
    lastName2: updatedData.last_name_2 ?? "",
    whatsapp: updatedData.whatsapp ?? "",
    status: updatedData.status,
    slug: updatedData.slug,
    checkedIn: updatedData.checked_in ?? false,
    checkedInAt: updatedData.checked_in_at ?? null,
  };

  setGuests((currentGuests) => {
    const updatedGuests = currentGuests.map((guest) =>
      guest.id === updatedGuest.id
        ? updatedGuest
        : guest,
    );

    localStorage.setItem(
      "event-studio-guests",
      JSON.stringify(updatedGuests),
    );

    return updatedGuests;
  });

  console.log(
    "🟢 INVITÉ ENTRÉ — CHECK-IN ENREGISTRÉ DANS SUPABASE :",
    updatedGuest,
  );

  return updatedGuest;
};

const resetGuestCheckIn = async (
  guestId: string,
): Promise<Guest | null> => {
  console.log(
    "🟡 Réinitialisation du check-in dans Supabase...",
    guestId,
  );

  const { data: updatedData, error } = await supabase
    .from("guests")
    .update({
      checked_in: false,
      checked_in_at: null,
    })
    .eq("id", guestId)
    .select(
      "id, type, first_name_1, last_name_1, first_name_2, last_name_2, whatsapp, status, slug, checked_in, checked_in_at",
    )
    .single();

  if (error) {
    console.error(
      "❌ ERREUR SUPABASE — réinitialisation check-in :",
      error,
    );
    return null;
  }

  const updatedGuest: Guest = {
    id: updatedData.id,
    type: updatedData.type,
    firstName1: updatedData.first_name_1,
    lastName1: updatedData.last_name_1,
    firstName2: updatedData.first_name_2 ?? "",
    lastName2: updatedData.last_name_2 ?? "",
    whatsapp: updatedData.whatsapp ?? "",
    status: updatedData.status,
    slug: updatedData.slug,
    checkedIn: updatedData.checked_in ?? false,
    checkedInAt: updatedData.checked_in_at ?? null,
  };

  setGuests((currentGuests) => {
    const updatedGuests = currentGuests.map((guest) =>
      guest.id === updatedGuest.id
        ? updatedGuest
        : guest,
    );

    localStorage.setItem(
      "event-studio-guests",
      JSON.stringify(updatedGuests),
    );

    return updatedGuests;
  });

  console.log(
    "🟢 CHECK-IN RÉINITIALISÉ DANS SUPABASE :",
    updatedGuest,
  );

  return updatedGuest;
};

return (
<EventContext.Provider
value={{
event,
guests,
saveEvent,
clearEvent,
addGuest,
updateGuest,
deleteGuest,
updateGuestStatus,
confirmGuestAttendance,
checkInGuest,
resetGuestCheckIn,
}}
>
{children}
</EventContext.Provider>
);
}

export function useEvent() {
const context =
useContext(EventContext);

if (!context) {
throw new Error(
"useEvent doit être utilisé dans EventProvider",
);
}

return context;
}

function createGuestSlug(
firstName1: string,
lastName1: string,
firstName2: string,
lastName2: string,
type: GuestType,
) {
const primaryName = normalizeText(
`${firstName1}-${lastName1}`,
);

if (type === "couple") {
const secondaryName =
normalizeText(
`${firstName2}-${lastName2}`,
);

return [
  primaryName,
  secondaryName,
]
  .filter(Boolean)
  .join("-");

}

return primaryName;
}

function normalizeText(
value: string,
) {
return value
.toLowerCase()
.normalize("NFD")
.replace(
/[\u0300-\u036f]/g,
"",
)
.replace(
/[^a-z0-9]+/g,
"-",
)
.replace(
/^-+|-+$/g,
"");
}
