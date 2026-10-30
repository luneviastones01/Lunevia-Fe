import { useEffect } from "react";
import { siteConfig } from "@/config/site";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  schema?: Record<string, any>;
}

export default function SEO({
  title,
  description = siteConfig.description,
  image = "/hero-agate.webp",
  url,
  type = "website",
  noIndex = false,
  schema,
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    const fullTitle = title
      ? `${title} | ${siteConfig.name}`
      : `${siteConfig.name} — Curated Natural Agate & Mineral Specimens`;
    document.title = fullTitle;

    // Helper to set or create meta tags
    const setMeta = (nameOrProp: "name" | "property", key: string, content: string) => {
      let el = document.querySelector(`meta[${nameOrProp}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameOrProp, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Standard Meta
    setMeta("name", "description", description);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // 3. Open Graph
    const currentUrl = url || window.location.href;
    const absoluteImage = image.startsWith("http")
      ? image
      : `${window.location.origin}${image.startsWith("/") ? "" : "/"}${image}`;

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", absoluteImage);
    setMeta("property", "og:url", currentUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", siteConfig.name);

    // 4. Twitter Cards
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", absoluteImage);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

    // 6. JSON-LD Structured Data
    const existingScript = document.getElementById("seo-json-ld");
    if (existingScript) existingScript.remove();

    if (schema) {
      const script = document.createElement("script");
      script.id = "seo-json-ld";
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById("seo-json-ld");
      if (s) s.remove();
    };
  }, [title, description, image, url, type, noIndex, schema]);

  return null;
}
