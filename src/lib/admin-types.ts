/** JSON shapes returned by /api/admin/* routes. */

export type AdminEventCategory = "TECHNICAL" | "NON_TECHNICAL" | "WORKSHOP" | "CULTURAL";

export type AdminCoordinator = { name: string; phone: string };

export type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AdminEventCategory;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  prize: string;
  rules: string[];
  coordinators: AdminCoordinator[] | unknown;
  capacity: number;
  teamSize: string;
  fee: number;
  isFeatured: boolean;
  isActive: boolean;
  departmentId: string;
  department: { id: string; name: string; shortName: string; slug: string };
  _count: { registrations: number };
};

export type AdminDepartment = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  tagline: string | null;
  accent: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  _count: { events: number };
};

export type AdminRegistration = {
  id: string;
  registrationId: string;
  status: "CONFIRMED" | "CANCELLED";
  checkedInAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    department: string;
    year: string;
    rollNumber: string;
    uploads: { id: string; originalName: string; mimeType: string; size: number }[];
  };
  eventRegistrations: {
    id: string;
    eventId: string;
    attended: boolean;
    attendedAt: string | null;
    event: {
      id: string;
      title: string;
      day: number;
      startTime: string;
      venue: string;
      department: { shortName: string };
    };
  }[];
};

export type AdminPagination = { page: number; pageSize: number; total: number; pages: number };

export type AdminStats = {
  students: number;
  registrations: number;
  checkedIn: number;
  attendanceRate: number;
  colleges: number;
  revenue: number;
  eventRegistrations: number;
  attendedEvents: number;
  departments: number;
  events: number;
  trend: { date: string; label: string; count: number }[];
  byCategory: { category: string; count: number }[];
  categoryTotals: Record<string, number>;
  byDepartment: {
    name: string;
    fullName: string;
    accent: string;
    events: number;
    registrations: number;
  }[];
  topEvents: {
    id: string;
    title: string;
    day: number;
    department: string;
    capacity: number;
    registrations: number;
    fill: number;
  }[];
};

export type ScanResult = {
  ok: boolean;
  alreadyAttended: boolean;
  registration: {
    id: string;
    registrationId: string;
    checkedInAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      college: string;
      department: string;
      year: string;
      rollNumber: string;
    };
    events: {
      id: string;
      title: string;
      day: number;
      startTime: string;
      venue: string;
      attended: boolean;
    }[];
  };
  markedEvent: { id: string; title: string; day: number; startTime: string } | null;
};
