import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import heroContact from "@/assets/hero-contact.jpg";
import { useScrollFadeUp } from "@/hooks/useScrollFadeUp";
import SEO from "@/components/SEO";

export default function Contact() {
  const scrollRef = useScrollFadeUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSent(false), 4000);
  };

  const contactItems = [
    { icon: Mail, label: "Email", value: "lunevia@gmail.com" },
    { icon: Phone, label: "Phone", value: "+91 9510990215" },
    { icon: MapPin, label: "Address", value: "Khambhat, Gujarat, India." },
  ];

  return (
    <div className="min-h-screen" ref={scrollRef}>
      <SEO
        title="Contact Our Gemologist Concierge"
        description="Inquire about custom gemstone curations, specimen sourcing, and worldwide delivery. Connect with the LUNÉVIA showroom in Khambhat, Gujarat."
        image={heroContact}
      />
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img src={heroContact} alt="Contact LUNÉVIA" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-background/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 text-center px-6 space-y-4">
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-body opacity-0 animate-fade-up">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light opacity-0 animate-fade-up" style={{ animationDelay: "150ms" }}>Contact Us</h1>
        </div>
      </section>

      <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-10">
            <p className="scroll-fade-up text-muted-foreground font-body leading-relaxed">
              We'd love to hear from you. Whether you have a question about a specimen, need guidance choosing the perfect piece, or simply want to learn more about our collection — our team is here to help.
            </p>

            <div className="space-y-6">
              {contactItems.map((item, i) => (
                <div key={item.label} className="scroll-fade-up flex items-start gap-4" style={{ transitionDelay: `${i * 120}ms` }}>
                  <div className="p-3 border border-border rounded-sm">
                    <item.icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-body mb-1">{item.label}</p>
                    <p className="text-sm font-body text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="scroll-fade-up border border-border rounded-sm p-8 bg-card" style={{ transitionDelay: "200ms" }}>
            {sent && (
              <div className="mb-6 p-4 border border-gold/30 bg-gold/5 rounded-sm text-center">
                <p className="text-sm text-gold font-body">Thank you! Your message has been sent.</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground font-body mb-2">Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm font-body focus:outline-none focus:border-gold transition-colors duration-300" />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground font-body mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm font-body focus:outline-none focus:border-gold transition-colors duration-300" />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground font-body mb-2">Message</label>
                <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full px-4 py-3 bg-transparent border border-border text-foreground text-sm font-body focus:outline-none focus:border-gold transition-colors duration-300 resize-none" />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-8 py-3 gold-gradient text-primary-foreground text-sm tracking-[0.15em] uppercase font-body hover:opacity-90 transition-opacity duration-300">
                <Send size={14} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
