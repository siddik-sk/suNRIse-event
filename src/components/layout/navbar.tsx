"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, LayoutDashboard, LogOut, Menu, Shield, X } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { cn, initials } from "@/lib/utils";

const links = [
  { href: "/events", label: "Events" },
  { href: "/departments", label: "Departments" },
  { href: "/schedule", label: "Schedule" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useSession();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    await logout();
    toast("Logged out. See you on the grid.", "info");
    window.location.href = "/";
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[135] border-b border-white/5 bg-ink-950/90 backdrop-blur-md">
        <div className="container-fest flex h-7 items-center justify-between overflow-hidden">
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neon-lime align-middle" />
            Registrations open · 19–21 Feb 2027 · NRI Vijayawada
          </p>
          <Link
            href="/register"
            className="hidden shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neon-cyan hover:text-white sm:flex"
          >
            Grab your pass <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <header
        className={cn(
          "fixed inset-x-0 top-7 z-[130] transition-all duration-500",
          scrolled ? "border-b border-white/10 bg-ink-950/80 py-2 backdrop-blur-2xl" : "bg-transparent py-4",
        )}
      >
        <nav className="container-fest flex items-center justify-between gap-6" aria-label="Main navigation">
          <Logo compact className="shrink-0" />

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                    active ? "text-white" : "text-white/55 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-0.5 h-px bg-fest-gradient"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            {loading ? (
              <div className="h-9 w-28 animate-pulse rounded-full bg-white/5" aria-hidden />
            ) : user ? (
              <>
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neon-magenta/30 bg-neon-magenta/[0.07] px-3 text-xs font-medium text-neon-pink transition hover:bg-neon-magenta/15"
                  >
                    <Shield className="h-3.5 w-3.5" /> Admin
                  </Link>
                ) : null}
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-1 pr-3 text-xs font-medium text-white/80 transition hover:border-neon-cyan/30 hover:text-white"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple font-mono text-[10px] font-bold text-white">
                    {initials(user.name)}
                  </span>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-red-300"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button href="/register" size="sm" icon={<ChevronRight className="h-3.5 w-3.5" />}>
                  Register now
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-[68px] z-[125] overflow-y-auto bg-ink-950/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-fest flex min-h-full flex-col py-8">
              <div className="space-y-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between border-b border-white/5 py-4 font-display text-2xl font-semibold tracking-tight text-white/85 hover:text-neon-cyan"
                    >
                      {link.label}
                      <ChevronRight className="h-5 w-5 text-white/20" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple font-mono text-xs font-bold">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-white/40">{user.email}</p>
                      </div>
                    </div>
                    <Button href="/dashboard" className="w-full" icon={<LayoutDashboard className="h-4 w-4" />}>
                      My dashboard
                    </Button>
                    {user.role === "ADMIN" ? (
                      <Button href="/admin" variant="secondary" className="w-full" icon={<Shield className="h-4 w-4" />}>
                        Admin panel
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      className="w-full"
                      icon={<LogOut className="h-4 w-4" />}
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/register" className="w-full">
                      Register for suNRIseevent
                    </Button>
                    <Button href="/login" variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </>
                )}
              </div>

              <p className="mt-auto pt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
                19–21 February 2027 · NRI Vijayawada
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
