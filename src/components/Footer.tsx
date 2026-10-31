import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, Gem, ShieldCheck, Globe, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    "Hello LUNÉVIA, I want to explore products and place an order."
  )}`;

  return (
    <footer className="border-t border-border/50 bg-background text-foreground">
      {/* Top Trust Ribbon */}
      <div className="border-b border-border/40 bg-secondary/20">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="p-2.5 rounded-full bg-gold/10 border border-gold/25 text-gold flex-shrink-0">
                <Gem size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] font-medium font-body text-foreground">
                  100% Natural Stones
                </h4>
                <p className="text-[11px] text-muted-foreground font-body">
                  No artificial dyes or heat treatments
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="p-2.5 rounded-full bg-gold/10 border border-gold/25 text-gold flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] font-medium font-body text-foreground">
                  Original Quality
                </h4>
                <p className="text-[11px] text-muted-foreground font-body">
                  Every piece is hand-picked and verified
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5">
              <div className="p-2.5 rounded-full bg-gold/10 border border-gold/25 text-gold flex-shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] font-medium font-body text-foreground">
                  Safe Worldwide Shipping
                </h4>
                <p className="text-[11px] text-muted-foreground font-body">
                  Packed carefully and fully insured
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="container mx-auto px-6 pt-12 pb-10">
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
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              Rare, hand-selected natural agate slices, geodes, and healing crystals for homes and collectors.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground/80 font-body">
              <Sparkles size={12} className="text-gold" />
              <span>Ethically Sourced Worldwide</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 font-medium">
              Explore Products
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-body">
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">
                All Products
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">
                Agate Slices & Coasters
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">
                Crystal Bowls & Trays
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">
                Amethyst & Geodes
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">
                New Arrivals
              </Link>
            </div>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 font-medium">
              Information
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-body">
              <Link to="/about" className="text-muted-foreground hover:text-gold transition-colors">
                About LUNÉVIA
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors">
                Contact & Inquiries
              </Link>
              <Link to="/terms-and-conditions" className="text-muted-foreground hover:text-gold transition-colors">
                Terms of Order & Delivery
              </Link>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-gold transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Col 4: Order & Inquire on WhatsApp */}
          <div className="space-y-3.5">
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
              Order on WhatsApp
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              To ask prices, see real video clips, or place an order, chat with us directly on WhatsApp.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded font-body text-xs tracking-[0.12em] uppercase font-semibold shadow hover:shadow-md transition-all"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp to Order
            </a>

            <div className="pt-1 flex flex-col gap-2 text-xs text-muted-foreground font-body">
              <a href="mailto:lunevia@gmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={13} className="text-gold" /> lunevia@gmail.com
              </a>
              <span className="flex items-center gap-2">
                <Phone size={13} className="text-gold" /> +91 9510990215
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-body">
          <p className="tracking-wide">
            © 2026 LUNÉVIA. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <Link to="/terms-and-conditions" className="hover:text-gold transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
