import type { MetadataRoute } from "next";
import { FEST } from "@/lib/fest";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: FEST.fullName,
    short_name: "suNRIseevent",
    description: FEST.description,
    start_url: "/",
    display: "standalone",
    background_color: "#05010d",
    theme_color: "#05010d",
    orientation: "portrait-primary",
    categories: ["education", "events", "entertainment"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
