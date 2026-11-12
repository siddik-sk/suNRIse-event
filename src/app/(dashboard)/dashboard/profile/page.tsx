"use client";

import { useEffect, useState } from "react";
import { Award, CheckCircle2, GraduationCap, IdCard, Mail, Save, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select } from "@/components/ui/form";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { ApiClientError, apiFetch } from "@/lib/client-api";
import { YEARS } from "@/lib/fest";
import { formatDate, formatDateTime } from "@/lib/utils";

type ProfileValues = {
  name: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  rollNumber: string;
};

export default function DashboardProfilePage() {
  const { user, setUser } = useSession();
  const { toast } = useToast();
  const [values, setValues] = useState<ProfileValues>({
    name: "",
    phone: "",
    college: "",
    department: "",
    year: "1st Year",
    rollNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setValues({
      name: user.name,
      phone: user.phone,
      college: user.college,
      department: user.department,
      year: user.year,
      rollNumber: user.rollNumber,
    });
  }, [user]);

  function set<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setFormError(null);
    setSaved(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError(null);
    setSaved(false);

    try {
      const data = await apiFetch<{ ok: boolean; user: NonNullable<typeof user> }>("/api/profile", {
        method: "PATCH",
        json: values,
      });
      setUser(data.user);
      setSaved(true);
      toast("Profile updated.", "success");
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setErrors(caught.fieldErrors ?? {});
        setFormError(caught.message);
      } else {
        setFormError("Could not save your profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-3">Profile</p>
        <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          Your <span className="text-gradient">details.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
          Keep these accurate — they appear on your pass and are checked against your college ID at the gate.
        </p>
      </header>

      {saved ? (
        <FormAlert tone="success">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Profile saved. Your pass has been updated.
          </span>
        </FormAlert>
      ) : null}

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <form onSubmit={submit} className="neon-frame rounded-2xl p-5 sm:p-6" noValidate>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-neon-cyan">
              <UserCog className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-white">Personal information</p>
              <p className="text-[11px] text-white/35">Used on your pass and event rosters.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              {(props) => (
                <Input {...props} value={values.name} onChange={(event) => set("name", event.target.value)} autoComplete="name" />
              )}
            </Field>
            <Field label="Mobile number" required error={errors.phone} hint="10-digit Indian mobile number.">
              {(props) => (
                <Input
                  {...props}
                  type="tel"
                  value={values.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  autoComplete="tel"
                />
              )}
            </Field>
            <Field label="College" required error={errors.college}>
              {(props) => (
                <Input
                  {...props}
                  value={values.college}
                  onChange={(event) => set("college", event.target.value)}
                  autoComplete="organization"
                />
              )}
            </Field>
            <Field label="Department" required error={errors.department}>
              {(props) => (
                <Input
                  {...props}
                  value={values.department}
                  onChange={(event) => set("department", event.target.value)}
                  placeholder="CSE (AI & Machine Learning)"
                />
              )}
            </Field>
            <Field label="Year of study" required error={errors.year}>
              {(props) => (
                <Select {...props} value={values.year} onChange={(event) => set("year", event.target.value)}>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Roll number" required error={errors.rollNumber}>
              {(props) => (
                <Input
                  {...props}
                  value={values.rollNumber}
                  onChange={(event) => set("rollNumber", event.target.value.toUpperCase())}
                  className="font-mono"
                />
              )}
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-[11px] text-white/35">Changes are logged for security.</p>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
              Save changes
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="neon-frame rounded-2xl p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Account</p>
            <div className="mt-3 space-y-3 text-xs">
              <Info icon={Mail} label="Email" value={user.email} />
              <Info icon={Shield} label="Role" value={user.role === "ADMIN" ? "Organizer" : "Student"} />
              <Info icon={CheckCircle2} label="Email status" value={user.emailVerified ? "Verified" : "Not verified"} />
              <Info icon={IdCard} label="Pass ID" value={user.role === "ADMIN" ? "Admin account" : "On your pass"} />
            </div>
            {!user.emailVerified ? (
              <a
                href={`/verify-email?email=${encodeURIComponent(user.email)}`}
                className="mt-3 inline-flex text-xs font-semibold text-neon-amber hover:underline"
              >
                Verify your email →
              </a>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Activity</p>
            <div className="mt-3 space-y-3 text-xs">
              <Info icon={GraduationCap} label="Member since" value={formatDate(user.createdAt)} />
              <Info
                icon={Award}
                label="Last login"
                value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "This session"}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Security</p>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Need to change your password? Use the forgot-password flow with your account email.
            </p>
            <a href="/forgot-password" className="mt-2 inline-flex text-xs font-semibold text-neon-cyan hover:underline">
              Reset password →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/25" />
      <div className="min-w-0">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">{label}</p>
        <p className="truncate text-white/75">{value}</p>
      </div>
    </div>
  );
}
