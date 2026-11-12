"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Shield,
  UserCog,
  X,
} from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "My events", icon: CalendarDays },
  { href: "/dashboard/pass", label: "My pass", icon: QrCode },
  { href: "/dashboard/profile", label: "Profile", icon: UserCog },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    await logout();
    toast("Logged out. Your pass is safe in your inbox.", "info");
    router.replace("/");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center" role="status" aria-live="polite">
          <span className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-neon-cyan" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
            {loading ? "Opening your dashboard" : "Redirecting to login"}
          </p>
        </div>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[68px] items-center justify-between border-b border-white/10 px-5">
        <Logo compact />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-full text-white/40 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple font-mono text-xs font-bold text-white">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/90">{user.name}</p>
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
              {user.role === "ADMIN" ? "Organizer" : user.rollNumber}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "border border-neon-cyan/25 bg-neon-cyan/[0.07] text-neon-cyan"
                  : "border border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan" /> : null}
            </Link>
          );
        })}

        {user.role === "ADMIN" ? (
          <Link
            href="/admin"
            className="mt-2 flex items-center gap-3 rounded-xl border border-neon-magenta/25 bg-neon-magenta/[0.06] px-3 py-2.5 text-[13px] font-medium text-neon-pink transition hover:bg-neon-magenta/10"
          >
            <Shield className="h-4 w-4" /> Admin panel
          </Link>
        ) : null}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/45 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to fest site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/45 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
        <p className="px-3 pt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/20">
          suNRIseevent &apos;27 · 19–21 Feb
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-ink-950/95 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-ink-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="h-full w-[17rem] border-r border-white/10 bg-ink-950"
            >
              {sidebar}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-white/10 bg-ink-950/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
              aria-label="Open dashboard menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="lg:hidden">
              <Logo compact />
            </div>
            <div className="hidden lg:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">Student console</p>
              <p className="text-sm font-semibold text-white/85">
                {navItems.find((item) => item.href === pathname)?.label ?? "Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-neon-lime/25 bg-neon-lime/[0.05] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-neon-lime sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-lime" /> Pass active
            </span>
            <Link
              href="/dashboard/pass"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/75 transition hover:border-neon-cyan/30 hover:text-white"
            >
              <QrCode className="h-3.5 w-3.5" /> QR pass
            </Link>
          </div>
        </header>

        {!user.emailVerified ? (
          <div className="border-b border-neon-amber/20 bg-neon-amber/[0.06] px-4 py-2.5 text-center text-xs text-neon-amber sm:px-6">
            Your email is not verified yet.{" "}
            <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`} className="font-semibold underline">
              Resend the verification link
            </Link>
            .
          </div>
        ) : null}

        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>

        <footer className="border-t border-white/10 px-4 py-6 text-center sm:px-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
            suNRIseevent &apos;27 · NRI University · Vijayawada
          </p>
        </footer>
      </div>
    </div>
  );
}
