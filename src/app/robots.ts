import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in sections, payment results and this app's own API routes.
      disallow: ["/dashboard", "/technician", "/admin", "/payment", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
