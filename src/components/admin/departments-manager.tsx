"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/providers/toast-provider";
import { ApiClientError, apiFetch } from "@/lib/client-api";
import type { AdminDepartment } from "@/lib/admin-types";
import { cn, slugify } from "@/lib/utils";

const ACCENTS = ["cyan", "magenta", "orange", "purple", "lime", "blue", "pink", "amber"] as const;
const ICONS = [
  "terminal",
  "brain",
  "palette",
  "bot",
  "database",
  "network",
  "radio",
  "zap",
  "cog",
  "building",
  "briefcase",
  "code",
  "dna",
  "pen",
  "cpu",
] as const;

const accentHex: Record<string, string> = {
  cyan: "#00f0ff",
  magenta: "#ff2d95",
  orange: "#ff8a00",
  purple: "#8b5cf6",
  lime: "#a3ff12",
  blue: "#3d7bff",
  pink: "#ff6ec7",
  amber: "#ffc24b",
};

type FormValues = {
  name: string;
  shortName: string;
  slug: string;
  description: string;
  tagline: string;
  accent: string;
  icon: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: FormValues = {
  name: "",
  shortName: "",
  slug: "",
  description: "",
  tagline: "",
  accent: "cyan",
  icon: "cpu",
  sortOrder: "0",
  isActive: true,
};

export function DepartmentsManager() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminDepartment | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ ok: boolean; departments: AdminDepartment[] }>("/api/admin/departments");
      setDepartments(data.departments);
    } catch {
      setError("Could not load departments. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(department: AdminDepartment) {
    setBusyId(department.id);
    try {
      const data = await apiFetch<{ ok: boolean; department: AdminDepartment }>(`/api/admin/departments/${department.id}`, {
        method: "PATCH",
        json: { isActive: !department.isActive },
      });
      setDepartments((previous) =>
        previous.map((row) => (row.id === department.id ? { ...row, ...data.department } : row)),
      );
      toast(`${department.shortName} ${department.isActive ? "hidden" : "published"}.`, "success");
    } catch (caught) {
      toast(caught instanceof ApiClientError ? caught.message : "Could not update the department.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(department: AdminDepartment) {
    const confirmed = window.confirm(
      `Delete “${department.name}”?${
        department._count.events > 0
          ? `\n\nThis department hosts ${department._count.events} events. Move or delete them first.`
          : ""
      }`,
    );
    if (!confirmed) return;

    setBusyId(department.id);
    try {
      await apiFetch(`/api/admin/departments/${department.id}`, { method: "DELETE" });
      setDepartments((previous) => previous.filter((row) => row.id !== department.id));
      toast(`${department.shortName} deleted.`, "success");
    } catch (caught) {
      toast(caught instanceof ApiClientError ? caught.message : "Could not delete the department.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
          {departments.length} departments · {departments.filter((department) => department.isActive).length} published
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => void load()} icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            New department
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <article
              key={department.id}
              className={cn(
                "neon-frame rounded-2xl p-4 transition",
                !department.isActive && "opacity-60",
                busyId === department.id && "pointer-events-none opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-8 w-8 place-items-center rounded-lg border font-mono text-[10px] font-bold"
                      style={{
                        color: accentHex[department.accent] ?? "#00f0ff",
                        borderColor: `${accentHex[department.accent] ?? "#00f0ff"}55`,
                        backgroundColor: `${accentHex[department.accent] ?? "#00f0ff"}12`,
                      }}
                    >
                      {department.shortName.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold text-white">{department.shortName}</p>
                      <p className="truncate text-[10px] text-white/35">/{department.slug}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/45">{department.name}</p>
                </div>
                {department.isActive ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neon-lime/25 bg-neon-lime/[0.05] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-neon-lime">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Live
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">
                    Hidden
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                <span className="font-mono text-[10px] text-white/35">
                  {department._count.events} events · order {department.sortOrder}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(department)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/55 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                  >
                    {department.isActive ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(department)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-white/50 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                    aria-label={`Edit ${department.name}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(department)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-white/40 transition hover:border-red-500/40 hover:text-red-300"
                    aria-label={`Delete ${department.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {departments.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
              <Building2 className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm font-semibold text-white/70">No departments yet.</p>
              <p className="mt-1 text-xs text-white/35">Create one to start organising events.</p>
            </div>
          ) : null}
        </div>
      )}

      {creating || editing ? (
        <DepartmentDialog
          department={editing}
          nextOrder={departments.length}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(saved, mode) => {
            setDepartments((previous) =>
              mode === "create" ? [...previous, saved] : previous.map((row) => (row.id === saved.id ? saved : row)),
            );
            setCreating(false);
            setEditing(null);
            toast(mode === "create" ? "Department created." : "Department updated.", "success");
          }}
        />
      ) : null}
    </div>
  );
}

function DepartmentDialog({
  department,
  nextOrder,
  onClose,
  onSaved,
}: {
  department: AdminDepartment | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: (department: AdminDepartment, mode: "create" | "edit") => void;
}) {
  const [values, setValues] = useState<FormValues>(() =>
    department
      ? {
          name: department.name,
          shortName: department.shortName,
          slug: department.slug,
          description: department.description,
          tagline: department.tagline ?? "",
          accent: department.accent,
          icon: department.icon,
          sortOrder: String(department.sortOrder),
          isActive: department.isActive,
        }
      : { ...emptyForm, sortOrder: String(nextOrder + 1) },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(department));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((previous) => {
      const next = { ...previous, [key]: value };
      if (key === "name" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setFormError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError(null);

    const payload = {
      name: values.name,
      shortName: values.shortName,
      slug: values.slug,
      description: values.description,
      tagline: values.tagline,
      accent: values.accent,
      icon: values.icon,
      sortOrder: Number(values.sortOrder),
      isActive: values.isActive,
    };

    try {
      const data = await apiFetch<{ ok: boolean; department: AdminDepartment }>(
        department ? `/api/admin/departments/${department.id}` : "/api/admin/departments",
        { method: department ? "PATCH" : "POST", json: payload },
      );
      onSaved(data.department, department ? "edit" : "create");
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setErrors(caught.fieldErrors ?? {});
        setFormError(caught.message);
      } else {
        setFormError("Could not save the department. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[170] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close department form" onClick={onClose} className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-950 sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
              {department ? "Edit department" : "New department"}
            </p>
            <h2 className="font-display text-lg font-bold text-white">{department ? department.name : "Add a host department"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/45 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto p-5" noValidate>
          {formError ? <FormAlert>{formError}</FormAlert> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name} className="sm:col-span-2">
              {(props) => <Input {...props} value={values.name} onChange={(e) => set("name", e.target.value)} />}
            </Field>
            <Field label="Short name" required error={errors.shortName} hint="Shown on badges and filters.">
              {(props) => (
                <Input {...props} value={values.shortName} onChange={(e) => set("shortName", e.target.value.toUpperCase())} />
              )}
            </Field>
            <Field label="Slug" required error={errors.slug} hint="Lowercase letters, numbers and dashes.">
              {(props) => (
                <Input
                  {...props}
                  value={values.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase());
                  }}
                  className="font-mono"
                />
              )}
            </Field>
            <Field label="Description" required error={errors.description} className="sm:col-span-2">
              {(props) => (
                <Textarea {...props} rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
              )}
            </Field>
            <Field label="Tagline" error={errors.tagline} className="sm:col-span-2">
              {(props) => <Input {...props} value={values.tagline} onChange={(e) => set("tagline", e.target.value)} />}
            </Field>
            <Field label="Accent" required error={errors.accent}>
              {(props) => (
                <Select {...props} value={values.accent} onChange={(e) => set("accent", e.target.value)}>
                  {ACCENTS.map((accent) => (
                    <option key={accent} value={accent}>
                      {accent}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Icon" required error={errors.icon}>
              {(props) => (
                <Select {...props} value={values.icon} onChange={(e) => set("icon", e.target.value)}>
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Sort order" required error={errors.sortOrder}>
              {(props) => (
                <Input {...props} type="number" min={0} value={values.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
              )}
            </Field>
            <div className="flex items-center pt-6">
              <label className="inline-flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="h-4 w-4 accent-[#a3ff12]"
                />
                Published
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {department ? "Save changes" : "Create department"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
