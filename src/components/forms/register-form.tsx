"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, PasswordInput, Select } from "@/components/ui/form";
import { Turnstile } from "@/components/forms/turnstile";
import { useToast } from "@/components/providers/toast-provider";
import { ApiClientError, apiFetch, fieldErrorsFrom } from "@/lib/client-api";
import { CATEGORY_COLORS, CATEGORY_LABELS, FEST } from "@/lib/fest";
import {
  registerAcademicSchema,
  registerIdentitySchema,
  registerSchema,
  YEAR_VALUES,
} from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

export type RegisterEventOption = {
  id: string;
  slug: string;
  title: string;
  category: keyof typeof CATEGORY_LABELS;
  day: number;
  startTime: string;
  endTime: string;
  venue: string;
  fee: number;
  capacity: number;
  teamSize: string;
  department: string;
  departmentShort: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  college: string;
  department: string;
  year: (typeof YEAR_VALUES)[number];
  rollNumber: string;
  acceptTerms: boolean;
};

const STEPS = [
  { label: "Identity", hint: "Your account", icon: UserRound },
  { label: "Academics", hint: "College details", icon: GraduationCap },
  { label: "Events", hint: "Pick your track", icon: CalendarDays },
  { label: "Review", hint: "Confirm & pass", icon: ClipboardCheck },
] as const;

const MAX_EVENTS = 6;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];

const categoryTone: Record<keyof typeof CATEGORY_LABELS, string> = {
  TECHNICAL: "border-neon-cyan/30 bg-neon-cyan/[0.07] text-neon-cyan",
  NON_TECHNICAL: "border-neon-orange/30 bg-neon-orange/[0.07] text-neon-amber",
  WORKSHOP: "border-neon-lime/30 bg-neon-lime/[0.07] text-neon-lime",
  CULTURAL: "border-neon-magenta/30 bg-neon-magenta/[0.07] text-neon-pink",
};

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Client-side mirror of the server's clash rule, for instant feedback. */
function findClash(events: RegisterEventOption[]): string | null {
  const sorted = [...events].sort((a, b) => a.day - b.day || toMinutes(a.startTime) - toMinutes(b.startTime));
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      if (sorted[i].day !== sorted[j].day) continue;
      if (toMinutes(sorted[j].startTime) < toMinutes(sorted[i].endTime)) {
        return `${sorted[i].title} and ${sorted[j].title} overlap on Day ${sorted[i].day}. Pick one of them.`;
      }
    }
  }
  return null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RegisterForm({ events }: { events: RegisterEventOption[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    college: "",
    department: "",
    year: "1st Year",
    rollNumber: "",
    acceptTerms: false,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [collegeId, setCollegeId] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterDay, setFilterDay] = useState("ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const selectedEvents = useMemo(
    () => selectedIds.map((id) => events.find((event) => event.id === id)).filter(Boolean) as RegisterEventOption[],
    [selectedIds, events],
  );
  const clash = useMemo(() => findClash(selectedEvents), [selectedEvents]);
  const totalFee = useMemo(() => selectedEvents.reduce((sum, event) => sum + event.fee, 0), [selectedEvents]);

  const departmentOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const event of events) {
      if (!seen.has(event.department)) seen.set(event.department, event.departmentShort);
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      if (filterCategory !== "ALL" && event.category !== filterCategory) return false;
      if (filterDay !== "ALL" && event.day !== Number(filterDay)) return false;
      if (filterDepartment !== "ALL" && event.department !== filterDepartment) return false;
      if (!term) return true;
      return [event.title, event.venue, event.department, event.departmentShort, CATEGORY_LABELS[event.category]]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [events, filterCategory, filterDay, filterDepartment, query]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function issuesToErrors(issues: readonly { path: (string | number)[]; message: string }[]) {
    const next: Record<string, string> = {};
    for (const issue of issues) {
      const key = issue.path.join(".") || "form";
      if (!next[key]) next[key] = issue.message;
    }
    return next;
  }

  function pickFile(file: File | null | undefined) {
    setFileError("");
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFileError("Upload a JPG, PNG or PDF file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("The file is larger than 5 MB. Compress it and try again.");
      return;
    }
    setCollegeId(file);
  }

  function toggleEvent(event: RegisterEventOption) {
    setErrors((previous) => {
      if (!previous.eventIds) return previous;
      const next = { ...previous };
      delete next.eventIds;
      return next;
    });
    setSelectedIds((previous) => {
      if (previous.includes(event.id)) return previous.filter((id) => id !== event.id);
      if (previous.length >= MAX_EVENTS) {
        toast(`You can select up to ${MAX_EVENTS} events.`, "info");
        return previous;
      }
      return [...previous, event.id];
    });
  }

  function validateStep(index: number): boolean {
    setError(null);
    setErrorCode(undefined);

    if (index === 0) {
      const parsed = registerIdentitySchema.safeParse(form);
      if (!parsed.success) {
        setErrors(issuesToErrors(parsed.error.issues));
        return false;
      }
      return true;
    }

    if (index === 1) {
      const parsed = registerAcademicSchema.safeParse(form);
      if (!parsed.success) {
        setErrors(issuesToErrors(parsed.error.issues));
        return false;
      }
      if (!collegeId) {
        setFileError("Upload your college ID to continue.");
        return false;
      }
      return true;
    }

    if (index === 2) {
      if (selectedIds.length === 0) {
        setErrors({ eventIds: "Select at least one event to continue." });
        return false;
      }
      if (selectedIds.length > MAX_EVENTS) {
        setErrors({ eventIds: `Select no more than ${MAX_EVENTS} events.` });
        return false;
      }
      if (clash) {
        setErrors({ eventIds: clash });
        return false;
      }
      return true;
    }

    return true;
  }

  function next() {
    setErrors({});
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setErrorCode(undefined);
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorCode(undefined);

    const payload = {
      ...form,
      eventIds: selectedIds,
      turnstileToken,
    };
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = issuesToErrors(parsed.error.issues);
      setErrors(fieldErrors);

      const target = Object.keys(fieldErrors).some((key) =>
        ["name", "email", "phone", "password", "confirmPassword"].includes(key),
      )
        ? 0
        : Object.keys(fieldErrors).some((key) =>
              ["college", "department", "year", "rollNumber"].includes(key),
            )
          ? 1
          : Object.keys(fieldErrors).some((key) => key === "eventIds")
            ? 2
            : 3;

      if (!collegeId) {
        setFileError("Upload your college ID to continue.");
        setStep(1);
        return;
      }
      setStep(target);
      setError("Please check the highlighted fields before submitting.");
      return;
    }

    if (!collegeId) {
      setFileError("Upload your college ID to continue.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("data", JSON.stringify(parsed.data));
      body.append("collegeId", collegeId);

      const data = await apiFetch<{ email: string; registrationId: string }>("/api/auth/register", {
        method: "POST",
        formData: body,
      });

      toast("Pass created. Check your inbox to verify your email.", "success");
      router.push(
        `/register/success?email=${encodeURIComponent(data.email)}&id=${encodeURIComponent(data.registrationId)}`,
      );
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setError(caught.message);
        setErrorCode(caught.code);
        const fieldErrors = fieldErrorsFrom(caught);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          if (fieldErrors.college || fieldErrors.department || fieldErrors.year || fieldErrors.rollNumber) {
            setStep(1);
          } else if (fieldErrors.eventIds) {
            setStep(2);
          }
        }
      } else {
        setError("Could not create your pass. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">Registration · {FEST.fullName}</p>
        <h1 className="mt-4 text-balance font-display text-4xl font-black leading-[1.02] text-white sm:text-5xl">
          Build your <span className="text-gradient">fest identity.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/50 sm:text-base">
          One form, one QR pass, three days of events. Pick your events now and add more later from your
          dashboard.
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Registration progress">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          const complete = index < step;
          const active = index === step;
          return (
            <li
              key={item.label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors",
                active
                  ? "border-neon-cyan/40 bg-neon-cyan/[0.07]"
                  : complete
                    ? "border-neon-lime/25 bg-neon-lime/[0.04]"
                    : "border-white/10 bg-white/[0.02]",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs",
                  active
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : complete
                      ? "border-neon-lime/40 bg-neon-lime/10 text-neon-lime"
                      : "border-white/10 bg-white/[0.04] text-white/40",
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-white/85">{item.label}</span>
                <span className="block truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                  {active ? "In progress" : complete ? "Done" : item.hint}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-fest-gradient"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <form onSubmit={onSubmit} noValidate className="neon-frame rounded-3xl p-5 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -18 }}
              transition={{ duration: reduce ? 0 : 0.24, ease: "easeOut" }}
            >
              {step === 0 ? (
                <section aria-labelledby="step-identity">
                  <StepHeader
                    id="step-identity"
                    icon={UserRound}
                    title="Who's behind the handle?"
                    description="This becomes your suNRIseevent account. Use an email you check often — verification and your pass land there."
                  />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" error={errors.name} required className="sm:col-span-2">
                      {(props) => (
                        <Input
                          {...props}
                          autoComplete="name"
                          placeholder="Aarav Menon"
                          value={form.name}
                          onChange={(event) => update("name", event.target.value)}
                          invalid={Boolean(errors.name)}
                        />
                      )}
                    </Field>
                    <Field label="Email address" error={errors.email} hint="We send a verification link here." required>
                      {(props) => (
                        <Input
                          {...props}
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          placeholder="you@college.edu"
                          value={form.email}
                          onChange={(event) => update("email", event.target.value)}
                          invalid={Boolean(errors.email)}
                        />
                      )}
                    </Field>
                    <Field label="Mobile number" error={errors.phone} hint="10-digit Indian number." required>
                      {(props) => (
                        <Input
                          {...props}
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="98765 43210"
                          value={form.phone}
                          onChange={(event) => update("phone", event.target.value)}
                          invalid={Boolean(errors.phone)}
                        />
                      )}
                    </Field>
                    <Field
                      label="Password"
                      error={errors.password}
                      hint="8+ characters with upper, lower, number and symbol."
                      required
                    >
                      {(props) => (
                        <PasswordInput
                          {...props}
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          value={form.password}
                          onChange={(event) => update("password", event.target.value)}
                          invalid={Boolean(errors.password)}
                        />
                      )}
                    </Field>
                    <Field label="Confirm password" error={errors.confirmPassword} required>
                      {(props) => (
                        <PasswordInput
                          {...props}
                          autoComplete="new-password"
                          placeholder="Repeat your password"
                          value={form.confirmPassword}
                          onChange={(event) => update("confirmPassword", event.target.value)}
                          invalid={Boolean(errors.confirmPassword)}
                        />
                      )}
                    </Field>
                  </div>
                  <p className="mt-4 text-xs text-white/40">
                    Already have a pass?{" "}
                    <Link href="/login" className="font-semibold text-neon-cyan hover:underline">
                      Log in
                    </Link>
                    .
                  </p>
                </section>
              ) : null}

              {step === 1 ? (
                <section aria-labelledby="step-academics">
                  <StepHeader
                    id="step-academics"
                    icon={GraduationCap}
                    title="Where do you study?"
                    description="Open to students from NRI University and every recognised college. We use this to verify eligibility and print your pass."
                  />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="College / university" error={errors.college} required className="sm:col-span-2">
                      {(props) => (
                        <Input
                          {...props}
                          autoComplete="organization"
                          placeholder="NRI University"
                          value={form.college}
                          onChange={(event) => update("college", event.target.value)}
                          invalid={Boolean(errors.college)}
                        />
                      )}
                    </Field>
                    <Field label="Department / course" error={errors.department} required>
                      {(props) => (
                        <Input
                          {...props}
                          placeholder="Computer Science & Engineering"
                          value={form.department}
                          onChange={(event) => update("department", event.target.value)}
                          invalid={Boolean(errors.department)}
                        />
                      )}
                    </Field>
                    <Field label="Year of study" error={errors.year} required>
                      {(props) => (
                        <Select
                          {...props}
                          value={form.year}
                          onChange={(event) => update("year", event.target.value as FormState["year"])}
                          invalid={Boolean(errors.year)}
                        >
                          {YEAR_VALUES.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <Field
                      label="Roll / USN"
                      error={errors.rollNumber}
                      hint="Letters, numbers, dashes or slashes."
                      required
                      className="sm:col-span-2"
                    >
                      {(props) => (
                        <Input
                          {...props}
                          autoCapitalize="characters"
                          placeholder="1SI22CS045"
                          value={form.rollNumber}
                          onChange={(event) => update("rollNumber", event.target.value)}
                          invalid={Boolean(errors.rollNumber)}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] font-medium text-white/75">
                        College ID <span className="text-neon-magenta">*</span>
                      </p>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                        Private · admin-only
                      </span>
                    </div>
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragActive(false);
                        pickFile(event.dataTransfer.files?.[0]);
                      }}
                      className={cn(
                        "mt-1.5 rounded-2xl border border-dashed p-5 transition-colors",
                        dragActive
                          ? "border-neon-cyan/60 bg-neon-cyan/[0.06]"
                          : fileError
                            ? "border-red-500/50 bg-red-500/[0.04]"
                            : "border-white/15 bg-white/[0.025]",
                      )}
                    >
                      {collegeId ? (
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neon-lime/30 bg-neon-lime/[0.07] text-neon-lime">
                            <FileText className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white/85">{collegeId.name}</p>
                            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                              {formatBytes(collegeId.size)} · ready to upload
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCollegeId(null);
                              setFileError("");
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                            aria-label="Remove uploaded college ID"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neon-cyan">
                            <UploadCloud className="h-5 w-5" />
                          </span>
                          <span className="text-sm font-medium text-white/80">
                            Drop your college ID here, or <span className="text-neon-cyan">browse</span>
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                            JPG, PNG or PDF · max 5 MB
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                            className="sr-only"
                            onChange={(event) => pickFile(event.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                    {fileError ? (
                      <p role="alert" className="mt-1.5 text-xs text-neon-pink">
                        {fileError}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-white/35">
                        Stored outside the public web root and visible only to the organizing team.
                      </p>
                    )}
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section aria-labelledby="step-events">
                  <StepHeader
                    id="step-events"
                    icon={CalendarDays}
                    title="Choose your events."
                    description={`Pick up to ${MAX_EVENTS} events. We block overlapping schedules automatically, and you can add more later.`}
                  />

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                      {selectedIds.length}/{MAX_EVENTS} selected
                    </span>
                    {selectedIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="text-xs font-medium text-white/40 transition hover:text-neon-pink"
                      >
                        Clear all
                      </button>
                    ) : null}
                  </div>

                  {selectedEvents.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-2" aria-label="Selected events">
                      {selectedEvents.map((event) => (
                        <li key={event.id}>
                          <button
                            type="button"
                            onClick={() => toggleEvent(event)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.08] px-3 py-1.5 text-[11px] font-medium text-neon-cyan transition hover:border-neon-pink/40 hover:text-neon-pink"
                          >
                            {event.title}
                            <X className="h-3 w-3" aria-hidden />
                            <span className="sr-only">Remove {event.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {clash ? (
                    <div className="mt-4">
                      <FormAlert>
                        <span className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{clash}</span>
                        </span>
                      </FormAlert>
                    </div>
                  ) : null}
                  {errors.eventIds && !clash ? (
                    <p role="alert" className="mt-4 text-xs text-neon-pink">
                      {errors.eventIds}
                    </p>
                  ) : null}

                  <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search events, venues or departments"
                        className="pl-10"
                        aria-label="Search events"
                      />
                    </div>
                    <Select
                      value={filterDay}
                      onChange={(event) => setFilterDay(event.target.value)}
                      aria-label="Filter by day"
                    >
                      <option value="ALL">All days</option>
                      <option value="1">Day 1 · 19 Feb</option>
                      <option value="2">Day 2 · 20 Feb</option>
                      <option value="3">Day 3 · 21 Feb</option>
                    </Select>
                    <Select
                      value={filterCategory}
                      onChange={(event) => setFilterCategory(event.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="ALL">All categories</option>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      value={filterDepartment}
                      onChange={(event) => setFilterDepartment(event.target.value)}
                      aria-label="Filter by department"
                      className="sm:col-span-3"
                    >
                      <option value="ALL">All departments</option>
                      {departmentOptions.map(([name, short]) => (
                        <option key={short} value={name}>
                          {short} — {name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mt-4 max-h-[30rem] space-y-2.5 overflow-y-auto pr-1">
                    {filteredEvents.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-10 text-center">
                        <p className="text-sm font-medium text-white/70">No events match those filters.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            setFilterCategory("ALL");
                            setFilterDay("ALL");
                            setFilterDepartment("ALL");
                          }}
                          className="mt-2 text-xs font-semibold text-neon-cyan hover:underline"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      filteredEvents.map((event) => {
                        const selected = selectedIds.includes(event.id);
                        const full = !selected && selectedIds.length >= MAX_EVENTS;
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => toggleEvent(event)}
                            aria-pressed={selected}
                            className={cn(
                              "group flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                              selected
                                ? "border-neon-cyan/50 bg-neon-cyan/[0.07] shadow-[0_0_30px_-18px_rgba(0,240,255,.8)]"
                                : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.045]",
                              full && "opacity-45",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                                selected
                                  ? "border-neon-cyan bg-neon-cyan text-ink-950"
                                  : "border-white/25 bg-white/[0.04] text-transparent",
                              )}
                              aria-hidden
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold leading-snug text-white/90">{event.title}</span>
                                <span
                                  className={cn(
                                    "rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em]",
                                    categoryTone[event.category],
                                  )}
                                >
                                  {CATEGORY_LABELS[event.category]}
                                </span>
                                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                                  {event.departmentShort}
                                </span>
                              </span>
                              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3 text-white/25" />
                                  Day {event.day} · {event.startTime}–{event.endTime}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-white/25" />
                                  {event.venue}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Users className="h-3 w-3 text-white/25" />
                                  Team {event.teamSize}
                                </span>
                                <span className={event.fee > 0 ? "text-neon-amber/80" : "text-neon-lime/70"}>
                                  {event.fee > 0 ? `₹${event.fee}` : "Free"}
                                </span>
                              </span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
                    Schedule clashes are blocked. Capacity is checked again on the server.
                  </p>
                </section>
              ) : null}

              {step === 3 ? (
                <section aria-labelledby="step-review">
                  <StepHeader
                    id="step-review"
                    icon={ClipboardCheck}
                    title="One last scan."
                    description="Confirm your details, accept the code of conduct and create your pass."
                  />

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <ReviewCard title="Identity" onEdit={() => setStep(0)}>
                      <ReviewRow label="Name" value={form.name || "—"} />
                      <ReviewRow label="Email" value={form.email || "—"} />
                      <ReviewRow label="Mobile" value={form.phone || "—"} />
                    </ReviewCard>
                    <ReviewCard title="Academics" onEdit={() => setStep(1)}>
                      <ReviewRow label="College" value={form.college || "—"} />
                      <ReviewRow label="Department" value={form.department || "—"} />
                      <ReviewRow label="Year" value={form.year} />
                      <ReviewRow label="Roll no." value={form.rollNumber || "—"} />
                    </ReviewCard>
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                        Events · {selectedEvents.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[11px] font-semibold text-neon-cyan hover:underline"
                      >
                        Edit selection
                      </button>
                    </div>
                    <ul className="mt-2 divide-y divide-white/5">
                      {selectedEvents.map((event) => (
                        <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-white/85">{event.title}</p>
                            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                              Day {event.day} · {event.startTime} · {event.venue}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] text-white/45">
                            {event.fee > 0 ? `₹${event.fee}` : "Free"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-2xl border border-neon-lime/20 bg-neon-lime/[0.04] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-lime" />
                      <div>
                        <p className="text-[13px] font-semibold text-lime-200">Your QR pass is included</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">
                          After email verification you can log in and download it from your dashboard. The same
                          pass covers all three fest days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Checkbox
                      checked={form.acceptTerms}
                      onChange={(event) => update("acceptTerms", event.target.checked)}
                      error={errors.acceptTerms}
                      label={
                        <>
                          I accept the{" "}
                          <Link href="/faq#code-of-conduct" className="font-semibold text-neon-cyan hover:underline">
                            code of conduct
                          </Link>{" "}
                          and consent to my college ID being reviewed by the organizing team. My details are used
                          only for fest operations.
                        </>
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <Turnstile onVerify={setTurnstileToken} />
                  </div>

                  {error ? (
                    <div className="mt-4">
                      <FormAlert>
                        <span className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            {error}
                            {errorCode === "EMAIL_EXISTS" ? (
                              <>
                                {" "}
                                <Link href="/login" className="font-semibold underline">
                                  Log in instead
                                </Link>
                                .
                              </>
                            ) : null}
                          </span>
                        </span>
                      </FormAlert>
                    </div>
                  ) : null}

                  <p className="mt-4 text-[11px] leading-relaxed text-white/30">
                    By creating an account you agree to our{" "}
                    <Link href="/code-of-conduct" className="text-white/50 underline-offset-2 hover:underline">
                      event policies
                    </Link>
                    . We never sell your data.
                  </p>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <Button type="button" variant="ghost" size="md" onClick={back} disabled={step === 0 || submitting}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 sm:inline">
                Step {step + 1} of {STEPS.length}
              </span>
              {step < STEPS.length - 1 ? (
                <Button type="button" size="md" onClick={next} icon={<ArrowRight className="h-4 w-4" />}>
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="md"
                  loading={submitting}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Create my pass
                </Button>
              )}
            </div>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="neon-frame rounded-2xl p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Pass preview</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/[0.07] font-display text-lg font-black text-neon-cyan">
                {form.name.trim().charAt(0).toUpperCase() || "N"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/90">{form.name.trim() || "Your name"}</p>
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                  {form.college.trim() || "Your college"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="font-display text-2xl font-black text-white">{selectedEvents.length}</p>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">Events</p>
              </div>
              <div>
                <p className="font-display text-2xl font-black text-white">
                  {totalFee > 0 ? `₹${formatINR(totalFee)}` : "Free"}
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">Entry total</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-fest-gradient" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {selectedEvents.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Your line-up</p>
              <ul className="mt-2.5 space-y-2.5">
                {selectedEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white/75">{event.title}</p>
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/30">
                        Day {event.day} · {event.startTime}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {selectedEvents.length >= MAX_EVENTS ? (
                <p className="mt-3 flex items-center gap-1.5 text-[10px] text-neon-amber/80">
                  <CheckCircle2 className="h-3 w-3" /> Maximum reached
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
              <ShieldCheck className="h-3.5 w-3.5 text-neon-lime" /> Safe by design
            </p>
            <ul className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-white/40">
              <li>Encrypted passwords, httpOnly sessions.</li>
              <li>Private college ID storage.</li>
              <li>No spam. Verification only.</li>
            </ul>
          </div>
        </aside>
      </div>

      <p className="mt-8 text-center text-xs text-white/35">
        Questions?{" "}
        <Link href="/contact" className="font-semibold text-white/60 hover:text-neon-cyan">
          Talk to the team
        </Link>{" "}
        ·{" "}
        <Link href="/faq" className="font-semibold text-white/60 hover:text-neon-cyan">
          Read the FAQ
        </Link>
      </p>
    </div>
  );
}

function StepHeader({
  id,
  icon: Icon,
  title,
  description,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/[0.07] text-neon-cyan">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 id={id} className="font-display text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-pretty text-xs leading-relaxed text-white/45 sm:text-[13px]">{description}</p>
      </div>
    </div>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] font-semibold text-neon-cyan hover:underline"
        >
          Edit
        </button>
      </div>
      <dl className="mt-2.5 space-y-1.5">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[11px] text-white/35">{label}</dt>
      <dd className="truncate text-right text-xs font-medium text-white/80">{value}</dd>
    </div>
  );
}
