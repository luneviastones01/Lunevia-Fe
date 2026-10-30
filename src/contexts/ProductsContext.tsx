import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { products as initialProducts, Product } from "@/data/products";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : (typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : "https://lunevia-be.vercel.app/api");
const API_HOST = API_BASE.replace(/\/api\/?$/, "");

// Auto-compress & convert to WebP/AVIF via Cloudinary on-the-fly transformations
export function optimizeCloudinaryUrl(url: string, width = 800): string {
  if (!url || typeof url !== "string") return "/placeholder.svg";
  // Guard against truncated Cloudinary URLs with no image file/publicId
  if (url.endsWith("/upload/f_auto") || url.endsWith("/image/upload") || url.endsWith("/upload/")) {
    return "/placeholder.svg";
  }
  if (!url.includes("res.cloudinary.com") || url.includes("f_auto")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export interface AddProductData {
  name: string;
  price?: number;
  category: string;
  description: string;
  image?: string;
  imageFile?: File | null;
  images?: string[];
  imageFiles?: File[] | null;
  featured?: boolean;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  image?: string;
  imageFile?: File | null;
  images?: string[];
  imageFiles?: File[] | null;
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
  renameCategory: (oldName: string, newName: string) => Promise<void>;
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
    if (initialData?.products && initialData.products.length > 0) return initialData.products;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lunevia_cached_products");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
      const winData = (window as any).__INITIAL_DATA__;
      if (winData?.products && Array.isArray(winData.products) && winData.products.length > 0) return winData.products;
    }
    return initialProducts;
  });
  // Categories loaded from local cache first for 0ms render, updated live from API
  const [dbCategories, setDbCategories] = useState<string[]>(() => {
    if (initialData?.categories && initialData.categories.length > 0) return initialData.categories;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lunevia_cached_categories");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
      const winData = (window as any).__INITIAL_DATA__;
      if (winData?.categories && Array.isArray(winData.categories)) return winData.categories;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get admin passcode & 7-day session header
  const getAdminHeaders = (passcode?: string) => {
    const pin = passcode || (typeof window !== "undefined" ? sessionStorage.getItem("lunevia_admin_passcode") : null) || "";
    const session = typeof window !== "undefined" ? localStorage.getItem("lunevia_admin_session") : null;
    return {
      "x-admin-passcode": pin,
      "x-admin-pin": pin,
      ...(session ? { "x-admin-session": session } : {}),
    };
  };

  // Transform raw API product into UI Product model
  const mapApiProducts = useCallback((apiProducts: any[]): Product[] => {
    return apiProducts.map((p: any) => {
      const rawImages: string[] = Array.isArray(p.images) && p.images.length > 0
        ? p.images.map((img: any) => {
            const u = typeof img === "string" ? img : img?.url;
            if (!u) return "";
            return u.startsWith("http") || u.startsWith("/") ? u : `${API_HOST}/${u}`;
          }).filter(Boolean)
        : (p.image ? [p.image] : []);

      const optimizedImages = rawImages.map((u) => optimizeCloudinaryUrl(u));
      const primaryImage = optimizedImages[0] || "/placeholder.svg";

      return {
        id: p._id || p.id,
        name: p.name,
        price: p.price || 0,
        category: typeof p.category === "object" && p.category?.name ? p.category.name : (p.category || "Specimen"),
        description: p.description || "",
        image: primaryImage,
        images: optimizedImages.length > 0 ? optimizedImages : [primaryImage],
        featured: Boolean(p.featured),
      };
    });
  }, []);

  // Single aggregated bootstrap call replacing 3 separate roundtrips
  const fetchBootstrap = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/bootstrap`, {
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = await res.json();
        // 1. Process products
        if (Array.isArray(data.products) && data.products.length > 0) {
          const mapped = mapApiProducts(data.products);
          setProducts(mapped);
          try {
            localStorage.setItem("lunevia_cached_products", JSON.stringify(mapped));
          } catch {}
        }
        // 2. Process categories
        if (Array.isArray(data.categories)) {
          const names = data.categories
            .map((c: any) => (typeof c === "string" ? c : c?.name))
            .filter(Boolean);
          setDbCategories(names);
          try {
            localStorage.setItem("lunevia_cached_categories", JSON.stringify(names));
          } catch {}
        }
        // 3. Dispatch homepage config to HomepageContext
        if (data.homepageConfig && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("lunevia_bootstrap_homepage", { detail: data.homepageConfig })
          );
        }
        return true;
      }
    } catch {
      // Backend offline or fallback to individual calls
    } finally {
      setIsLoading(false);
    }
    return false;
  }, [mapApiProducts]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/products?limit=100`, {
        signal: AbortSignal.timeout(10000), // allow 10s for serverless cold start
      });
      if (res.ok) {
        const json = await res.json();
        const apiProducts = json?.data?.products || [];
        if (Array.isArray(apiProducts)) {
          const mapped = mapApiProducts(apiProducts);
          setProducts(mapped);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("lunevia_cached_products", JSON.stringify(mapped));
            } catch {}
          }
          return;
        }
      }
    } catch {
      // Backend not running or offline, keep default products
    } finally {
      setIsLoading(false);
    }
  }, [mapApiProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        signal: AbortSignal.timeout(10000), // allow 10s for serverless cold start
      });
      if (res.ok) {
        const json = await res.json();
        const apiCategories = json?.data?.categories || [];
        if (Array.isArray(apiCategories)) {
          const names = apiCategories
            .map((c: any) => (typeof c === "string" ? c : c?.name))
            .filter(Boolean);
          setDbCategories(names);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("lunevia_cached_categories", JSON.stringify(names));
            } catch {}
          }
        }
      }
    } catch {
      // Backend offline
    }
  }, []);

  useEffect(() => {
    // Attempt single bootstrap first; fall back to individual if bootstrap fails
    fetchBootstrap().then((success) => {
      if (!success) {
        fetchProducts();
        fetchCategories();
      }
    });
  }, [fetchBootstrap, fetchProducts, fetchCategories]);

  const categories = [
    "All",
    ...Array.from(
      new Set([
        ...dbCategories,
        ...products.map((p) => p.category),
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

      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach((file) => formData.append("images", file));
      } else if (productData.imageFile) {
        formData.append("images", productData.imageFile);
      }

      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((imgUrl) => formData.append("images", imgUrl));
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
        await fetchCategories();
        return true;
      } else {
        if (res.status === 413) {
          toast.error("Images combined exceed upload limit (4.5MB). Please upload fewer or smaller images.");
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Failed to add product. Check backend connection.");
        }
        return false;
      }
    } catch {
      toast.error("Cannot reach server. Product not saved.");
      return false;
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

        if (updateData.imageFiles && updateData.imageFiles.length > 0) {
          updateData.imageFiles.forEach((file) => formData.append("images", file));
        } else if (updateData.imageFile) {
          formData.append("images", updateData.imageFile);
        }

        if (updateData.images && updateData.images.length > 0) {
          updateData.images.forEach((imgUrl) => formData.append("images", imgUrl));
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
        } else {
          if (res.status === 413) {
            toast.error("Images combined exceed upload limit (4.5MB). Please upload fewer or smaller images.");
          } else {
            const err = await res.json().catch(() => ({}));
            toast.error(err.message || "Failed to update specimen in database.");
          }
          return false;
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
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        await fetchCategories();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to add category.");
      }
    } catch {
      toast.error("Cannot reach server. Category not saved.");
    }
  };

  const renameCategory = async (oldName: string, newName: string) => {
    if (oldName === "All" || !newName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(oldName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        await fetchCategories();
        await fetchProducts();
      } else {
        toast.error("Failed to rename category on server.");
      }
    } catch {
      toast.error("Cannot reach server. Category not renamed.");
    }
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
        toast.error(err.message || "Failed to delete category.");
        return false;
      }
      await fetchCategories();
      return true;
    } catch {
      toast.error("Cannot reach server. Category not deleted.");
      return false;
    }
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
