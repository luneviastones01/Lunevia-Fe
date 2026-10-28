import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Shield, Award, Globe, Gem, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroAgate from "@/assets/hero-agate.jpg";
import heroAbout from "@/assets/hero-about.jpg";
import heroContact from "@/assets/hero-contact.jpg";
import agate1 from "@/assets/agate-1.jpg";
import agate3 from "@/assets/agate-3.jpg";
import { useProducts } from "@/contexts/ProductsContext";
import { useHomepage } from "@/contexts/HomepageContext";
import ProductCard from "@/components/ProductCard";
import { useScrollFadeUp } from "@/hooks/useScrollFadeUp";
import SEO from "@/components/SEO";

// Icon map for features (order-stable, no dynamic lookup needed)
const FEATURE_ICONS = [Gem, Globe, Award, Shield, Sparkles, CheckCircle];

// 14 Atmospheric ambient particles positioned across bottom 45%
const PARTICLES = [
  { id: 1,  left: "7%",  bottom: "12%", size: 4, duration: "7.5s", delay: "0s",   x: "16px",  y: "-26px", baseOp: 0.2, peakOp: 0.65 },
  { id: 2,  left: "16%", bottom: "28%", size: 5, duration: "9s",   delay: "1.2s", x: "-18px", y: "-34px", baseOp: 0.15, peakOp: 0.55 },
  { id: 3,  left: "24%", bottom: "8%",  size: 3, duration: "6.5s", delay: "0.5s", x: "18px",  y: "-20px", baseOp: 0.3, peakOp: 0.75 },
  { id: 4,  left: "32%", bottom: "36%", size: 6, duration: "10.5s",delay: "2.3s", x: "-15px", y: "-30px", baseOp: 0.18, peakOp: 0.5 },
  { id: 5,  left: "40%", bottom: "16%", size: 4, duration: "8.5s", delay: "1.5s", x: "20px",  y: "-28px", baseOp: 0.22, peakOp: 0.6 },
  { id: 6,  left: "48%", bottom: "24%", size: 5, duration: "7.8s", delay: "0.8s", x: "-17px", y: "-32px", baseOp: 0.25, peakOp: 0.7 },
  { id: 7,  left: "56%", bottom: "10%", size: 3, duration: "8.2s", delay: "2.8s", x: "15px",  y: "-22px", baseOp: 0.28, peakOp: 0.7 },
  { id: 8,  left: "64%", bottom: "34%", size: 6, duration: "11s",  delay: "0.3s", x: "-22px", y: "-38px", baseOp: 0.16, peakOp: 0.5 },
  { id: 9,  left: "72%", bottom: "18%", size: 4, duration: "9.2s", delay: "1.9s", x: "19px",  y: "-26px", baseOp: 0.2, peakOp: 0.65 },
  { id: 10, left: "80%", bottom: "30%", size: 5, duration: "7.2s", delay: "3.1s", x: "-14px", y: "-30px", baseOp: 0.22, peakOp: 0.68 },
  { id: 11, left: "88%", bottom: "14%", size: 4, duration: "8.7s", delay: "1.1s", x: "17px",  y: "-24px", baseOp: 0.2, peakOp: 0.6 },
  { id: 12, left: "12%", bottom: "42%", size: 3, duration: "10s",  delay: "2.5s", x: "-16px", y: "-28px", baseOp: 0.18, peakOp: 0.55 },
  { id: 13, left: "60%", bottom: "43%", size: 4, duration: "9.5s", delay: "0.7s", x: "14px",  y: "-32px", baseOp: 0.22, peakOp: 0.65 },
  { id: 14, left: "84%", bottom: "41%", size: 5, duration: "8.3s", delay: "1.7s", x: "-19px", y: "-29px", baseOp: 0.2, peakOp: 0.62 },
];

function FadeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollFadeUp();
  return <div ref={ref} className={className}>{children}</div>;
}

export default function Index() {
  const { products } = useProducts();
  const { config }   = useHomepage();
  const featured     = products.filter((p) => p.featured);
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("lunevia_home_category") || "All";
    }
    return "All";
  });

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lunevia_home_category", cat);
    }
  };

  // When opening or returning to Home, always start cleanly at the top hero section
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered   = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  const catalogRef = useRef<HTMLElement>(null);
  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth" });

  const whatsappHref = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    `Hello Lunevia, I would like to inquire about your collection. Could you please share more details?`
  )}`;

  // Safe visibility flags (default to true if undefined)
  const vis = {
    hero:       config.visibility?.hero !== false,
    stats:      config.visibility?.stats !== false,
    featured:   config.visibility?.featured !== false,
    brandStory: config.visibility?.brandStory !== false,
    catalog:    config.visibility?.catalog !== false,
    features:   config.visibility?.features !== false,
    steps:      config.visibility?.steps !== false,
    cta:        config.visibility?.cta !== false,
    quote:      config.visibility?.quote !== false,
  };

  // Hero slideshow items (configured by admin or default luxury specimens)
  const slides = config.hero?.slides && config.hero.slides.length > 0
    ? config.hero.slides
    : [
        { image: heroAgate,   alt: "Azure Depths & Natural Banding" },
        { image: heroAbout,   alt: "Handcrafted Mineral Specimen Curation" },
        { image: agate1,      alt: "Concentric Blue Agate Slice" },
        { image: heroContact, alt: "Ethically Sourced Geodes & Crystals" },
        { image: agate3,      alt: "Emerald Moss Agate Formations" },
      ];

  const [slideIndex, setSlideIndex] = useState(0);

  // 1. Slide Change Interval: Changes every 6 seconds (6000ms)
  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="min-h-screen">
      <SEO
        title="Curated Natural Agate & Mineral Specimens"
        description="Discover rare, ethically sourced agate and natural mineral specimens. Handcrafted slices, amethyst geodes, and bespoke luxury crystal centrepieces."
        schema={{
          "@context": "https://schema.org",
          "@type": "JewelryStore",
          name: "LUNÉVIA",
          description: "Curated Natural Agate & Mineral Specimens for collectors and luxury interiors.",
          currenciesAccepted: "USD, INR",
          paymentAccepted: "Direct Inquiry",
          priceRange: "$$$",
          telephone: "+919510990215",
          brand: {
            "@type": "Brand",
            name: "LUNÉVIA",
          },
        }}
      />

      {/* ── HERO SLIDESHOW ── */}
      {vis.hero && (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          
          {/* 2. Transition Effect (Cross-fade 1.6s easeInOut) + 3. Ken Burns Zoom/Pan (18s) */}
          <AnimatePresence>
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={slides[slideIndex].image}
                alt={slides[slideIndex].alt}
                className="w-full h-full object-cover animate-ken-burns"
              />
            </motion.div>
          </AnimatePresence>

          {/* 4. Extra Visual Layers: Dark gradient overlay to maintain text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/80 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.65)_100%)] pointer-events-none z-10" />

          {/* 4. Extra Visual Layers: 14 Atmospheric Particles drifting across bottom 45% */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none z-15 overflow-hidden">
            {PARTICLES.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full bg-gold/70 blur-[1px] animate-ambient-particle shadow-[0_0_8px_rgba(212,175,55,0.7)]"
                style={{
                  left: p.left,
                  bottom: p.bottom,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  // @ts-expect-error CSS variable injection
                  "--p-duration": p.duration,
                  "--p-delay": p.delay,
                  "--p-x": p.x,
                  "--p-y": p.y,
                  "--p-base-op": p.baseOp,
                  "--p-peak-op": p.peakOp,
                }}
              />
            ))}
          </div>

          {/* Content Layer */}
          <div className="relative z-20 text-center px-6 space-y-6 max-w-3xl mx-auto">
            <p className="font-body text-xs tracking-[0.5em] uppercase text-gold opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              {config.hero.eyebrow}
            </p>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light tracking-widest opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
              LUNÉVIA
            </h1>
            <p className="font-body text-sm md:text-base text-muted-foreground tracking-[0.25em] uppercase opacity-0 animate-fade-up" style={{ animationDelay: "500ms" }}>
              {config.hero.tagline}
            </p>

            {/* 4. Progress Pill Indicators: Expands to 40px (w-10) with 500ms transition */}
            <div className="flex items-center justify-center gap-2 pt-2 pb-1 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Jump to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out cursor-pointer ${
                    slideIndex === i
                      ? "w-10 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                      : "w-2.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <div className="opacity-0 animate-fade-up flex justify-center items-center" style={{ animationDelay: "700ms" }}>
              <button
                onClick={scrollToCatalog}
                className="inline-flex items-center gap-3 px-8 py-3 border border-gold text-gold text-sm tracking-[0.15em] uppercase font-body hover:bg-gold hover:text-primary-foreground transition-all duration-500 cursor-pointer shadow-lg"
              >
                Explore Collection <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 opacity-0 animate-fade-in" style={{ animationDelay: "1200ms" }}>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gold/60 to-transparent animate-pulse" />
            <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground">Scroll</span>
          </div>
        </section>
      )}

      {/* ── STATS STRIP ── */}
      {vis.stats && (
        <FadeSection className="border-y border-border/40 py-10 bg-surface/30">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {config.stats.map((s) => (
              <div key={s.label} className="scroll-fade-up">
                <p className="font-display text-3xl md:text-4xl text-gold font-light">{s.value}</p>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeSection>
      )}

      {/* ── FEATURED CURATED PICKS ── */}
      {vis.featured && featured.length > 0 && (
        <FadeSection className="container mx-auto px-6 py-24">
          <div className="text-center mb-16 scroll-fade-up">
            <p className="text-xs tracking-[0.3em] uppercase text-gold font-body mb-3">Curated Selection</p>
            <h2 className="font-display text-3xl md:text-4xl font-light">Featured Specimens</h2>
            <div className="w-12 h-px bg-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </FadeSection>
      )}

      {/* ── BRAND STORY ── */}
      {vis.brandStory && (
        <FadeSection className="bg-surface/30 border-y border-border/40 py-24">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 scroll-fade-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold font-body">Our Story</p>
              <h2 className="font-display text-3xl md:text-5xl font-light leading-snug">
                {config.brandStory.heading}<br />
                <em className="gold-text-gradient">{config.brandStory.headingEm}</em>
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">{config.brandStory.body1}</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">{config.brandStory.body2}</p>
              <Link to="/about" className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-gold font-body hover:gap-4 transition-all duration-300">
                Discover Our Philosophy <ArrowRight size={14} />
              </Link>
            </div>
            <div className="relative scroll-fade-up" style={{ transitionDelay: "150ms" }}>
              <img
                src={config.brandStory?.image || heroAbout}
                alt="Gemologist selecting specimens"
                className="w-full h-80 lg:h-[480px] object-cover"
              />
              <div className="absolute inset-0 border border-gold/20 translate-x-3 translate-y-3 pointer-events-none" />
            </div>
          </div>
        </FadeSection>
      )}

      {/* ── FULL CATALOGUE ── */}
      {vis.catalog && (
        <section ref={catalogRef} className="container mx-auto px-6 py-24">
          <FadeSection>
            <div className="text-center mb-12 scroll-fade-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold font-body mb-3">The Collection</p>
              <h2 className="font-display text-3xl md:text-4xl font-light">Explore Our Catalogue</h2>
              <div className="w-12 h-px bg-gold mx-auto mt-4" />
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12 scroll-fade-up">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`font-body text-xs tracking-[0.15em] uppercase px-5 py-2 border transition-all duration-300 ${
                    activeCategory === cat
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-border/60 text-muted-foreground hover:border-gold hover:text-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24 text-muted-foreground font-body text-sm tracking-wide">
                No specimens in this category yet.
              </div>
            )}

            <div className="text-center mt-16 scroll-fade-up">
              <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-3 border border-border text-sm tracking-[0.15em] uppercase font-body text-muted-foreground hover:border-gold hover:text-gold transition-all duration-500">
                View Full Catalogue <ArrowRight size={14} />
              </Link>
            </div>
          </FadeSection>
        </section>
      )}

      {/* ── WHY LUNÉVIA ── */}
      {vis.features && (
        <FadeSection className="bg-surface/30 border-y border-border/40 py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-fade-up">
              <p className="text-xs tracking-[0.3em] uppercase text-gold font-body mb-3">Our Promise</p>
              <h2 className="font-display text-3xl md:text-4xl font-light">Why Collectors Choose LUNÉVIA</h2>
              <div className="w-12 h-px bg-gold mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {config.features.map(({ title, desc }, i) => {
                const Icon = FEATURE_ICONS[i] ?? Gem;
                return (
                  <div key={title} className="scroll-fade-up group" style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="border border-border/50 p-8 h-full hover:border-gold/40 transition-colors duration-500 space-y-4">
                      <div className="w-10 h-10 border border-gold/40 flex items-center justify-center group-hover:bg-gold/10 transition-colors duration-300">
                        <Icon size={18} className="text-gold" />
                      </div>
                      <h3 className="font-display text-lg font-light">{title}</h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeSection>
      )}

      {/* ── OUR PROCESS ── */}
      {vis.steps && (
        <FadeSection className="container mx-auto px-6 py-24">
          <div className="text-center mb-16 scroll-fade-up">
            <p className="text-xs tracking-[0.3em] uppercase text-gold font-body mb-3">From Earth to Collection</p>
            <h2 className="font-display text-3xl md:text-4xl font-light">How We Select Our Specimens</h2>
            <div className="w-12 h-px bg-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {config.steps.map(({ title, body }, i) => (
              <div key={title} className="scroll-fade-up relative" style={{ transitionDelay: `${i * 100}ms` }}>
                {i < config.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 w-1/2 h-px border-t border-dashed border-border/50 z-10" style={{ left: "50%" }} />
                )}
                <div className="p-8 space-y-4 relative">
                  <span className="font-display text-5xl font-light text-gold/20 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg font-light">{title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeSection>
      )}

      {/* ── WHATSAPP CTA BANNER ── */}
      {vis.cta && (
        <FadeSection>
          <div className="relative overflow-hidden py-24">
            <div className="absolute inset-0 gold-gradient opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.35)_100%)]" />
            <div className="relative z-10 container mx-auto px-6 text-center space-y-6 scroll-fade-up">
              <p className="font-body text-xs tracking-[0.4em] uppercase text-primary-foreground/70">Speak Directly With Us</p>
              <h2 className="font-display text-3xl md:text-5xl font-light text-primary-foreground">{config.cta.heading}</h2>
              <p className="font-body text-sm text-primary-foreground/80 max-w-lg mx-auto leading-relaxed">{config.cta.subtext}</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-4 bg-primary-foreground text-foreground text-sm tracking-[0.2em] uppercase font-body font-medium hover:bg-primary-foreground/90 transition-all duration-300 shadow-lg"
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </FadeSection>
      )}

      {/* ── QUOTE ── */}
      {vis.quote && (
        <FadeSection className="border-y border-border/40 py-20">
          <div className="container mx-auto px-6 text-center scroll-fade-up max-w-2xl">
            <div className="text-gold font-display text-6xl leading-none mb-4 select-none">"</div>
            <p className="font-display text-xl md:text-2xl font-light italic text-foreground/80 leading-relaxed">
              {config.quote.text}
            </p>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mt-6">{config.quote.attribution}</p>
          </div>
        </FadeSection>
      )}

    </div>
  );
}
