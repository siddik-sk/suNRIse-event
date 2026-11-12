import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/events",
    "/departments",
    "/schedule",
    "/sponsors",
    "/team",
    "/faq",
    "/contact",
    "/register",
    "/login",
    "/code-of-conduct",
    "/privacy",
  ].map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/register" ? 0.9 : 0.7,
  }));

  try {
    const [departments, events] = await Promise.all([
      prisma.department.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.event.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...staticRoutes,
      ...departments.map((d) => ({
        url: absoluteUrl(`/departments/${d.slug}`),
        lastModified: d.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...events.map((e) => ({
        url: absoluteUrl(`/events/${e.slug}`),
        lastModified: e.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
