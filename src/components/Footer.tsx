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
        <div className="container mx-auto px-5 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {/* Item 1 */}
            <div className="flex items-center gap-4 max-w-sm mx-auto md:mx-0 w-full">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/25 text-gold flex items-center justify-center shrink-0">
                <Gem size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] font-medium font-body text-foreground">
                  100% Natural Stones
                </h4>
                <p className="text-[13px] md:text-sm text-[#A8A8B5] font-body mt-0.5">
                  No artificial dyes or heat treatments
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-4 max-w-sm mx-auto md:mx-0 w-full">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/25 text-gold flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] font-medium font-body text-foreground">
                  Original Quality
                </h4>
                <p className="text-[13px] md:text-sm text-[#A8A8B5] font-body mt-0.5">
                  Every piece is hand-picked and verified
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-4 max-w-sm mx-auto md:mx-0 w-full">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/25 text-gold flex items-center justify-center shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] font-medium font-body text-foreground">
                  Safe Worldwide Shipping
                </h4>
                <p className="text-[13px] md:text-sm text-[#A8A8B5] font-body mt-0.5">
                  Packed carefully and fully insured
                </p>
              </div>
            </div>
          </div>
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
