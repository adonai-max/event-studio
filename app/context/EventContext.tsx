"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type GuestType = "individual" | "couple";

export type GuestStatus = "pending" | "confirmed" | "declined";

export type Guest = {
  id: number;
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

export type EventData = {
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

type EventContextType = {
  event: EventData;
  guests: Guest[];

  saveEvent: (data: EventData) => void;
  clearEvent: () => void;

  addGuest: (guest: Guest) => void;
  updateGuest: (guest: Guest) => void;
  deleteGuest: (guestId: number) => void;

  updateGuestStatus: (
    guestId: number,
    status: GuestStatus,
  ) => void;

  confirmGuestAttendance: (guestId: number) => void;

  checkInGuest: (guestId: number) => void;
  resetGuestCheckIn: (guestId: number) => void;
};

const defaultEvent: EventData = {
  name: "",
  type: "",
  date: "",
  time: "",
  location: "",
  description: "",
};

const EventContext = createContext<EventContextType | undefined>(
  undefined,
);

export function EventProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [event, setEvent] = useState<EventData>(defaultEvent);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    const savedEvent = localStorage.getItem("event-studio-event");
    const savedGuests = localStorage.getItem("event-studio-guests");

    if (savedEvent) {
      try {
        setEvent(JSON.parse(savedEvent));
      } catch {
        localStorage.removeItem("event-studio-event");
      }
    }

    if (savedGuests) {
      try {
        const parsedGuests = JSON.parse(savedGuests);

        if (Array.isArray(parsedGuests)) {
          const migratedGuests: Guest[] = parsedGuests.map(
            (guest: Guest) => ({
              ...guest,

              slug:
                guest.slug ||
                createGuestSlug(
                  guest.firstName1,
                  guest.lastName1,
                  guest.firstName2,
                  guest.lastName2,
                  guest.type,
                ),

              checkedIn: guest.checkedIn ?? false,

              checkedInAt: guest.checkedInAt ?? null,
            }),
          );

          setGuests(migratedGuests);

          localStorage.setItem(
            "event-studio-guests",
            JSON.stringify(migratedGuests),
          );
        }
      } catch {
        localStorage.removeItem("event-studio-guests");
      }
    }
  }, []);

  const saveEvent = (data: EventData) => {
    setEvent(data);

    localStorage.setItem(
      "event-studio-event",
      JSON.stringify(data),
    );
  };

  const clearEvent = () => {
    setEvent(defaultEvent);
    setGuests([]);

    localStorage.removeItem("event-studio-event");
    localStorage.removeItem("event-studio-guests");
  };

  const addGuest = (guest: Guest) => {
    setGuests((currentGuests) => {
      const updatedGuests = [...currentGuests, guest];

      localStorage.setItem(
        "event-studio-guests",
        JSON.stringify(updatedGuests),
      );

      return updatedGuests;
    });
  };

  const updateGuest = (updatedGuest: Guest) => {
    setGuests((currentGuests) => {
      const updatedGuests = currentGuests.map((guest) =>
        guest.id === updatedGuest.id ? updatedGuest : guest,
      );

      localStorage.setItem(
        "event-studio-guests",
        JSON.stringify(updatedGuests),
      );

      return updatedGuests;
    });
  };

  const deleteGuest = (guestId: number) => {
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
  };

  const updateGuestStatus = (
    guestId: number,
    status: GuestStatus,
  ) => {
    setGuests((currentGuests) => {
      const updatedGuests = currentGuests.map((guest) =>
        guest.id === guestId
          ? { ...guest, status }
          : guest,
      );

      localStorage.setItem(
        "event-studio-guests",
        JSON.stringify(updatedGuests),
      );

      return updatedGuests;
    });
  };

  const confirmGuestAttendance = (guestId: number) => {
    updateGuestStatus(guestId, "confirmed");
  };

  const checkInGuest = (guestId: number) => {
    setGuests((currentGuests) => {
      const updatedGuests = currentGuests.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              checkedIn: true,
              checkedInAt: new Date().toISOString(),
            }
          : guest,
      );

      localStorage.setItem(
        "event-studio-guests",
        JSON.stringify(updatedGuests),
      );

      return updatedGuests;
    });
  };

  const resetGuestCheckIn = (guestId: number) => {
    setGuests((currentGuests) => {
      const updatedGuests = currentGuests.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              checkedIn: false,
              checkedInAt: null,
            }
          : guest,
      );

      localStorage.setItem(
        "event-studio-guests",
        JSON.stringify(updatedGuests),
      );

      return updatedGuests;
    });
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
  const context = useContext(EventContext);

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
    const secondaryName = normalizeText(
      `${firstName2}-${lastName2}`,
    );

    return [primaryName, secondaryName]
      .filter(Boolean)
      .join("-");
  }

  return primaryName;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}