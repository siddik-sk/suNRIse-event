/* eslint-disable no-console */
import { EventCategory, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  { slug: "cse", name: "Computer Science & Engineering", shortName: "CSE", accent: "cyan", icon: "terminal", tagline: "Ship it before the caffeine runs out.", description: "Algorithms, systems, open source and a 24-hour hackathon that will test everything you know." },
  { slug: "csm", name: "CSE (AI & Machine Learning)", shortName: "CSM", accent: "magenta", icon: "brain", tagline: "Models that talk back.", description: "LLM engineering, applied ML and prompt craft for people who like their code probabilistic." },
  { slug: "csd", name: "Computer Science & Design", shortName: "CSD", accent: "purple", icon: "palette", tagline: "Design systems, not just screens.", description: "Where interface craft meets front-end engineering. Expect design jams, critiques and prototypes." },
  { slug: "aiml", name: "Artificial Intelligence & Machine Learning", shortName: "AIML", accent: "orange", icon: "bot", tagline: "Teach machines to see.", description: "Computer vision, deep learning and model ops challenges built for curious builders." },
  { slug: "aids", name: "AI & Data Science", shortName: "AIDS", accent: "lime", icon: "database", tagline: "Data is the new neon.", description: "Dashboards, pipelines and prediction battles on messy, real-world datasets." },
  { slug: "it", name: "Information Technology", shortName: "IT", accent: "blue", icon: "network", tagline: "Own the stack, defend the flag.", description: "Cyber security, cloud and infrastructure challenges for the people who keep the internet up." },
  { slug: "ece", name: "Electronics & Communication", shortName: "ECE", accent: "amber", icon: "radio", tagline: "Signals over noise.", description: "Circuits, RF, embedded systems and hardware sprints that spark — literally." },
  { slug: "eee", name: "Electrical & Electronics", shortName: "EEE", accent: "pink", icon: "zap", tagline: "High voltage, higher stakes.", description: "Robotics, drones and clean-energy hacks for makers who like to play with power." },
  { slug: "mech", name: "Mechanical Engineering", shortName: "MECH", accent: "cyan", icon: "cog", tagline: "Build things that move.", description: "Battle bots, CAD battles and fabrication sprints in the loudest hall on campus." },
  { slug: "civil", name: "Civil Engineering", shortName: "CIVIL", accent: "orange", icon: "building", tagline: "Design what lasts.", description: "Structural challenges, smart cities and sustainable construction for future builders." },
  { slug: "mba", name: "Master of Business Administration", shortName: "MBA", accent: "magenta", icon: "briefcase", tagline: "Pitch, pivot, repeat.", description: "Startup pitches, brand sprints and case competitions judged by real operators." },
  { slug: "mca", name: "Master of Computer Applications", shortName: "MCA", accent: "purple", icon: "code", tagline: "Full-stack, full send.", description: "App sprints, API duels and shipping under pressure for postgraduate builders." },
  { slug: "biotech", name: "Biotechnology", shortName: "BT", accent: "lime", icon: "dna", tagline: "Hack life itself.", description: "Bioinformatics, synthetic biology and the science track of the fest." },
  { slug: "design", name: "School of Design", shortName: "DESIGN", accent: "blue", icon: "pen", tagline: "Make it loud. Make it beautiful.", description: "Poster battles, motion labs and a runway show powered by recycled tech." },
] as const;

type SeedEvent = {
  dept: string;
  title: string;
  slug: string;
  category: EventCategory;
  day: number;
  start: string;
  end: string;
  venue: string;
  prize: string;
  description: string;
  team: string;
  fee?: number;
  capacity?: number;
  featured?: boolean;
  rules?: string[];
};

const E = EventCategory;
const EVENTS: SeedEvent[] = [
  { dept: "cse", title: "Hack the Grid", slug: "hack-the-grid", category: E.TECHNICAL, day: 1, start: "10:00", end: "18:00", venue: "Innovation Lab, Block C", prize: "₹1,50,000", description: "The flagship 24-hour hackathon. Build a working product around the theme 'Rebuild the Everyday' with mentors from product studios and a final demo on the main stage.", team: "2-4", capacity: 240, featured: true, rules: ["Teams of 2–4; at least one member must be present at all checkpoints.", "Bring your own laptops, chargers and extension cords.", "All code must be written during the event; open-source libraries are allowed."] },
  { dept: "cse", title: "Code Sprint", slug: "code-sprint", category: E.TECHNICAL, day: 2, start: "10:00", end: "13:00", venue: "Lab 302, Block B", prize: "₹25,000", description: "Three hours, twelve algorithmic problems, one leaderboard. Individual competitive programming with ICPC-style scoring.", team: "1", capacity: 120, rules: ["Individual participation only.", "No external help, AI tools or pre-written solutions.", "Languages: C++, Java, Python, Go."] },
  { dept: "cse", title: "Git Good: Open Source Workshop", slug: "git-good-workshop", category: E.WORKSHOP, day: 3, start: "10:00", end: "12:00", venue: "Seminar Hall 2", prize: "Certificates + swag", description: "A hands-on workshop on branching, rebasing, code review and making your first meaningful open-source contribution.", team: "1", capacity: 80, fee: 99 },
  { dept: "csm", title: "Prompt Royale", slug: "prompt-royale", category: E.TECHNICAL, day: 2, start: "14:00", end: "17:00", venue: "AI Studio, Block D", prize: "₹30,000", description: "A live prompt-engineering battle. Teams receive messy business briefs and must ship the best model-powered solution before the buzzer.", team: "2", capacity: 80, rules: ["Only the provided model endpoints may be used.", "Prompts must be written live; no pre-baked answers.", "Judged on output quality, reliability and creativity."] },
  { dept: "csm", title: "Model Forge", slug: "model-forge", category: E.TECHNICAL, day: 1, start: "13:00", end: "17:00", venue: "AI Studio, Block D", prize: "₹20,000", description: "Fine-tune, evaluate and deploy a compact language model on a surprise dataset. Best accuracy-to-latency ratio wins.", team: "2-3", capacity: 60 },
  { dept: "csm", title: "LLM Ops Bootcamp", slug: "llm-ops-bootcamp", category: E.WORKSHOP, day: 3, start: "13:00", end: "16:00", venue: "Lab 401, Block B", prize: "Certificates", description: "Production patterns for retrieval, evaluation, guardrails and cost control in LLM applications.", team: "1", capacity: 60, fee: 149 },
  { dept: "csd", title: "Design Jam", slug: "design-jam", category: E.TECHNICAL, day: 2, start: "10:00", end: "18:00", venue: "Design Studio, Block A", prize: "₹40,000", description: "An eight-hour product design sprint: research, wireframe, prototype and pitch a solution for a real campus problem.", team: "2-3", capacity: 90, featured: true },
  { dept: "csd", title: "Figma to Frame", slug: "figma-to-frame", category: E.WORKSHOP, day: 1, start: "14:00", end: "17:00", venue: "Design Studio, Block A", prize: "Certificates", description: "Turn a Figma file into a polished, responsive React page. We cover tokens, motion and accessibility.", team: "1", capacity: 50, fee: 99 },
  { dept: "csd", title: "UX Roast", slug: "ux-roast", category: E.NON_TECHNICAL, day: 3, start: "11:00", end: "13:00", venue: "Auditorium 2", prize: "₹10,000", description: "Brutally honest, extremely funny critiques of real apps. Come defend your favourite interface — or roast it.", team: "1", capacity: 120 },
  { dept: "aiml", title: "Neural Knockout", slug: "neural-knockout", category: E.TECHNICAL, day: 1, start: "11:00", end: "15:00", venue: "AI Lab 2, Block D", prize: "₹35,000", description: "Head-to-head model training on a hidden dataset. You get one GPU, one hour and no second chances.", team: "2", capacity: 64 },
  { dept: "aiml", title: "Vision Quest", slug: "vision-quest", category: E.TECHNICAL, day: 2, start: "10:00", end: "14:00", venue: "AI Lab 2, Block D", prize: "₹25,000", description: "Build the best computer-vision pipeline for a surprise real-world task: detection, tracking or segmentation.", team: "2-3", capacity: 60 },
  { dept: "aiml", title: "Kaggle Clinic", slug: "kaggle-clinic", category: E.WORKSHOP, day: 3, start: "09:00", end: "12:00", venue: "Seminar Hall 1", prize: "Certificates", description: "A practical clinic on feature engineering, validation strategy and squeezing the last 2% out of a leaderboard.", team: "1", capacity: 100 },
  { dept: "aids", title: "DataDuel", slug: "dataduel", category: E.TECHNICAL, day: 1, start: "14:00", end: "18:00", venue: "Data Lab, Block D", prize: "₹30,000", description: "A four-hour analytics battle. Clean the messiest dataset on campus, find the story, and defend your insights.", team: "2", capacity: 80 },
  { dept: "aids", title: "Dashboard Derby", slug: "dashboard-derby", category: E.TECHNICAL, day: 2, start: "11:00", end: "15:00", venue: "Data Lab, Block D", prize: "₹20,000", description: "Design and ship an interactive dashboard that makes a complex public dataset genuinely understandable.", team: "2", capacity: 60 },
  { dept: "aids", title: "SQL Under Pressure", slug: "sql-under-pressure", category: E.WORKSHOP, day: 3, start: "10:00", end: "12:00", venue: "Lab 205, Block B", prize: "Certificates", description: "Window functions, query plans and the art of making Postgres do the heavy lifting.", team: "1", capacity: 80 },
  { dept: "it", title: "Capture The Flag", slug: "capture-the-flag", category: E.TECHNICAL, day: 1, start: "18:00", end: "22:00", venue: "Cyber Range, Block C", prize: "₹50,000", description: "A four-hour jeopardy-style CTF spanning web, crypto, forensics, reverse engineering and a little chaos.", team: "2-3", capacity: 120, featured: true, rules: ["No attacking infrastructure outside the provided range.", "Flag sharing between teams is disqualifying.", "Bring your own laptop and a wired/wireless adapter if you have one."] },
  { dept: "it", title: "Cloud Native Bootcamp", slug: "cloud-native-bootcamp", category: E.WORKSHOP, day: 2, start: "09:00", end: "12:00", venue: "Cloud Lab, Block C", prize: "Certificates", description: "Containers, Kubernetes and a zero-downtime deployment — from laptop to cluster in three hours.", team: "1", capacity: 60, fee: 149 },
  { dept: "it", title: "Bug Bounty Bootcamp", slug: "bug-bounty-bootcamp", category: E.WORKSHOP, day: 3, start: "14:00", end: "17:00", venue: "Cyber Range, Block C", prize: "Certificates", description: "Learn a repeatable recon-to-report workflow from working bug bounty hunters, then practise on a safe target.", team: "1", capacity: 50 },
  { dept: "ece", title: "Circuit Sprints", slug: "circuit-sprints", category: E.TECHNICAL, day: 1, start: "10:00", end: "14:00", venue: "Electronics Lab 1", prize: "₹25,000", description: "Given a schematic and a parts box, build, debug and demonstrate a working circuit fastest.", team: "2", capacity: 60 },
  { dept: "ece", title: "Signal Quest", slug: "signal-quest", category: E.TECHNICAL, day: 2, start: "13:00", end: "17:00", venue: "Electronics Lab 2", prize: "₹20,000", description: "Decode, filter and reconstruct signals hidden in noise. DSP fundamentals meet a live scoreboard.", team: "2", capacity: 50 },
  { dept: "ece", title: "PCB Design Lab", slug: "pcb-design-lab", category: E.WORKSHOP, day: 3, start: "09:00", end: "13:00", venue: "Electronics Lab 1", prize: "Certificates + PCB", description: "Go from schematic to routed, manufacturable PCB in one morning. Take your board home.", team: "1", capacity: 40, fee: 199 },
  { dept: "eee", title: "Robo Race", slug: "robo-race", category: E.TECHNICAL, day: 2, start: "09:00", end: "13:00", venue: "Robotics Arena, Ground", prize: "₹45,000", description: "Line-following robots race a twisting neon track. Fastest clean run takes the crown.", team: "2-4", capacity: 80, featured: true, rules: ["Robots must fit within 25×25×25 cm.", "Max 12V power supply.", "Three runs; best time counts. Repairs allowed between runs."] },
  { dept: "eee", title: "Drone Dash", slug: "drone-dash", category: E.TECHNICAL, day: 1, start: "13:00", end: "17:00", venue: "Open Ground, North", prize: "₹35,000", description: "A timed FPV obstacle course for micro drones. Precision beats speed — but speed helps.", team: "1-2", capacity: 40 },
  { dept: "eee", title: "EV Clinic", slug: "ev-clinic", category: E.WORKSHOP, day: 3, start: "10:00", end: "13:00", venue: "Energy Lab", prize: "Certificates", description: "Battery packs, motor controllers and the safety rules that actually matter when building electric vehicles.", team: "1", capacity: 60 },
  { dept: "mech", title: "Battle Bots", slug: "battle-bots", category: E.TECHNICAL, day: 1, start: "09:00", end: "17:00", venue: "Mech Arena, Hangar", prize: "₹80,000", description: "The loudest event of the fest. Build a combat robot within the weight class and survive the double-elimination bracket.", team: "3-5", capacity: 64, featured: true, rules: ["Weight limit: 8 kg (including battery).", "No flammable, explosive or liquid projectiles.", "Judges' safety inspection is mandatory before the first bout."] },
  { dept: "mech", title: "CAD Clash", slug: "cad-clash", category: E.TECHNICAL, day: 2, start: "10:00", end: "14:00", venue: "CAD Lab, Block E", prize: "₹20,000", description: "A timed 3D modelling challenge judged on geometry, tolerance and manufacturability — not just looks.", team: "1", capacity: 50 },
  { dept: "mech", title: "3D Print Sprint", slug: "3d-print-sprint", category: E.WORKSHOP, day: 3, start: "09:00", end: "12:00", venue: "Fab Lab", prize: "Certificates + print", description: "Design for additive manufacturing, slice your model, and print a functional part before lunch.", team: "1", capacity: 30, fee: 149 },
  { dept: "civil", title: "Bridge the Gap", slug: "bridge-the-gap", category: E.TECHNICAL, day: 1, start: "10:00", end: "15:00", venue: "Structures Lab", prize: "₹30,000", description: "Design and build a load-bearing bridge from limited materials. The strongest span-to-weight ratio wins.", team: "2-3", capacity: 60 },
  { dept: "civil", title: "City of Tomorrow", slug: "city-of-tomorrow", category: E.TECHNICAL, day: 2, start: "10:00", end: "16:00", venue: "Planning Studio", prize: "₹25,000", description: "A six-hour urban design charrette: mobility, water, density and climate resilience for a real Vijayawada ward.", team: "3-4", capacity: 48 },
  { dept: "civil", title: "BIM Workshop", slug: "bim-workshop", category: E.WORKSHOP, day: 3, start: "10:00", end: "13:00", venue: "CAD Lab, Block E", prize: "Certificates", description: "Building information modelling from first principles: model, coordinate, clash-detect, hand over.", team: "1", capacity: 50 },
  { dept: "mba", title: "Pitch Perfect", slug: "pitch-perfect", category: E.NON_TECHNICAL, day: 1, start: "11:00", end: "15:00", venue: "Board Room, Block A", prize: "₹50,000", description: "Sixty seconds to hook the room, five minutes to secure the cheque. A startup pitch competition with real investors on the panel.", team: "2-3", capacity: 60, featured: true },
  { dept: "mba", title: "Shark Tank: Campus Edition", slug: "shark-tank-campus", category: E.NON_TECHNICAL, day: 2, start: "10:00", end: "14:00", venue: "Board Room, Block A", prize: "₹30,000", description: "Teams defend a business case against a panel that will interrupt, challenge and negotiate every number.", team: "2-3", capacity: 50 },
  { dept: "mba", title: "Brand Sprint", slug: "brand-sprint", category: E.WORKSHOP, day: 3, start: "10:00", end: "13:00", venue: "Seminar Hall 2", prize: "Certificates", description: "Positioning, naming, voice and a one-page brand system for an absurdly difficult fake product.", team: "1", capacity: 60 },
  { dept: "mca", title: "App Sprint", slug: "app-sprint", category: E.TECHNICAL, day: 2, start: "09:00", end: "13:00", venue: "Lab 304, Block B", prize: "₹25,000", description: "Ship a working mobile app in four hours. Offline-first, accessible and genuinely useful.", team: "2", capacity: 60 },
  { dept: "mca", title: "API Arena", slug: "api-arena", category: E.TECHNICAL, day: 1, start: "14:00", end: "18:00", venue: "Lab 306, Block B", prize: "₹20,000", description: "Design and implement a resilient API against a live, misbehaving client. Rate limits, idempotency and graceful failure matter.", team: "2", capacity: 50 },
  { dept: "mca", title: "Flutter Forward", slug: "flutter-forward", category: E.WORKSHOP, day: 3, start: "09:00", end: "12:00", venue: "Lab 304, Block B", prize: "Certificates", description: "Build a polished cross-platform app with animations, theming and offline storage in one sitting.", team: "1", capacity: 60, fee: 99 },
  { dept: "biotech", title: "BioHack", slug: "biohack", category: E.TECHNICAL, day: 1, start: "10:00", end: "16:00", venue: "Biotech Lab", prize: "₹25,000", description: "A wet-lab and computational sprint solving a real healthcare problem with a synthetic biology lens.", team: "2-4", capacity: 40 },
  { dept: "biotech", title: "Gene IQ", slug: "gene-iq", category: E.NON_TECHNICAL, day: 2, start: "11:00", end: "14:00", venue: "Seminar Hall 3", prize: "₹10,000", description: "A rapid-fire quiz on genetics, biotech history and the ethics of editing life.", team: "2", capacity: 60 },
  { dept: "biotech", title: "CRISPR Clinic", slug: "crispr-clinic", category: E.WORKSHOP, day: 3, start: "10:00", end: "13:00", venue: "Biotech Lab", prize: "Certificates", description: "A guided, safety-first look at CRISPR workflows, off-target analysis and responsible research.", team: "1", capacity: 35 },
  { dept: "design", title: "Poster Combat", slug: "poster-combat", category: E.CULTURAL, day: 1, start: "10:00", end: "14:00", venue: "Design Studio, Block A", prize: "₹15,000", description: "A four-hour poster battle on a surprise brief. Type, colour and concept — no stock photos allowed.", team: "1", capacity: 60 },
  { dept: "design", title: "Neon Runway", slug: "neon-runway", category: E.CULTURAL, day: 2, start: "18:00", end: "21:00", venue: "Main Stage", prize: "₹40,000", description: "A sustainable tech-couture runway show. Outfits must be built from at least 60% recycled or e-waste materials.", team: "2-6", capacity: 40, featured: true },
  { dept: "design", title: "Motion Lab", slug: "motion-lab", category: E.WORKSHOP, day: 3, start: "11:00", end: "14:00", venue: "Design Studio, Block A", prize: "Certificates", description: "Kinetic typography, easing and scroll-driven motion. Build a 15-second title sequence that moves.", team: "1", capacity: 50 },
  { dept: "cse", title: "Valorant Showdown", slug: "valorant-showdown", category: E.NON_TECHNICAL, day: 3, start: "10:00", end: "18:00", venue: "Gaming Arena", prize: "₹30,000", description: "Five-a-side tactical shooter tournament. Bring your own peripherals; we bring the LAN.", team: "5", capacity: 80 },
  { dept: "design", title: "Neon Nights Concert", slug: "neon-nights-concert", category: E.CULTURAL, day: 2, start: "19:30", end: "22:00", venue: "Main Stage", prize: "Entry with fest pass", description: "The festival headliner: live indie acts, a DJ set and projection mapping across the main quad.", team: "1", capacity: 2000, featured: true },
  { dept: "cse", title: "Stand-up Circuit", slug: "stand-up-circuit", category: E.CULTURAL, day: 1, start: "17:00", end: "19:00", venue: "Open Air Theatre", prize: "₹15,000", description: "Student stand-up with a five-minute limit and a merciless light. Bring original material only.", team: "1", capacity: 100 },
  { dept: "csd", title: "Photography Walk", slug: "photography-walk", category: E.CULTURAL, day: 1, start: "08:00", end: "10:00", venue: "Campus Quad", prize: "₹10,000", description: "A dawn photo walk across campus. Submit your best five frames by noon; prints judged by a working photographer.", team: "1", capacity: 60 },
  { dept: "mba", title: "Dance Off", slug: "dance-off", category: E.CULTURAL, day: 3, start: "15:00", end: "18:00", venue: "Main Stage", prize: "₹35,000", description: "Crew against crew. Open style, three-minute sets, and a crowd that decides the tie-break.", team: "4-10", capacity: 80 },
];

const COORDINATORS = [
  [
    { name: "Aarav Menon", phone: "9876543210" },
    { name: "Ishita Rao", phone: "9812345678" },
  ],
  [
    { name: "Kabir Sheikh", phone: "9823456781" },
    { name: "Meera Nair", phone: "9834567892" },
  ],
];

async function main() {
  console.log("Seeding suNRIseevent '27…");

  const deptIds = new Map<string, string>();
  for (let i = 0; i < DEPARTMENTS.length; i += 1) {
    const dept = DEPARTMENTS[i];
    const row = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {
        name: dept.name,
        shortName: dept.shortName,
        description: dept.description,
        tagline: dept.tagline,
        accent: dept.accent,
        icon: dept.icon,
        sortOrder: i,
        isActive: true,
      },
      create: {
        slug: dept.slug,
        name: dept.name,
        shortName: dept.shortName,
        description: dept.description,
        tagline: dept.tagline,
        accent: dept.accent,
        icon: dept.icon,
        sortOrder: i,
      },
    });
    deptIds.set(dept.slug, row.id);
  }
  console.log(`  ✓ ${DEPARTMENTS.length} departments`);

  for (let i = 0; i < EVENTS.length; i += 1) {
    const event = EVENTS[i];
    const departmentId = deptIds.get(event.dept);
    if (!departmentId) throw new Error(`Unknown department ${event.dept}`);
    const rules =
      event.rules ??
      [
        "Carry a valid college ID and your suNRIseevent QR pass.",
        "Reach the venue 15 minutes before the scheduled start.",
        "Judges' decisions are final; maintain the fest code of conduct.",
      ];
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        description: event.description,
        category: event.category,
        departmentId,
        day: event.day,
        startTime: event.start,
        endTime: event.end,
        venue: event.venue,
        prize: event.prize,
        rules,
        coordinators: COORDINATORS[i % COORDINATORS.length],
        capacity: event.capacity ?? 100,
        teamSize: event.team,
        fee: event.fee ?? 0,
        isFeatured: event.featured ?? false,
        isActive: true,
      },
      create: {
        slug: event.slug,
        title: event.title,
        description: event.description,
        category: event.category,
        departmentId,
        day: event.day,
        startTime: event.start,
        endTime: event.end,
        venue: event.venue,
        prize: event.prize,
        rules,
        coordinators: COORDINATORS[i % COORDINATORS.length],
        capacity: event.capacity ?? 100,
        teamSize: event.team,
        fee: event.fee ?? 0,
        isFeatured: event.featured ?? false,
      },
    });
  }
  console.log(`  ✓ ${EVENTS.length} events`);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@sunriseevent.in").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@Sunrise27";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: Role.ADMIN,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "NRI Fest Admin",
      phone: "9876500000",
      college: "NRI University",
      department: "Administration",
      year: "PG",
      rollNumber: "NRIADMIN27",
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const studentEmail = (process.env.SEED_STUDENT_EMAIL || "student@sunriseevent.in").toLowerCase();
  const studentPassword = process.env.SEED_STUDENT_PASSWORD || "Student@Sunrise27";
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      passwordHash: await bcrypt.hash(studentPassword, 12),
      emailVerified: true,
    },
    create: {
      email: studentEmail,
      passwordHash: await bcrypt.hash(studentPassword, 12),
      name: "Riya Sharma",
      phone: "9876512345",
      college: "NRI University",
      department: "CSE (AI & Machine Learning)",
      year: "3rd Year",
      rollNumber: "22NRI1CS087",
      role: Role.STUDENT,
      emailVerified: true,
    },
  });

  // Demo pass + three event registrations, useful for testing dashboard/scanner.
  const demoEvents = await prisma.event.findMany({
    where: { slug: { in: ["hack-the-grid", "design-jam", "neon-nights-concert"] } },
    select: { id: true },
  });
  const registration = await prisma.registration.upsert({
    where: { userId: student.id },
    update: {
      status: "CONFIRMED",
      registrationId: "SUN27-DEMO01",
      qrToken: "demo-qr-token-sunriseevent-2027-abcdef",
    },
    create: {
      userId: student.id,
      registrationId: "SUN27-DEMO01",
      qrToken: "demo-qr-token-sunriseevent-2027-abcdef",
    },
  });
  await prisma.eventRegistration.deleteMany({ where: { registrationId: registration.id } });
  await prisma.eventRegistration.createMany({
    data: demoEvents.map((event) => ({ registrationId: registration.id, eventId: event.id })),
  });

  console.log("  ✓ admin + demo student + demo pass");
  console.log("\nSeed complete. Demo credentials:");
  console.log(`  Admin:   ${adminEmail} / ${adminPassword}`);
  console.log(`  Student: ${studentEmail} / ${studentPassword}`);
  console.log("  Demo QR: SUNRISE27:demo-qr-token-sunriseevent-2027-abcdef");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
