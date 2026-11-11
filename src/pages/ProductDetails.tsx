import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, MessageCircle, Share2, Sparkles, Check, ShieldCheck, Gem, Globe, ChevronLeft, ChevronRight, ZoomIn, X, ShoppingBag } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useState } from "react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import { ProductDetailsSkeleton } from "@/components/Skeleton";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const [copied, setCopied] = useState(false);

  const product = products.find((p) => p.id === id);
  const relatedProducts = product
    ? products.filter((p) => p.id !== product.id && p.category.toLowerCase() === product.category.toLowerCase())
    : [];
  const allImages = (product?.images && product.images.length > 0)
    ? product.images
    : (product?.image ? [product.image] : ["/placeholder.svg"]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const currentImage = allImages[activeIndex] || allImages[0];
  const location = useLocation();
  const fromPath = (location.state as any)?.from;
  const isFromHome = fromPath === "/";
  const backLabel = isFromHome ? "Back to Home" : "Back to Catalogue";

  if (isLoading && !product) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6">
        <SEO title="Product Not Found" noIndex={true} />
        <h2 className="font-display text-2xl mb-4">Product Not Found</h2>
        <p className="text-sm text-muted-foreground font-body mb-6">
          The requested piece is no longer available or the link has expired.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 border border-gold text-gold text-xs tracking-[0.15em] uppercase font-body hover:bg-gold/10"
        >
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappMessage(product.name)
  )}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on LUNÉVIA`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Product link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title={`${product.name} — ${product.category}`}
        description={
          product.description ||
          `Exquisite natural ${product.name} piece from LUNÉVIA. Ethically sourced and handcrafted agate & mineral gemstone.`
        }
        image={currentImage}
        type="product"
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          category: product.category,
          image: allImages,
          description: product.description,
          brand: {
            "@type": "Brand",
            name: "LUNÉVIA",
          },
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            price: "0",
            priceCurrency: "USD",
            url: typeof window !== "undefined" ? window.location.href : "",
            seller: {
              "@type": "Organization",
              name: "LUNÉVIA",
            },
          },
        }}
      />
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (isFromHome) {
                navigate("/");
              } else if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/shop");
              }
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> {backLabel}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors py-1 px-3 border border-border rounded"
            title="Share this product"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            {copied ? "Link Copied" : "Share"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Product Image Gallery */}
          <div className="flex flex-col space-y-4">
            <div
              className="relative overflow-hidden rounded-xl bg-card/60 border border-border/40 shadow-xl flex items-center justify-center opacity-0 animate-fade-in w-full aspect-square group cursor-zoom-in"
              style={{ animationFillMode: "forwards" }}
              onClick={() => setIsZoomOpen(true)}
              title="Click to view full-resolution product photo"
            >
              {/* Slides container with smooth sliding transform */}
              <div
                className="flex w-full h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {allImages.map((img, idx) => (
                  <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center relative overflow-hidden bg-black/40">
                    <img
                      src={img}
                      alt={`${product.name} - View ${idx + 1}`}
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {/* Tap to zoom hint pill */}
              <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/60 text-[11px] text-muted-foreground uppercase tracking-widest font-body opacity-80 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={13} className="text-gold" />
                <span>Zoom</span>
              </div>

              {/* Prev / Next Slide Arrows (smooth transition) */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:text-gold border border-border/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:text-gold border border-border/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row if more than 1 image */}
            {allImages.length > 1 && (
              <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-card/60 ${
                      activeIndex === idx
                        ? "border-gold scale-105 shadow-md shadow-gold/20 opacity-100"
                        : "border-border/40 opacity-50 hover:opacity-100 hover:border-border"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div
            className="flex flex-col space-y-6 opacity-0 animate-fade-up"
            style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs tracking-[0.25em] uppercase text-gold font-body">
                  {product.category}
                </span>
                <span className="text-border">•</span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-body">
                  Ref #{product.id.slice(-6)}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
                {product.name}
              </h1>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border/40">
              <h3 className="text-xs uppercase tracking-[0.2em] font-body text-gold/90 mb-2 font-medium">
                Product Details &amp; Specifications
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed font-body">
                {product.description || "A natural gemstone masterpiece, carefully selected for its distinctive crystalline banding and mineral purity."}
              </p>
            </div>

            {/* Collector Highlights */}
            <div className="grid grid-cols-3 gap-3 border-y border-border/40 py-4 text-center">
              <div className="flex flex-col items-center">
                <Gem size={16} className="text-gold mb-1.5" />
                <span className="text-[11px] font-medium font-body text-foreground">100% Natural</span>
                <span className="text-[10px] text-muted-foreground">Untreated Mineral</span>
              </div>
              <div className="flex flex-col items-center border-x border-border/40">
                <ShieldCheck size={16} className="text-gold mb-1.5" />
                <span className="text-[11px] font-medium font-body text-foreground">Authentic</span>
                <span className="text-[10px] text-muted-foreground">Curator Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <Globe size={16} className="text-gold mb-1.5" />
                <span className="text-[11px] font-medium font-body text-foreground">Worldwide</span>
                <span className="text-[10px] text-muted-foreground">Insured Transit</span>
              </div>
            </div>

            {/* Actions: Add to Selection & Direct WhatsApp */}
            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="w-full min-h-[50px] flex items-center justify-center gap-2.5 px-6 py-3.5 bg-card border border-gold/40 hover:border-gold hover:bg-gold/10 text-foreground font-body text-xs sm:text-sm tracking-[0.15em] uppercase font-semibold transition-all duration-300 rounded shadow-sm hover:shadow-gold/5 cursor-pointer"
                >
                  <ShoppingBag size={18} className="text-gold" />
                  Add to Selection
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[50px] flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded font-body text-xs sm:text-sm tracking-[0.15em] uppercase font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <MessageCircle size={18} />
                  Inquire With Our Team
                </a>
              </div>

              <p className="text-xs text-center text-muted-foreground font-body">
                Add multiple pieces to your selection to order together, or chat directly for videos &amp; sizing.
              </p>
            </div>
          </div>
        </div>

        {/* More Like This (Same Category) */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold font-body mb-2">
                  Similar Products
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-light text-foreground">
                  More in {product.category}
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors font-body flex items-center gap-1.5"
              >
                View Complete Catalogue &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen High-Resolution Zoom Lightbox */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Bar with Close button */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-body">
              {activeIndex + 1} / {allImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-secondary/80 border border-border text-foreground hover:text-gold transition-colors cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X size={20} />
            </button>
          </div>

          {/* Centered High-Definition Product Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={`${product.name} Fullscreen Macro View`}
              className="max-w-full max-h-[82vh] object-contain rounded shadow-2xl select-none"
            />

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-secondary/80 border border-border text-foreground hover:text-gold transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 p-3 rounded-full bg-secondary/80 border border-border text-foreground hover:text-gold transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          <p className="absolute bottom-4 text-xs text-muted-foreground tracking-wider font-body">
            Tap anywhere to close • {product.name}
          </p>
        </div>
      )}
    </div>
  );
}
