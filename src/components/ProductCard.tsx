import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage(product.name)
  )}`;

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const handleCardClick = () => {
    if (typeof window !== "undefined" && currentPath === "/shop") {
      sessionStorage.setItem("lunevia_last_product_id", product.id);
      sessionStorage.setItem("lunevia_scroll_/shop", String(window.scrollY));
    }
  };

  return (
    <div id={`product-card-${product.id}`} className="group block relative">
      <Link
        to={`/product/${product.id}`}
        state={{ from: currentPath }}
        onClick={handleCardClick}
        className="block"
      >
        <div className="relative overflow-hidden rounded-md bg-card aspect-square border border-border/40">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-xs uppercase tracking-widest text-gold font-body font-medium">
              View Specimen Details &rarr;
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-2">
        <Link
          to={`/product/${product.id}`}
          state={{ from: currentPath }}
          onClick={handleCardClick}
          className="space-y-1 flex-1"
        >
          <p className="text-[11px] text-muted-foreground tracking-[0.15em] uppercase font-body">
            {product.category}
          </p>
          <h3 className="font-display text-base font-medium text-foreground group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 shrink-0 mt-1"
          title={`Inquire on WhatsApp about ${product.name}`}
          aria-label={`Inquire on WhatsApp about ${product.name}`}
        >
          <MessageCircle size={18} />
        </a>
      </div>
    </div>
  );
}
