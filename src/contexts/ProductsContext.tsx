import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { products as initialProducts, Product } from "@/data/products";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : (typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : "/api");
const API_HOST = API_BASE.replace(/\/api\/?$/, "");

export interface AddProductData {
  name: string;
  price?: number;
  category: string;
  description: string;
  image?: string;
  imageFile?: File | null;
  featured?: boolean;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  image?: string;
  imageFile?: File | null;
  featured?: boolean;
}

interface ProductsContextType {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  addProduct: (product: AddProductData) => Promise<boolean>;
  updateProduct: (id: string, product: UpdateProductData) => Promise<boolean>;
  deleteProduct: (id: string, passcode?: string) => Promise<boolean>;
  addCategory: (category: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (category: string, passcode?: string) => Promise<boolean>;
  refetchProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: { products?: Product[]; categories?: string[] };
}) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialData?.products && initialData.products.length > 0) {
      return initialData.products;
    }
    if (typeof window !== "undefined") {
      const winData = (window as any).__INITIAL_DATA__;
      if (winData?.products && Array.isArray(winData.products) && winData.products.length > 0) {
        return winData.products;
      }
      try {
        const saved = localStorage.getItem("lunevia_cached_products");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return initialProducts;
  });
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lunevia_custom_categories");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [dbCategories, setDbCategories] = useState<string[]>(() => {
    if (initialData?.categories && initialData.categories.length > 0) {
      return initialData.categories;
    }
    if (typeof window !== "undefined") {
      const winData = (window as any).__INITIAL_DATA__;
      if (winData?.categories && Array.isArray(winData.categories)) {
        return winData.categories;
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get admin passcode & 7-day session header
  const getAdminHeaders = (passcode?: string) => {
    const pin = passcode || (typeof window !== "undefined" ? sessionStorage.getItem("lunevia_admin_passcode") : null) || "1234";
    const session = typeof window !== "undefined" ? localStorage.getItem("lunevia_admin_session") : null;
    return {
      "x-admin-passcode": pin,
      "x-admin-pin": pin,
      ...(session ? { "x-admin-session": session } : {}),
    };
  };

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/products?limit=100`, {
        signal: AbortSignal.timeout(3000), // quick fallback if backend is offline
      });
      if (res.ok) {
        const json = await res.json();
        const apiProducts = json?.data?.products || [];
        if (Array.isArray(apiProducts)) {
          const mapped: Product[] = apiProducts.map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            price: p.price || 0,
            category: typeof p.category === "object" && p.category?.name ? p.category.name : (p.category || "Specimen"),
            description: p.description || "",
            image: (p.images && p.images[0]?.url)
              ? (p.images[0].url.startsWith("http") ? p.images[0].url : `${API_HOST}${p.images[0].url}`)
              : (p.image || "/placeholder.svg"),
            featured: Boolean(p.featured),
          }));
          setProducts(mapped);
          if (mapped.length > 0) {
            try {
              localStorage.setItem("lunevia_cached_products", JSON.stringify(mapped));
            } catch {
              // ignore
            }
          }
          return;
        }
      }
    } catch {
      // Backend not running or offline, keep default products
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        const apiCategories = json?.data?.categories || [];
        if (Array.isArray(apiCategories)) {
          const names = apiCategories
            .map((c: any) => (typeof c === "string" ? c : c?.name))
            .filter(Boolean);
          setDbCategories(names);
        }
      }
    } catch {
      // Backend offline
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const categories = [
    "All",
    ...Array.from(
      new Set([
        ...products.map((p) => p.category),
        ...dbCategories,
        ...customCategories,
      ])
    ).filter(Boolean),
  ];

  const addProduct = async (productData: AddProductData): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("price", String(productData.price || 0));
      formData.append("category", productData.category);
      formData.append("description", productData.description || "");
      formData.append("featured", String(Boolean(productData.featured)));

      if (productData.imageFile) {
        formData.append("images", productData.imageFile);
      } else if (productData.image) {
        formData.append("image", productData.image);
      }

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: formData,
      });

      if (res.ok) {
        toast.success("Specimen added & indexed in MongoDB!");
        await fetchProducts();
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        const id = Date.now().toString();
        const localImg = productData.image || (productData.imageFile ? URL.createObjectURL(productData.imageFile) : "/placeholder.svg");
        setProducts((prev) => [{ ...productData, id, price: productData.price || 0, image: localImg }, ...prev]);
        toast.warning(err.message || "Added locally (Check backend connection)");
        return true;
      }
    } catch {
      const id = Date.now().toString();
      const localImg = productData.image || (productData.imageFile ? URL.createObjectURL(productData.imageFile) : "/placeholder.svg");
      setProducts((prev) => [{ ...productData, id, price: productData.price || 0, image: localImg }, ...prev]);
      toast.info("Saved locally in browser catalog");
      return true;
    }
  };

  const updateProduct = async (id: string, updateData: UpdateProductData): Promise<boolean> => {
    try {
      if (/^[a-f\d]{24}$/i.test(id)) {
        const formData = new FormData();
        if (updateData.name !== undefined) formData.append("name", updateData.name);
        if (updateData.category !== undefined) formData.append("category", updateData.category);
        if (updateData.description !== undefined) formData.append("description", updateData.description);
        if (updateData.featured !== undefined) formData.append("featured", String(updateData.featured));

        if (updateData.imageFile) {
          formData.append("images", updateData.imageFile);
        } else if (updateData.image) {
          formData.append("image", updateData.image);
        }

        const res = await fetch(`${API_BASE}/products/${id}`, {
          method: "PATCH",
          headers: getAdminHeaders(),
          body: formData,
        });

        if (res.ok) {
          toast.success("Specimen updated in MongoDB!");
          await fetchProducts();
          return true;
        }
      }
    } catch {
      // Offline fallback
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newImg = updateData.imageFile
            ? URL.createObjectURL(updateData.imageFile)
            : (updateData.image || p.image);
          return {
            ...p,
            name: updateData.name ?? p.name,
            category: updateData.category ?? p.category,
            description: updateData.description ?? p.description,
            featured: updateData.featured ?? p.featured,
            image: newImg,
          };
        }
        return p;
      })
    );
    toast.success("Specimen updated");
    return true;
  };

  const deleteProduct = async (id: string, passcode?: string): Promise<boolean> => {
    try {
      if (/^[a-f\d]{24}$/i.test(id)) {
        const res = await fetch(`${API_BASE}/products/${id}`, {
          method: "DELETE",
          headers: getAdminHeaders(passcode),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Failed to delete specimen");
          return false;
        }
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    }
  };

  const addCategory = async (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    setCustomCategories((prev) => {
      const next = Array.from(new Set([...prev, trimmed]));
      try {
        localStorage.setItem("lunevia_custom_categories", JSON.stringify(next));
      } catch {}
      return next;
    });
    setDbCategories((prev) => Array.from(new Set([...prev, trimmed])));
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        await fetchCategories();
      }
    } catch {
      // saved locally
    }
  };

  const renameCategory = (oldName: string, newName: string) => {
    if (oldName === "All" || !newName.trim()) return;
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: newName } : p))
    );
    setCustomCategories((prev) => {
      const next = prev.map((c) => (c === oldName ? newName : c));
      try {
        localStorage.setItem("lunevia_custom_categories", JSON.stringify(next));
      } catch {}
      return next;
    });
    setDbCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
  };

  const deleteCategory = async (category: string, passcode?: string): Promise<boolean> => {
    if (category === "All") return false;
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(category)}`, {
        method: "DELETE",
        headers: getAdminHeaders(passcode),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err?.message) {
          toast.error(err.message);
          return false;
        }
      }
    } catch {
      // offline fallback
    }

    setCustomCategories((prev) => {
      const next = prev.filter((c) => c !== category);
      try {
        localStorage.setItem("lunevia_custom_categories", JSON.stringify(next));
      } catch {}
      return next;
    });
    setDbCategories((prev) => prev.filter((c) => c !== category));
    return true;
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        renameCategory,
        deleteCategory,
        refetchProducts: fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
