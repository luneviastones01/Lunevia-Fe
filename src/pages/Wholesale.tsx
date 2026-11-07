import { Package, Gem, Tag, Box, Wrench, Handshake, MessageCircle, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import SEO from "@/components/SEO";

const wholesaleMessage = encodeURIComponent(
  "Hello Lunévia Team,\n\nI'm interested in exploring your wholesale and bulk manufacturing options.\n\nI'd like to discuss my business requirements, product specifications, quantities and customisation possibilities.\n\nPlease connect me with your team so we can discuss the details.\n\nThank you!"
);

const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${wholesaleMessage}`;

const services = [
  {
    icon: Package,
    title: "Bulk & Wholesale Orders",
    desc: "Wholesale supply solutions for retailers, wholesalers, resellers and crystal shops.",
  },
  {
    icon: Gem,
    title: "Custom Gemstone Products",
    desc: "Customise gemstones, designs, sizes, colours and product specifications according to your requirements.",
  },
  {
    icon: Tag,
    title: "Private Label & Own Brand Manufacturing",
    desc: "Explore manufacturing opportunities for businesses looking to develop products under their own brand.",
  },
  {
    icon: Box,
    title: "Custom Packaging & Branding",
    desc: "Discuss customised packaging, branding and presentation requirements.",
  },
  {
    icon: Wrench,
    title: "Made-to-Order Manufacturing",
    desc: "Discuss unique product ideas and manufacturing possibilities based on your specifications and production feasibility.",
  },
  {
    icon: Handshake,
    title: "Long-Term Business Partnerships",
    desc: "Build lasting business relationships through consistent communication and manufacturing support.",
  },
];

export default function Wholesale() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-background text-foreground">
      <SEO
        title="Wholesale & Bulk Orders — LUNÉVIA®"
        description="Partner with LUNÉVIA® for personalised wholesale and bulk gemstone manufacturing solutions tailored to your business requirements."
      />

      {/* ── Hero Header ── */}
      <section className="container mx-auto px-5 md:px-6 py-14 md:py-20 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-gold font-body mb-3">
          B2B &amp; Manufacturing
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
          Wholesale &amp; Bulk Orders
        </h1>
        <p className="mt-3 font-display text-lg md:text-xl text-gold/80 italic font-light">
          Your Vision. Our Manufacturing Expertise.
        </p>
        <div className="w-12 h-px bg-gold mx-auto mt-4 mb-6" />
        <p className="max-w-2xl mx-auto text-sm md:text-base text-[#B8B8C4] leading-relaxed font-body">
          Looking to source gemstone products in bulk? Partner with LUNÉVIA® for personalised
          manufacturing solutions tailored to your business requirements.
        </p>
      </section>

      {/* ── Services Grid ── */}
      <section className="container mx-auto px-5 md:px-6 pb-14 md:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card/60 border border-border/40 rounded-xl p-6 flex flex-col gap-4 [@media(hover:hover)]:hover:border-gold/40 [@media(hover:hover)]:hover:bg-card/80 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/25 text-gold flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-body text-sm font-semibold tracking-wide text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-[#B8B8C4] leading-relaxed font-body">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Block ── */}
      <section className="container mx-auto px-5 md:px-6 pb-14 md:pb-20">
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-7 md:p-10 text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/25 text-gold flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-light text-foreground mb-3">
            Direct Manufacturer. Personal Assistance. No Bots.
          </h2>
          <div className="w-10 h-px bg-gold mx-auto mb-4" />
          <p className="text-sm md:text-base text-[#B8B8C4] leading-relaxed font-body">
            Every business has different requirements. At LUNÉVIA®, we believe in understanding
            your needs through direct, personal conversations. Discuss your ideas, quantities,
            customisation requirements and expectations directly with our team.
          </p>
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="container mx-auto px-5 md:px-6 pb-14 md:pb-20 flex flex-col items-center gap-4 text-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 w-full max-w-sm min-h-[52px] py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white rounded font-body text-sm tracking-[0.12em] uppercase font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <MessageCircle size={20} />
          Discuss Bulk Requirements on WhatsApp
        </a>
        <p className="text-xs text-muted-foreground/70 font-body italic max-w-sm">
          Quotations depend on product specifications, quantities and customisation requirements.
        </p>
      </section>
    </div>
  );
}
