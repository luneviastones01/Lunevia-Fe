import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";

export default function Shop() {
  const { products, categories } = useProducts();
  const [active, setActive] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("lunevia_shop_category") || "All";
    }
    return "All";
  });

  const handleCategorySelect = (cat: string) => {
    setActive(cat);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lunevia_shop_category", cat);
    }
  };

  useEffect(() => {
    const lastId = sessionStorage.getItem("lunevia_last_product_id");
    if (lastId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`product-card-${lastId}`);
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "instant" });
        } else {
          const savedY = sessionStorage.getItem("lunevia_scroll_/shop");
          if (savedY) {
            window.scrollTo({ top: Number(savedY), behavior: "instant" });
          }
        }
        sessionStorage.removeItem("lunevia_last_product_id");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title="Curated Specimen Catalogue"
        description="Browse LUNÉVIA's curated collection of natural agate slices, amethyst geodes, and rare mineral specimens. Handpicked for collectors and luxury interiors."
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "LUNÉVIA Specimen Catalogue",
          description: "Curated collection of natural agate and mineral specimens.",
          hasPart: products.map((p) => ({
            "@type": "Product",
            name: p.name,
            category: p.category,
            image: p.image,
            description: p.description,
          })),
        }}
      />
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-body mb-3">Collection</p>
          <h1 className="font-display text-3xl md:text-4xl font-light">Our Specimens</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-body border rounded-sm transition-all duration-300 ${
                active === cat
                  ? "border-gold text-gold bg-gold/10"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground font-body py-20">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
