import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, Gem, ShieldCheck, Globe, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

const TRUST_ITEMS = [
  {
    icon: Gem,
    title: "100% Natural Stones",
    desc: "No artificial dyes or heat treatments",
  },
  {
    icon: ShieldCheck,
    title: "Original Quality",
    desc: "Every piece is hand-picked and verified",
  },
  {
    icon: Globe,
    title: "Safe Worldwide Shipping",
    desc: "Packed carefully and fully insured",
  },
  {
    icon: Sparkles,
    title: "Ethically Sourced",
    desc: "Direct partnerships with verified origins",
  },
  {
    icon: MessageCircle,
    title: "Personal Assistance",
    desc: "Live WhatsApp support with our team",
  },
];

export default function Footer() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hello LUNÉVIA, I want to explore products and place an order."
  )}`;

  return (
    <footer className="border-t border-border/50 bg-background text-foreground">
      {/* Top Live Continuous Trust Marquee Strip (Never pauses on hover) */}
      <div className="border-b border-border/40 bg-secondary/20 py-4 sm:py-5 overflow-hidden relative select-none">
        {/* Soft edge gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="animate-live-marquee flex items-center gap-10 sm:gap-16">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 shrink-0">
                <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0 shadow-xs">
                  <Icon size={18} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] sm:text-xs font-mono font-semibold tracking-[0.16em] uppercase text-foreground whitespace-nowrap">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#A8A8B5] font-body leading-tight whitespace-nowrap">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="container mx-auto px-5 md:px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div>
              <h3 className="font-display text-2xl font-medium gold-text-gradient tracking-wide">
                LUNÉVIA
              </h3>
              <p className="text-[11px] tracking-[0.2em] uppercase text-gold font-body mt-0.5">
                Natural Crystals & Agates
              </p>
            </div>
            <p className="text-sm text-[#B8B8C4] leading-relaxed font-body">
              Rare, hand-selected natural agate slices, geodes, and healing crystals for homes and collectors.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground/80 font-body">
              <Sparkles size={12} className="text-gold" />
              <span>Ethically Sourced Worldwide</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
              Explore Products
            </h4>
            <div className="flex flex-col text-sm font-body">
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                All Products
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Agate Slices & Coasters
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Crystal Bowls & Trays
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Amethyst & Geodes
              </Link>
            </div>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
              Information
            </h4>
            <div className="flex flex-col text-sm font-body">
              <Link to="/about" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                About LUNÉVIA
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Contact & Inquiries
              </Link>
              <Link to="/terms-and-conditions" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Terms of Order & Delivery
              </Link>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Privacy Policy
              </Link>
              <Link to="/wholesale" className="text-muted-foreground hover:text-gold transition-colors py-2 min-h-[44px] flex items-center">
                Wholesale &amp; Bulk Orders
              </Link>
            </div>
          </div>

          {/* Col 4: Order & Inquire on WhatsApp */}
          <div className="space-y-4">
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
              Order on WhatsApp
            </h4>
            <p className="text-sm text-[#B8B8C4] leading-relaxed font-body">
              To ask prices, see real video clips, or place an order, chat with us directly on WhatsApp.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded font-body text-xs tracking-[0.12em] uppercase font-semibold shadow hover:shadow-md transition-all"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp to Order
            </a>

            <div className="pt-1 flex flex-col gap-2.5 text-sm text-[#B8B8C4] font-body">
              <a href="mailto:luneviastones01@gmail.com" className="flex items-center gap-2.5 hover:text-gold transition-colors min-h-[44px]">
                <Mail size={15} className="text-gold" /> luneviastones01@gmail.com
              </a>
              <a href="tel:+919510990215" className="flex items-center gap-2.5 hover:text-gold transition-colors min-h-[44px]">
                <Phone size={15} className="text-gold" /> +91 9510990215
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-body">
          <p className="tracking-wide">
            © 2026 LUNÉVIA. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="hover:text-gold transition-colors py-2">
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <Link to="/terms-and-conditions" className="hover:text-gold transition-colors py-2">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
