import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "VibeLink", short_name: "VibeLink", description: "Lihat tujuan link sebelum kamu klik.", start_url: "/", display: "standalone", background_color: "#faf8f5", theme_color: "#ea580c", icons: [] }; }
