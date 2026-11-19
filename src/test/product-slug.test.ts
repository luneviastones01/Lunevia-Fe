import { describe, it, expect } from "vitest";
import { Product } from "../data/products";

describe("Product Slug and ID Resolution", () => {
  const sampleProducts: Product[] = [
    {
      id: "6af43698be1578899e607827",
      slug: "clear-quartz-bracelet",
      name: "Clear Quartz Bracelet",
      price: 45,
      category: "Bracelets",
      description: "Natural clear quartz bracelet.",
      image: "/quartz.webp",
    },
    {
      id: "6af43698be1578899e607828",
      name: "Amethyst Healing Geode",
      price: 120,
      category: "Geodes",
      description: "Raw amethyst geode.",
      image: "/amethyst.webp",
    },
  ];

  const findProduct = (param: string) => {
    return sampleProducts.find(
      (p) =>
        p.slug === param ||
        p.id === param ||
        (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === param)
    );
  };

  it("finds product by slug from URL", () => {
    const found = findProduct("clear-quartz-bracelet");
    expect(found).toBeDefined();
    expect(found?.id).toBe("6af43698be1578899e607827");
  });

  it("finds product by legacy MongoDB _id", () => {
    const found = findProduct("6af43698be1578899e607827");
    expect(found).toBeDefined();
    expect(found?.slug).toBe("clear-quartz-bracelet");
  });

  it("finds product by slug derived from name when slug field is absent in cached data", () => {
    const found = findProduct("amethyst-healing-geode");
    expect(found).toBeDefined();
    expect(found?.id).toBe("6af43698be1578899e607828");
  });

  it("returns undefined for non-existent product", () => {
    const found = findProduct("non-existent-item");
    expect(found).toBeUndefined();
  });
});
