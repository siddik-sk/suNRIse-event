/**
 * JSON shapes returned by the public/student API routes.
 * Dates arrive as ISO strings after serialisation.
 */

export type ClientCategory = "TECHNICAL" | "NON_TECHNICAL" | "WORKSHOP" | "CULTURAL";

export type ClientEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ClientCategory;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  prize: string;
  capacity: number;
  teamSize: string;
  fee: number;
  isFeatured: boolean;
  department?: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    accent: string;
    icon: string;
  } | null;
};

export type RegistrationEvent = {
  id: string;
  eventId: string;
  attended: boolean;
  attendedAt: string | null;
  event: ClientEvent;
};

export type RegistrationData = {
  id: string;
  registrationId: string;
  status: "CONFIRMED" | "CANCELLED";
  checkedInAt: string | null;
  createdAt: string;
  eventRegistrations: RegistrationEvent[];
};

export type PassData = {
  registrationId: string;
  status: "CONFIRMED" | "CANCELLED";
  checkedInAt: string | null;
  dataUrl: string;
  events: {
    id: string;
    title: string;
    day: number;
    startTime: string;
    endTime: string;
    venue: string;
    attended: boolean;
  }[];
};
