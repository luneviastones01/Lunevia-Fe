import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useCart } from "@/contexts/CartContext";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addToCart } = useCart();
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.shoplunévia.com";
  const productUrl = `${origin}/product/${product.id}`;
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage(product.name, product.id, productUrl)
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
        <div className="relative overflow-hidden rounded-md bg-[#16161f] aspect-square border border-border/50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="w-full h-full object-contain p-2 md:p-0 md:object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Hover overlay visible only on desktop devices with hover support */}
          <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end p-4">
            <span className="text-xs uppercase tracking-widest text-gold font-body font-medium">
              View Product Details &rarr;
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-3 md:mt-4 flex items-center justify-between gap-3">
        <Link
          to={`/product/${product.id}`}
          state={{ from: currentPath }}
          onClick={handleCardClick}
          className="space-y-0.5 flex-1 min-w-0"
        >
          <p className="text-[11px] text-muted-foreground tracking-[0.15em] uppercase font-body truncate">
            {product.category}
          </p>
          <h3 className="font-display text-base font-medium text-foreground group-hover:text-gold transition-colors duration-300 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-10 h-10 rounded-full border border-border/70 hover:border-gold text-muted-foreground hover:text-gold bg-card/60 flex items-center justify-center transition-colors cursor-pointer"
            title={`Add ${product.name} to selection`}
            aria-label={`Add ${product.name} to selection`}
          >
            <ShoppingBag size={17} />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 flex items-center justify-center"
            title={`Inquire on WhatsApp about ${product.name}`}
            aria-label={`Inquire on WhatsApp about ${product.name}`}
          >
            <MessageCircle size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}
