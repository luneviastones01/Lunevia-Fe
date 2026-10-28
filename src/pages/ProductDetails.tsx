import { useParams, useNavigate, Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { ArrowLeft, MessageCircle, Share2, Sparkles, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SEO from "@/components/SEO";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = products.find((p) => p.id === id);
  const allImages = (product?.images && product.images.length > 0)
    ? product.images
    : (product?.image ? [product.image] : ["/placeholder.svg"]);
  const [activeImage, setActiveImage] = useState<string>("");
  const currentImage = activeImage && allImages.includes(activeImage) ? activeImage : allImages[0];
  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6">
        <SEO title="Specimen Not Found" noIndex={true} />
        <h2 className="font-display text-2xl mb-4">Specimen Not Found</h2>
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
          `Exquisite natural ${product.name} specimen from LUNÉVIA. Ethically sourced and handcrafted agate & mineral gemstone.`
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Catalogue
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors py-1 px-3 border border-border rounded"
            title="Share this specimen"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            {copied ? "Link Copied" : "Share"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Product Image Gallery */}
          <div className="flex flex-col space-y-4">
            <div
              className="relative overflow-hidden rounded-lg bg-[#0f0e0d] border border-border/50 shadow-2xl flex items-center justify-center p-3 sm:p-6 opacity-0 animate-fade-in w-full aspect-square"
              style={{ animationFillMode: "forwards" }}
            >
              {/* Ambient blurred glow matching image colors */}
              <img
                src={currentImage}
                alt=""
                aria-hidden="true"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-25 scale-125 pointer-events-none transition-all duration-500"
              />
              <img
                src={currentImage}
                alt={product.name}
                decoding="async"
                className="relative z-10 w-full h-full object-contain rounded transition-all duration-300"
              />
              {product.featured && (
                <span className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 bg-background/85 backdrop-blur-md border border-gold/40 text-gold text-[11px] font-body uppercase tracking-[0.15em] rounded-full shadow-lg">
                  <Sparkles size={12} /> Curated Piece
                </span>
              )}
            </div>

            {/* Thumbnail Row if more than 1 image */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      currentImage === img
                        ? "border-gold scale-105 shadow-md shadow-gold/20"
                        : "border-border/60 hover:border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} angle ${idx + 1}`}
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
              <p className="text-xs tracking-[0.25em] uppercase text-gold font-body mb-2">
                {product.category}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-light text-foreground">
                {product.name}
              </h1>
            </div>

            <div className="border-b border-border/50 pb-4">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-body">
                Specimen Reference #{product.id.slice(-6)}
              </span>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-body text-muted-foreground mb-3">
                About this Piece
              </h3>
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-body">
                {product.description || "A natural gemstone masterpiece, carefully selected for its distinctive crystalline banding and mineral purity."}
              </p>
            </div>

            {/* Inquire on WhatsApp */}
            <div className="pt-6 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded font-body text-sm tracking-[0.15em] uppercase font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle size={20} />
                Inquire on WhatsApp
              </a>

              <p className="text-xs text-center text-muted-foreground font-body">
                Direct inquiry with our gemologist for availability, custom mounting & worldwide delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
