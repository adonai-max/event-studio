"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DemoGuestType = "individual" | "couple";

export type DemoGuestStatus =
  | "pending"
  | "confirmed"
  | "declined";

export type DemoGuest = {
  id: string;
  type: DemoGuestType;
  firstName1: string;
  lastName1: string;
  firstName2: string;
  lastName2: string;
  whatsapp: string;
  status: DemoGuestStatus;
  slug: string;
  checkedIn: boolean;
  checkedInAt: string | null;
};

export type DemoEvent = {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

type DemoEventContextValue = {
  event: DemoEvent;
  guests: DemoGuest[];
  addGuest: (
    guest: Omit<DemoGuest, "id"> & { id?: string },
  ) => void;
  updateGuest: (guest: DemoGuest) => void;
  deleteGuest: (guestId: string) => void;
  checkInGuest: (guestId: string) => Promise<void>;
  resetGuestCheckIn: (guestId: string) => Promise<void>;
};

const DEMO_EVENT_KEY = "event-studio-demo-event";
const DEMO_GUESTS_KEY = "event-studio-demo-guests";

const defaultEvent: DemoEvent = {
  id: "demo",
  name: "Mariage de Sarah & David",
  type: "Mariage",
  date: "2026-12-15",
  time: "14:00",
  location: "Likasi",
  description:
    "Nous avons le plaisir de vous inviter à partager avec nous ce moment exceptionnel.",
};

const defaultGuests: DemoGuest[] = [
  {
    id: "demo-guest-1",
    type: "couple",
    firstName1: "Jean",
    lastName1: "Mbuyi",
    firstName2: "Marie",
    lastName2: "Kanku",
    whatsapp: "+243 900 000 001",
    status: "confirmed",
    slug: "jean-mbuyi-marie-kanku",
    checkedIn: false,
    checkedInAt: null,
  },
  {
    id: "demo-guest-2",
    type: "individual",
    firstName1: "Patrick",
    lastName1: "Kabeya",
    firstName2: "",
    lastName2: "",
    whatsapp: "+243 900 000 002",
    status: "pending",
    slug: "patrick-kabeya",
    checkedIn: false,
    checkedInAt: null,
  },
  {
    id: "demo-guest-3",
    type: "individual",
    firstName1: "Grâce",
    lastName1: "Kalala",
    firstName2: "",
    lastName2: "",
    whatsapp: "+243 900 000 003",
    status: "confirmed",
    slug: "grace-kalala",
    checkedIn: true,
    checkedInAt: "2026-12-15T13:42:00.000Z",
  },
  {
    id: "demo-guest-4",
    type: "individual",
    firstName1: "David",
    lastName1: "Tshibangu",
    firstName2: "",
    lastName2: "",
    whatsapp: "+243 900 000 004",
    status: "declined",
    slug: "david-tshibangu",
    checkedIn: false,
    checkedInAt: null,
  },
];

function getInitialEvent(): DemoEvent {
  if (typeof window === "undefined") {
    return defaultEvent;
  }

  try {
    const storedEvent =
      window.localStorage.getItem(DEMO_EVENT_KEY);

    if (storedEvent) {
      return JSON.parse(storedEvent) as DemoEvent;
    }
  } catch {
    // Retour aux données de démonstration par défaut.
  }

  return defaultEvent;
}

function getInitialGuests(): DemoGuest[] {
  if (typeof window === "undefined") {
    return defaultGuests;
  }

  try {
    const storedGuests =
      window.localStorage.getItem(DEMO_GUESTS_KEY);

    if (storedGuests) {
      return JSON.parse(storedGuests) as DemoGuest[];
    }
  } catch {
    // Retour aux données de démonstration par défaut.
  }

  return defaultGuests;
}

const DemoEventContext =
  createContext<DemoEventContextValue | null>(null);

export function DemoEventProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [event] =
    useState<DemoEvent>(getInitialEvent);

  const [guests, setGuests] =
    useState<DemoGuest[]>(getInitialGuests);

  useEffect(() => {
    window.localStorage.setItem(
      DEMO_EVENT_KEY,
      JSON.stringify(event),
    );
  }, [event]);

  useEffect(() => {
    window.localStorage.setItem(
      DEMO_GUESTS_KEY,
      JSON.stringify(guests),
    );
  }, [guests]);

  const addGuest = (
    guest: Omit<DemoGuest, "id"> & { id?: string },
  ) => {
    const guestWithId: DemoGuest = {
      ...guest,
      id:
        guest.id ||
        `demo-guest-${Date.now()}`,
    };

    setGuests((current) => [
      ...current,
      guestWithId,
    ]);
  };

  const updateGuest = (guest: DemoGuest) => {
    setGuests((current) =>
      current.map((item) =>
        item.id === guest.id
          ? guest
          : item,
      ),
    );
  };

  const deleteGuest = (guestId: string) => {
    setGuests((current) =>
      current.filter(
        (guest) => guest.id !== guestId,
      ),
    );
  };

  const checkInGuest = async (guestId: string) => {
    const checkedInAt =
      new Date().toISOString();

    setGuests((current) =>
      current.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              checkedIn: true,
              checkedInAt,
            }
          : guest,
      ),
    );
  };

  const resetGuestCheckIn = async (
    guestId: string,
  ) => {
    setGuests((current) =>
      current.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              checkedIn: false,
              checkedInAt: null,
            }
          : guest,
      ),
    );
  };

  const value = useMemo(
    () => ({
      event,
      guests,
      addGuest,
      updateGuest,
      deleteGuest,
      checkInGuest,
      resetGuestCheckIn,
    }),
    [event, guests],
  );

  return (
    <DemoEventContext.Provider value={value}>
      {children}
    </DemoEventContext.Provider>
  );
}

export function useDemoEvent() {
  const context =
    useContext(DemoEventContext);

  if (!context) {
    throw new Error(
      "useDemoEvent doit être utilisé à l'intérieur de DemoEventProvider.",
    );
  }

  return context;
}
