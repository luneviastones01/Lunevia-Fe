export const siteConfig = {
  name: "LUNÉVIA",
  description: "Nature's Artistry, Refined — Luxury Handcrafted Agate & Gemstone Specimens",
  // Client's verified WhatsApp business concierge number
  whatsappNumber: "919510990215",
  // Default WhatsApp inquiry message prefix
  whatsappMessage: (productName: string) =>
    `Hello Lunevia, I would like to inquire about the specimen "${productName}" from your collection. Could you please share more details?`,
  // Hidden admin route path
  adminRoute: "/catalog-admin",
};
