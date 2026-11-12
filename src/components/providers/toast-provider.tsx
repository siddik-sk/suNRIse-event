"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: string; message: string; tone: ToastTone };

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const tones = {
  success: "border-neon-lime/30 text-neon-lime shadow-[0_0_30px_-12px_rgba(163,255,18,.6)]",
  error: "border-neon-magenta/40 text-neon-pink shadow-[0_0_30px_-12px_rgba(255,45,149,.7)]",
  info: "border-neon-cyan/35 text-neon-cyan shadow-[0_0_30px_-12px_rgba(0,240,255,.7)]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 5200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-24 z-[210] flex flex-col items-end gap-3 sm:left-auto sm:right-6 sm:max-w-sm"
      >
        <AnimatePresence>
          {items.map((item) => {
            const Icon = icons[item.tone];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={cn(
                  "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-ink-900/95 px-4 py-3 backdrop-blur-xl",
                  tones[item.tone],
                )}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                <p className="flex-1 text-sm leading-snug text-white/85">{item.message}</p>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((entry) => entry.id !== item.id))}
                  className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
