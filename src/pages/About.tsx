import { Gem, Globe, Award } from "lucide-react";
import heroAbout from "@/assets/hero-about.jpg";
import { useScrollFadeUp } from "@/hooks/useScrollFadeUp";
import SEO from "@/components/SEO";

export default function About() {
  const scrollRef = useScrollFadeUp();

  return (
    <div className="min-h-screen" ref={scrollRef}>
      <SEO
        title="Our Story & Geological Heritage"
        description="Learn about LUNÉVIA's mission, ethical sourcing practices, and the geological mastery behind our handcrafted agate and rare mineral collection."
        image={heroAbout}
      />
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img src={heroAbout} alt="About LUNÉVIA" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-background/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 text-center px-6 space-y-4">
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-body opacity-0 animate-fade-up">Our Story</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light opacity-0 animate-fade-up" style={{ animationDelay: "150ms" }}>About LUNÉVIA</h1>
        </div>
      </section>

      <div className="container mx-auto px-6 py-24">
        <div className="scroll-fade-up max-w-3xl mx-auto space-y-8 mb-24">
          <p className="text-muted-foreground font-body leading-relaxed text-center">
            LUNÉVIA was born from a deep reverence for the Earth's hidden masterpieces. We believe that every agate holds within it millions of years of geological artistry — layers of color, light, and form that rival the finest works of human creativity.
          </p>
          <p className="text-muted-foreground font-body leading-relaxed text-center">
            Our founders, driven by a passion for natural beauty and ethical sourcing, set out to curate a collection of the world's most extraordinary agate specimens. Each piece in the LUNÉVIA collection is hand-selected by our team of expert gemologists for its unique character, vivid color, and exceptional quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {[
            {
              icon: Gem,
              title: "Expert Curation",
              description: "Our gemologists travel the globe to source the rarest and most beautiful agate specimens, ensuring every piece meets our exacting standards.",
            },
            {
              icon: Globe,
              title: "Ethically Sourced",
              description: "We partner exclusively with responsible mines and suppliers who share our commitment to environmental stewardship and fair labor practices.",
            },
            {
              icon: Award,
              title: "Certified Authenticity",
              description: "Every LUNÉVIA specimen comes with a certificate of authenticity detailing its origin, composition, and unique geological characteristics.",
            },
          ].map((item, i) => (
            <div key={item.title} className="scroll-fade-up text-center border border-border rounded-sm p-8 bg-card hover:border-gold/30 transition-colors duration-500" style={{ transitionDelay: `${i * 120}ms` }}>
              <item.icon size={28} className="text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="scroll-fade-up border-y border-border/50 py-20 text-center max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-body mb-4">Our Mission</p>
          <p className="font-display text-xl md:text-2xl font-light leading-relaxed">
            "To unveil nature's hidden artistry and bring the Earth's most extraordinary treasures into the hands of those who appreciate timeless beauty."
          </p>
        </div>
      </div>
    </div>
  );
}
