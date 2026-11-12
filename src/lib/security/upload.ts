import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "@/lib/api";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;

const STORAGE_ROOT = path.join(process.cwd(), "storage", "college-ids");

type MagicCheck = { mime: string; ext: string; matches: (b: Buffer) => boolean };

const MAGIC: MagicCheck[] = [
  {
    mime: "image/jpeg",
    ext: "jpg",
    matches: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    ext: "png",
    matches: (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    mime: "application/pdf",
    ext: "pdf",
    matches: (b) => b.length > 5 && b.subarray(0, 5).toString("ascii") === "%PDF-",
  },
];

export type StoredUpload = {
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
};

/** Validate extension, declared type, magic bytes and size. Files are re-named. */
export async function saveCollegeId(file: File): Promise<StoredUpload> {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new ApiError(400, "The uploaded file is empty.", "UPLOAD_EMPTY");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "College ID must be smaller than 5 MB.", "UPLOAD_TOO_LARGE");
  }
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
    throw new ApiError(415, "Only JPG, PNG or PDF files are allowed.", "UPLOAD_TYPE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = MAGIC.find((m) => m.matches(buffer));
  if (!detected || detected.mime !== file.type) {
    throw new ApiError(415, "The file content does not match its type.", "UPLOAD_MAGIC");
  }

  await mkdir(STORAGE_ROOT, { recursive: true });
  const storedName = `${Date.now()}-${randomBytes(16).toString("hex")}.${detected.ext}`;
  await writeFile(path.join(STORAGE_ROOT, storedName), buffer, { mode: 0o600 });

  return {
    storedName,
    originalName: sanitizeFilename(file.name),
    mimeType: detected.mime,
    size: buffer.length,
  };
}

/** Read a stored upload with path-traversal protection. */
export async function readCollegeId(storedName: string): Promise<Buffer> {
  if (!/^[\w.-]+$/.test(storedName) || storedName.includes("..")) {
    throw new ApiError(400, "Invalid file reference.", "UPLOAD_INVALID");
  }
  try {
    return await readFile(path.join(STORAGE_ROOT, path.basename(storedName)));
  } catch {
    throw new ApiError(404, "File not found.", "UPLOAD_NOT_FOUND");
  }
}

export async function deleteCollegeId(storedName: string) {
  if (!/^[\w.-]+$/.test(storedName)) return;
  try {
    await unlink(path.join(STORAGE_ROOT, path.basename(storedName)));
  } catch {
    /* best effort */
  }
}

export function sanitizeFilename(name: string) {
  return path
    .basename(name || "college-id")
    .replace(/[^\w.\- ]+/g, "_")
    .slice(0, 120);
}
