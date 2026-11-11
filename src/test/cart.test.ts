import { describe, it, expect } from "vitest";
import { buildMultiProductWhatsAppMessage, CartItem } from "../contexts/CartContext";

describe("Cart WhatsApp Message Builder", () => {
  it("generates a formatted live message for multiple cart items", () => {
    const mockItems: CartItem[] = [
      {
        id: "prod_001_agate",
        name: "Blue Lace Agate Slice",
        category: "Agate Slices",
        image: "/agate.webp",
        quantity: 2,
      },
      {
        id: "prod_002_amethyst",
        name: "Deep Violet Amethyst Cluster",
        category: "Geodes & Crystals",
        image: "/amethyst.webp",
        quantity: 1,
      },
    ];

    const message = buildMultiProductWhatsAppMessage(mockItems);

    expect(message).toContain("Hello Lunévia Team");
    expect(message).toContain("1. Blue Lace Agate Slice — Qty: 2");
    expect(message).toContain("2. Deep Violet Amethyst Cluster — Qty: 1");
    expect(message).not.toContain("http");
    expect(message).not.toContain("Link:");
    expect(message).toContain("Total Items: 3 products");
  });
});
