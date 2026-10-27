/**
 * HomepageContext — fetches & provides all editable home page content.
 * Falls back to DEFAULT_CONFIG when backend is unavailable.
 * Admin can call updateConfig() to persist changes to MongoDB.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import heroAgate from "@/assets/hero-agate.jpg";
import heroAbout from "@/assets/hero-about.jpg";
import heroContact from "@/assets/hero-contact.jpg";
import agate1 from "@/assets/agate-1.jpg";
import agate3 from "@/assets/agate-3.jpg";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/settings`
  : (typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:5000/api/settings"
    : "/api/settings");
const SETTINGS_KEY = "homepage";

// ─── types ────────────────────────────────────────────────────────────────────

export interface HeroSlide       { image: string; alt?: string }
export interface HomepageStat   { value: string; label: string }
export interface HomepageFeature { title: string; desc: string }
export interface HomepageStep   { title: string; body: string }

export interface HomepageVisibility {
  hero: boolean;
  stats: boolean;
  featured: boolean;
  brandStory: boolean;
  catalog: boolean;
  features: boolean;
  steps: boolean;
  cta: boolean;
  quote: boolean;
}

export interface HomepageConfig {
  visibility: HomepageVisibility;
  hero: {
    eyebrow: string;
    tagline: string;
    slides: HeroSlide[];
  };
  stats: HomepageStat[];
  brandStory: {
    heading: string;
    headingEm: string;
    body1: string;
    body2: string;
    image: string;
  };
  features: HomepageFeature[];
  steps: HomepageStep[];
  cta: {
    heading: string;
    subtext: string;
  };
  quote: {
    text: string;
    attribution: string;
  };
  whatsappNumber: string;
}

// ─── defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: HomepageConfig = {
  visibility: {
    hero: true,
    stats: true,
    featured: true,
    brandStory: true,
    catalog: true,
    features: true,
    steps: true,
    cta: true,
    quote: true,
  },
  hero: {
    eyebrow: "Premium Mineral Specimens",
    tagline: "Nature's Artistry, Refined",
    slides: [
      { image: heroAgate,   alt: "Azure Depths & Natural Banding" },
      { image: heroAbout,   alt: "Handcrafted Mineral Specimen Curation" },
      { image: agate1,      alt: "Concentric Blue Agate Slice" },
      { image: heroContact, alt: "Ethically Sourced Geodes & Crystals" },
      { image: agate3,      alt: "Emerald Moss Agate Formations" },
    ],
  },
  stats: [
    { value: "500+", label: "Specimens Curated" },
    { value: "12+",  label: "Countries Sourced" },
    { value: "100%", label: "Natural, Untreated" },
    { value: "5★",   label: "Collector Trust" },
  ],
  brandStory: {
    heading: "Where Geology Meets",
    headingEm: "Refined Taste",
    body1:
      "LUNÉVIA was born from a single belief — that the earth's most extraordinary creations deserve to be shared, not hidden in geological archives. Each banded agate, crystalline geode, and fire-lit mineral we carry is the result of millions of years of natural artistry.",
    body2:
      "Our gemologists travel the world to source specimens directly at origin, ensuring authenticity, ethical provenance, and the kind of quality you simply cannot find on mass-market platforms.",
    image: heroAbout,
  },
  features: [
    { title: "Hand Selected",              desc: "Every specimen is personally curated by our in-house gemologists — only the finest 5% makes it to the catalogue." },
    { title: "Ethically Sourced",          desc: "We partner exclusively with responsible mining operations across Brazil, Morocco, and Uruguay." },
    { title: "Certificate of Authenticity", desc: "Each piece ships with a detailed provenance certificate documenting origin, mineral composition and grade." },
    { title: "Quality Guaranteed",         desc: "Not satisfied? We stand behind every specimen with a no-questions exchange policy." },
    { title: "Natural Formation",          desc: "Zero treatments or enhancements — every colour and pattern you see is formed over millions of years." },
    { title: "Direct Inquiry",             desc: "Skip the middlemen. Speak directly with our gemologist over WhatsApp for personalised guidance." },
  ],
  steps: [
    { title: "Global Partnerships", body: "We work with trusted mining cooperatives across Brazil, Morocco, Madagascar and Uruguay to source raw specimens at the point of origin." },
    { title: "Expert Assessment",   body: "Every piece undergoes a rigorous assessment by our in-house gemologists — evaluating colour banding, clarity, size and rarity." },
    { title: "Lab Documentation",   body: "Accepted specimens are catalogued, measured, photographed in controlled lighting and assigned a unique reference number." },
    { title: "Ready for You",       body: "The finished specimen is listed in our catalogue and made available for direct inquiry via WhatsApp — no middlemen." },
  ],
  cta: {
    heading: "Inquire With Our Gemologist",
    subtext:
      "Have a question about a piece? Looking for a specific mineral or size? Our team is available on WhatsApp for personalised guidance — no bots, no scripts.",
  },
  quote: {
    text: "Every agate slice is a window into deep time — a collaboration between water, mineral, and millions of years. LUNÉVIA simply opens the frame.",
    attribution: "— The LUNÉVIA Gemologists",
  },
  whatsappNumber: "919510990215",
};

// ─── context ──────────────────────────────────────────────────────────────────

interface HomepageContextValue {
  config: HomepageConfig;
  isLoading: boolean;
  isSaving: boolean;
  updateConfig: (next: HomepageConfig, passcode: string) => Promise<void>;
  uploadImage: (file: File, passcode: string) => Promise<string>;
  refetch: () => Promise<void>;
}

const HomepageContext = createContext<HomepageContextValue | null>(null);

export function HomepageProvider({
  children,
  initialConfig,
}: {
  children: ReactNode;
  initialConfig?: HomepageConfig;
}) {
  const [config, setConfig] = useState<HomepageConfig>(() => {
    if (initialConfig) return initialConfig;
    if (typeof window !== "undefined") {
      const winData = (window as any).__INITIAL_DATA__;
      if (winData?.homepageConfig) return winData.homepageConfig;
    }
    return DEFAULT_CONFIG;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/${SETTINGS_KEY}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            hero: {
              ...DEFAULT_CONFIG.hero,
              ...(data.hero || {}),
              slides: data.hero?.slides && data.hero.slides.length > 0
                ? data.hero.slides
                : DEFAULT_CONFIG.hero.slides,
            },
            brandStory: {
              ...DEFAULT_CONFIG.brandStory,
              ...(data.brandStory || {}),
              image: data.brandStory?.image || DEFAULT_CONFIG.brandStory.image,
            },
            visibility: {
              ...DEFAULT_CONFIG.visibility,
              ...(data.visibility || {}),
            },
          });
        }
      }
    } catch {
      // offline — keep defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const updateConfig = useCallback(async (next: HomepageConfig, passcode: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${SETTINGS_KEY}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode,
        },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("Save failed");
      setConfig(next); // optimistic update
    } finally {
      setIsSaving(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File, passcode: string): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE}/upload-image`, {
      method: "POST",
      headers: {
        "x-admin-passcode": passcode,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Upload failed");
    }
    const data = await res.json();
    return data.url as string;
  }, []);

  return (
    <HomepageContext.Provider value={{ config, isLoading, isSaving, updateConfig, uploadImage, refetch: fetchConfig }}>
      {children}
    </HomepageContext.Provider>
  );
}

export function useHomepage() {
  const ctx = useContext(HomepageContext);
  if (!ctx) throw new Error("useHomepage must be used inside HomepageProvider");
  return ctx;
}
