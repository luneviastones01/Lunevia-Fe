import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <SEO
        title="Terms & Conditions — LUNÉVIA"
        description="Review the collector terms, mineral authenticity standards, and shipping conditions at LUNÉVIA."
      />

      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors font-body"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <div className="border-b border-border/50 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/50 border border-gold/30 rounded-full text-gold text-xs uppercase tracking-widest font-body mb-4">
            <Scale size={13} /> Collector Agreement
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-3">
            Terms & Conditions
          </h1>
          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Last Updated: October 2026
          </p>
        </div>

        <div className="space-y-8 text-foreground/85 font-body leading-relaxed text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              1. Natural Mineral Characteristics
            </h2>
            <p>
              Every specimen presented by LUNÉVIA is a 100% natural, untreated mineral formation created over millions of years. As each specimen is entirely unique:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>Natural crystalline inclusions, raw vugs, mineral banding, and surface texturing are inherent hallmarks of authenticity, not flaws.</li>
              <li>Photographs and 4K video clips captured under controlled studio lighting aim to present true colors; however, monitor calibration and ambient daylight may cause subtle tonal variations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              2. Concierge Orders & Availability
            </h2>
            <p>
              Due to the one-of-a-kind nature of natural gemstone specimens, each piece is subject to prior sale. Orders and reservations are confirmed on a first-come, first-served basis following consultation with our WhatsApp concierge or authorized invoice issuance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              3. Global Shipping & Insurance
            </h2>
            <p>
              We ship worldwide using premium express couriers (DHL / FedEx / specialized freight). Every shipment is:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>Packed in shock-absorbent archival cushioning tailored for fragile mineral crystals.</li>
              <li>Fully insured against loss or damage during transit up to delivery handover.</li>
              <li>Subject to local customs duties, taxes, or import levies as determined by the destination country's customs authority.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              4. Authenticity Guarantee & Returns
            </h2>
            <p>
              LUNÉVIA guarantees the provenance and authenticity of every specimen. In the rare event a piece arrives damaged in transit, notify us within 48 hours of receipt with unboxing photos/video to facilitate immediate claim processing and replacement or credit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              5. Intellectual Property
            </h2>
            <p>
              All imagery, text descriptions, branding, and specimen archive data featured on this website are the proprietary property of LUNÉVIA and may not be reproduced or distributed without explicit written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              6. Governing Law & Inquiries
            </h2>
            <p>
              For inquiries regarding custom curation contracts, specimen certificates, or these terms, contact our concierge directly:
            </p>
            <div className="p-4 rounded-lg bg-card/60 border border-border/40 text-sm space-y-1">
              <p><strong className="text-foreground">LUNÉVIA Legal & Client Services</strong></p>
              <p className="text-muted-foreground">Email: lunevia@gmail.com</p>
              <p className="text-muted-foreground">Concierge: +91 9510990215</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
