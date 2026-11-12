import { ApiError, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { readCollegeId } from "@/lib/security/upload";
import { sanitizeFilename } from "@/lib/security/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** GET /api/admin/uploads/[id] — streams a college ID to authenticated admins only. */
export const GET = withApi<Context>(async (req, ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;

  const upload = await prisma.upload.findUnique({ where: { id } });
  if (!upload) throw new ApiError(404, "File not found.", "NOT_FOUND");

  const buffer = await readCollegeId(upload.storedName);
  const filename = sanitizeFilename(upload.originalName);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Disposition": `inline; filename="${filename.replace(/[^\w.\- ]+/g, "_")}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
