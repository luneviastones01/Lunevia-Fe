import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartDrawer() {
  const {
    items,
    totalItems,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getWhatsAppOrderUrl,
  } = useCart();

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border/60 shadow-2xl z-50 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            aria-label="Shopping Cart Drawer"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-medium text-foreground tracking-wide">
                    Your Selection
                  </h2>
                  <p className="text-[11px] font-body text-muted-foreground">
                    {totalItems} item{totalItems === 1 ? "" : "s"} selected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 px-4">
                  <div className="w-16 h-16 rounded-full bg-surface border border-border/60 flex items-center justify-center text-gold/60">
                    <ShoppingBag size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-light text-foreground">
                      Your selection is empty
                    </h3>
                    <p className="font-body text-xs text-muted-foreground max-w-xs leading-relaxed">
                      Explore our handcrafted agate, crystals, and rare mineral gemstones to curate your order.
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 text-xs uppercase tracking-[0.18em] font-body rounded transition-colors duration-300 mt-2"
                  >
                    Browse Catalogue <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex gap-3.5 p-3 rounded-xl bg-card border border-border/50 hover:border-gold/30 transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <Link
                        to={`/product/${item.id}`}
                        onClick={closeCart}
                        className="w-20 h-20 rounded-lg overflow-hidden bg-surface shrink-0 border border-border/40 relative block"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/product/${item.id}`}
                              onClick={closeCart}
                              className="font-display text-sm font-medium text-foreground hover:text-gold transition-colors truncate block"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-muted-foreground/60 hover:text-red-400 p-1 transition-colors shrink-0"
                              title="Remove item"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] tracking-wider uppercase text-gold/90 font-mono">
                              {item.category}
                            </span>
                            <span className="text-border text-xs">•</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                              Ref #{item.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                          <span className="text-[11px] text-muted-foreground font-body">
                            Quantity
                          </span>
                          <div className="flex items-center border border-border/60 rounded-md bg-surface/50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/50 p-6 space-y-4 bg-surface/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] font-body text-muted-foreground">
                    Total Selection
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-2">
                  <a
                    href={getWhatsAppOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[50px] inline-flex items-center justify-center gap-3 px-6 py-3.5 gold-gradient text-primary-foreground rounded-lg font-body text-xs sm:text-sm tracking-[0.18em] uppercase font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:opacity-95 hover:scale-[1.01]"
                  >
                    <MessageCircle size={18} />
                    ORDER ON WHATSAPP
                  </a>
                  <p className="text-[11px] text-center text-muted-foreground font-body leading-relaxed">
                    Direct concierge assistance with product specs, photos &amp; shipping.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Clear All Items
                  </button>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="text-[11px] text-gold hover:text-gold-light transition-colors"
                  >
                    Continue Browsing &rarr;
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
