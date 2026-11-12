import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { FEST } from "@/lib/fest";

const groups = [
  {
    title: "Explore",
    links: [
      { href: "/events", label: "All events" },
      { href: "/departments", label: "Departments" },
      { href: "/schedule", label: "Schedule" },
      { href: "/#gallery", label: "Gallery" },
    ],
  },
  {
    title: "Participate",
    links: [
      { href: "/register", label: "Register" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/login", label: "Log in" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Festival",
    links: [
      { href: "/sponsors", label: "Sponsors" },
      { href: "/team", label: "The crew" },
      { href: "/contact", label: "Contact" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

const socials = [
  { href: FEST.instagram, label: "Instagram", Icon: Instagram },
  { href: FEST.twitter, label: "X / Twitter", Icon: Twitter },
  { href: FEST.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: FEST.youtube, label: "YouTube", Icon: Youtube },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-950">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.18]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-neon-purple/15 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-neon-magenta/10 blur-[100px]" aria-hidden />

      <div className="container-fest relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">
              {FEST.description}
            </p>

            <div className="mt-6 space-y-2.5 text-sm text-white/55">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" aria-hidden />
                <span>{FEST.venue}</span>
              </p>
              <a href={`mailto:${FEST.email}`} className="flex items-center gap-2.5 hover:text-neon-cyan">
                <Mail className="h-4 w-4 text-neon-cyan" aria-hidden />
                {FEST.email}
              </a>
              <a href={`tel:${FEST.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-neon-cyan">
                <Phone className="h-4 w-4 text-neon-cyan" aria-hidden />
                {FEST.phone}
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">{group.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-white/55 transition hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden" aria-hidden>
          <p className="select-none whitespace-nowrap text-center font-display text-[10.5vw] font-black leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] lg:text-[9rem]">
            suNRIseevent
          </p>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center">
          <p>© 2027 {FEST.college}. Built by students, for students.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/code-of-conduct" className="hover:text-white">Code of conduct</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
              Where code meets carnival
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
