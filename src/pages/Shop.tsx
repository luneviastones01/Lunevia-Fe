import { useState, useEffect } from "react";
import { useNavigationType } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";

export default function Shop() {
  const { products, categories, isLoading } = useProducts();
  const navType = useNavigationType();

  // If navigating from Navbar/other pages, always show "All".
  // Only restore previous category filter when pressing browser Back button (POP) from a product.
  const [active, setActive] = useState(() => {
    if (typeof window !== "undefined" && navType === "POP") {
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

  // Filter categories to only those with active specimens (or "All") so users never see an empty category by accident
  const visibleCategories = ["All", ...categories.filter((cat) => cat !== "All" && products.some((p) => p.category === cat))];
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
          {visibleCategories.map((cat) => (
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

        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest text-gold font-body">Loading Specimens...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-muted-foreground font-body">No products in this category yet.</p>
            {active !== "All" && (
              <button
                onClick={() => handleCategorySelect("All")}
                className="px-5 py-2 border border-gold text-gold text-xs uppercase tracking-[0.15em] font-body hover:bg-gold/10 transition-colors"
              >
                View All Specimens
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
