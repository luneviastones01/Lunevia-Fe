export const siteConfig = {
  name: "LUNÉVIA",
  description: "Nature's Artistry, Refined — Luxury Handcrafted Agate & Gemstone Products",
  // Client's verified WhatsApp business concierge number
  whatsappNumber: "919510990215",
  // Default WhatsApp inquiry message prefix with optional ref and link
  whatsappMessage: (productName: string, refId?: string, productUrl?: string) => {
    let msg = `Hello LUNÉVIA, I am inquiring about the product "${productName}"`;
    if (refId) msg += ` (Ref #${refId.slice(-6).toUpperCase()})`;
    if (productUrl) msg += `\nLink: ${productUrl}`;
    msg += `.\nCould you please share availability, price, and high-definition video?`;
    return msg;
  },
  // Hidden admin route path
  adminRoute: "/catalog-admin",
};
