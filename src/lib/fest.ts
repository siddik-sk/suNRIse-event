/**
 * Global fest configuration and static editorial content.
 * Everything here is intentionally data-driven so organizers can edit one file.
 */

export const FEST = {
  name: "suNRIseevent",
  year: "'27",
  fullName: "suNRIseevent '27",
  tagline: "Where Code Meets Carnival.",
  description:
    "Three electric days of code, circuits, culture and chaos. suNRIseevent '27 is the annual inter-college techno-cultural festival of NRI University, Agiripalli, near Vijayawada.",
  college: "NRI University",
  collegeShort: "NRI",
  city: "Vijayawada",
  venue: "NRI University, Agiripalli, Vijayawada, Andhra Pradesh",
  venueMapQuery: "NRI University, Agiripalli, Vijayawada, Andhra Pradesh",
  startDate: "2027-02-19T09:00:00+05:30",
  endDate: "2027-02-21T22:00:00+05:30",
  datesLabel: "19–21 February 2027",
  month: "February 2027",
  email: "hello@sunriseevent.in",
  phone: "+91 866 000 2700",
  instagram: "https://instagram.com/",
  twitter: "https://x.com/",
  linkedin: "https://linkedin.com/",
  youtube: "https://youtube.com/",
  registrationClose: "2027-02-15T23:59:59+05:30",
  stats: [
    { value: "12K+", label: "Footfall" },
    { value: "60+", label: "Events" },
    { value: "40+", label: "Colleges" },
    { value: "₹8L", label: "Prize pool" },
  ],
} as const;

export const FEST_DAYS = [
  {
    day: 1,
    date: "2027-02-19",
    label: "Day 01 — IGNITE",
    subtitle: "Opening ceremony, hackathon kickoff and the first wave of technical events.",
  },
  {
    day: 2,
    date: "2027-02-20",
    label: "Day 02 — OVERDRIVE",
    subtitle: "Workshops, robotics arena, design jams and the neon night concert.",
  },
  {
    day: 3,
    date: "2027-02-21",
    label: "Day 03 — AFTERGLOW",
    subtitle: "Finals, pitch showcase, prize ceremony and the closing carnival.",
  },
] as const;

export const HIGHLIGHTS = [
  {
    icon: "code",
    title: "Hack the Grid",
    text: "A 24-hour flagship hackathon with mentors from product studios and a ₹1.5L prize pool.",
    accent: "cyan",
  },
  {
    icon: "bot",
    title: "Robo Arena",
    text: "Battle bots, line followers and autonomous rovers fighting for the arena crown.",
    accent: "magenta",
  },
  {
    icon: "sparkles",
    title: "Neon Nights",
    text: "Live indie acts, DJ sets, projection mapping and a food carnival under the stars.",
    accent: "orange",
  },
  {
    icon: "trophy",
    title: "60+ Events",
    text: "Technical, cultural, non-technical and workshops across fourteen departments.",
    accent: "purple",
  },
] as const;

export const GALLERY = [
  { title: "Hack the Grid", year: "2026", accent: "cyan", tag: "24H HACKATHON", span: "lg:col-span-2 lg:row-span-2" },
  { title: "Robo Arena", year: "2026", accent: "magenta", tag: "BATTLE BOTS", span: "" },
  { title: "Neon Nights", year: "2025", accent: "orange", tag: "LIVE CONCERT", span: "" },
  { title: "Design Jam", year: "2026", accent: "purple", tag: "UI/UX SPRINT", span: "" },
  { title: "Pitch Perfect", year: "2025", accent: "lime", tag: "STARTUP PITCH", span: "" },
] as const;

export const SPONSORS = [
  { name: "QUANTUM BANK", tier: "Title Partner", color: "#00f0ff" },
  { name: "PIXELFORGE", tier: "Powered by", color: "#ff2d95" },
  { name: "NEBULA CLOUD", tier: "Cloud Partner", color: "#8b5cf6" },
  { name: "HEXA LABS", tier: "Innovation Partner", color: "#ff8a00" },
  { name: "ORBIT MOTORS", tier: "Mobility Partner", color: "#a3ff12" },
  { name: "BYTEBREW", tier: "Beverage Partner", color: "#ffc24b" },
  { name: "SYNTHWAVE", tier: "Audio Partner", color: "#ff6ec7" },
  { name: "ASTROTEL", tier: "Connectivity Partner", color: "#3d7bff" },
] as const;

export const FAQS = [
  {
    q: "Who can register for suNRIseevent '27?",
    a: "Any currently enrolled undergraduate or postgraduate student from NRI University or any other recognised college. Bring your college ID to the venue.",
  },
  {
    q: "Is there a registration fee?",
    a: "Entry to the fest and most events is free. A few flagship workshops have a small materials fee, shown on the event page.",
  },
  {
    q: "Can I participate in multiple events?",
    a: "Yes. You can select up to six events during registration and add more later from your dashboard, as long as schedules do not clash.",
  },
  {
    q: "How do I get my pass?",
    a: "After registering, verify your email, log in, and download your QR pass from the dashboard. The same pass works across all three days.",
  },
  {
    q: "What happens if I lose my QR pass?",
    a: "Your pass is always available in your dashboard. It is tied to your account, so you can download it again on any device.",
  },
  {
    q: "Do I need to carry a laptop?",
    a: "For hackathons, coding and design events, yes. Bring your own hardware, chargers and extensions. Robotics teams must bring their own kits.",
  },
  {
    q: "Is accommodation available for outstation students?",
    a: "Limited hostel accommodation is available on a first-come basis. Mention it in the contact form and the hospitality team will reach out.",
  },
  {
    q: "Can I cancel or change my events?",
    a: "Yes, until 15 February 2027. Email hello@sunriseevent.in or visit the help desk. Changes after the deadline depend on capacity.",
  },
] as const;

export const TEAM = [
  { name: "Aarav Menon", role: "Festival Director", dept: "CSE · Final Year", accent: "cyan" },
  { name: "Ishita Rao", role: "Technical Head", dept: "AIML · Final Year", accent: "magenta" },
  { name: "Kabir Sheikh", role: "Events & Operations", dept: "MECH · Final Year", accent: "orange" },
  { name: "Meera Nair", role: "Design & Brand", dept: "CSD · Final Year", accent: "purple" },
  { name: "Rohan Gupta", role: "Sponsorship", dept: "MBA · Final Year", accent: "lime" },
  { name: "Sana Verma", role: "Marketing & PR", dept: "CSM · Final Year", accent: "pink" },
  { name: "Dev Patel", role: "Hospitality", dept: "CIVIL · Final Year", accent: "blue" },
  { name: "Ananya Iyer", role: "Student Welfare", dept: "ECE · Final Year", accent: "amber" },
] as const;

export const DEPARTMENTS_ROWS = [
  { slug: "cse", name: "Computer Science & Engineering", shortName: "CSE", icon: "terminal", accent: "cyan" },
  { slug: "csm", name: "CSE (AI & Machine Learning)", shortName: "CSM", icon: "brain", accent: "magenta" },
  { slug: "csd", name: "Computer Science & Design", shortName: "CSD", icon: "palette", accent: "purple" },
  { slug: "aiml", name: "Artificial Intelligence & Machine Learning", shortName: "AIML", icon: "bot", accent: "orange" },
  { slug: "aids", name: "AI & Data Science", shortName: "AIDS", icon: "database", accent: "lime" },
  { slug: "it", name: "Information Technology", shortName: "IT", icon: "network", accent: "blue" },
  { slug: "ece", name: "Electronics & Communication", shortName: "ECE", icon: "radio", accent: "amber" },
  { slug: "eee", name: "Electrical & Electronics", shortName: "EEE", icon: "zap", accent: "pink" },
  { slug: "mech", name: "Mechanical Engineering", shortName: "MECH", icon: "cog", accent: "cyan" },
  { slug: "civil", name: "Civil Engineering", shortName: "CIVIL", icon: "building", accent: "orange" },
  { slug: "mba", name: "Master of Business Administration", shortName: "MBA", icon: "briefcase", accent: "magenta" },
  { slug: "mca", name: "Master of Computer Applications", shortName: "MCA", icon: "code", accent: "purple" },
  { slug: "biotech", name: "Biotechnology", shortName: "BT", icon: "dna", accent: "lime" },
  { slug: "design", name: "School of Design", shortName: "DESIGN", icon: "pen", accent: "blue" },
] as const;

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"] as const;

export const CATEGORY_LABELS = {
  TECHNICAL: "Technical",
  NON_TECHNICAL: "Non-technical",
  WORKSHOP: "Workshop",
  CULTURAL: "Cultural",
} as const;

export const CATEGORY_COLORS = {
  TECHNICAL: "#00f0ff",
  NON_TECHNICAL: "#ff8a00",
  WORKSHOP: "#a3ff12",
  CULTURAL: "#ff2d95",
} as const;
