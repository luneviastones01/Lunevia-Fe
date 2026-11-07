import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Product } from "@/data/products";
import { siteConfig } from "@/config/site";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  image: string;
  price?: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getWhatsAppOrderUrl: () => string;
}

const CART_STORAGE_KEY = "lunevia_cart";

const CartContext = createContext<CartContextType | null>(null);

export function buildMultiProductWhatsAppMessage(items: CartItem[], origin: string): string {
  let msg = `Hello Lunévia Team,\n\nI would like to place an order / inquire about the following items in my selection:\n\n`;

  items.forEach((item, index) => {
    const ref = item.id ? ` (Ref #${item.id.slice(-6).toUpperCase()})` : "";
    const url = `${origin}/product/${item.id}`;
    msg += `${index + 1}. ${item.name}${ref} — Qty: ${item.quantity}\n   Link: ${url}\n\n`;
  });

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  msg += `Total Items: ${totalQty} product${totalQty > 1 ? "s" : ""}\n\n`;
  msg += `Could you please confirm product availability, provide pricing, and share high-definition videos?\n\nThank you!`;

  return msg;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error("Failed to save cart to localStorage", err);
      }
    }
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          quantity,
        },
      ];
    });

    toast.success(`Added "${product.name}" to selection`, {
      description: "Tap the bag icon to view and order your selection.",
      duration: 2500,
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getWhatsAppOrderUrl = useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.shoplunévia.com";
    const message = buildMultiProductWhatsAppMessage(items, origin);
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        getWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
