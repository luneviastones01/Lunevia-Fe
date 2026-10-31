import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <SEO
        title="Privacy Policy — LUNÉVIA"
        description="Learn how LUNÉVIA protects collector privacy, inquiry details, and personal data."
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
            <Shield size={13} /> Collector Confidentiality
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Last Updated: October 2026
          </p>
        </div>

        <div className="space-y-8 text-foreground/85 font-body leading-relaxed text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              1. Information We Collect
            </h2>
            <p>
              At LUNÉVIA, we hold collector privacy in the highest regard. When you browse our catalogue, contact our gemologist concierge, or place an inquiry via WhatsApp or email, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>Name and contact details (email address, phone number).</li>
              <li>Delivery address and customs clearance details for international specimen transit.</li>
              <li>Collector inquiries, bespoke specimen requests, and communication history.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              2. How Your Information Is Used
            </h2>
            <p>
              Your information is exclusively used to provide bespoke collector services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>Facilitating direct gemologist consultations and sharing high-definition specimen videos.</li>
              <li>Coordinating fully insured global logistics and provenance documentation.</li>
              <li>Responding to customer service inquiries and custom curation requests.</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              We never sell, rent, or trade your personal information with third-party marketers or brokers under any circumstance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              3. WhatsApp Concierge & Communications
            </h2>
            <p>
              Direct messaging via WhatsApp is subject to WhatsApp's end-to-end encryption and privacy policies. Communications exchanged with our team remain confidential and are solely utilized to address your curation requests.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              4. Data Retention & Security
            </h2>
            <p>
              We apply industry-standard technical and operational safeguards to protect your data against unauthorized access, loss, or disclosure. Invoicing and provenance archives are retained only as required for tax compliance and authenticity verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-normal">
              5. Contact Us
            </h2>
            <p>
              If you have any questions regarding our privacy practices or wish to review, update, or delete your contact records, reach out directly:
            </p>
            <div className="p-4 rounded-lg bg-card/60 border border-border/40 text-sm space-y-1">
              <p><strong className="text-foreground">LUNÉVIA Gemological Archive</strong></p>
              <p className="text-muted-foreground">Email: lunevia@gmail.com</p>
              <p className="text-muted-foreground">Concierge: +91 9510990215</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
