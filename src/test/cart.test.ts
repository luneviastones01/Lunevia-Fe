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

    const message = buildMultiProductWhatsAppMessage(mockItems, "https://www.shoplunévia.com");

    expect(message).toContain("Hello Lunévia Team");
    expect(message).toContain("1. Blue Lace Agate Slice (Ref #_AGATE) — Qty: 2");
    expect(message).toContain("Link: https://www.shoplunévia.com/product/prod_001_agate");
    expect(message).toContain("2. Deep Violet Amethyst Cluster (Ref #ETHYST) — Qty: 1");
    expect(message).toContain("Link: https://www.shoplunévia.com/product/prod_002_amethyst");
    expect(message).toContain("Total Items: 3 products");
  });
});
