export const siteConfig = {
  name: "LUNÉVIA",
  description: "Nature's Artistry, Refined — Luxury Handcrafted Agate & Gemstone Products",
  // Client's verified WhatsApp business concierge number
  whatsappNumber: "919510990215",
  // Default WhatsApp inquiry message prefix with only product name (no links)
  whatsappMessage: (productName: string) => {
    return `Hello LUNÉVIA, I am inquiring about "${productName}".\nCould you please share availability, price, and high-definition video?`;
  },
  // Hidden admin route path
  adminRoute: "/catalog-admin",
};
