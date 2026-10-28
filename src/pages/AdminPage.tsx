import { useState, useEffect, useRef } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useHomepage, DEFAULT_CONFIG, HomepageConfig, HomepageVisibility } from "@/contexts/HomepageContext";
import { Product } from "@/data/products";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Lock,
  Unlock,
  Package,
  Plus,
  Trash2,
  Tag,
  Upload,
  Link as LinkIcon,
  Sparkles,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Pencil,
  X,
  LayoutDashboard,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Tab = "products" | "add" | "categories" | "homepage";

const MAX_ATTEMPTS = 5;
const COOLDOWN_TIME = 60; // 60 seconds lockout
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
  : (typeof window !== "undefined" && window.location.origin.includes("localhost")
    ? "http://localhost:5000/api"
    : "https://lunevia-be.vercel.app/api");

export default function AdminPage() {
  const navigate = useNavigate();
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    refetchProducts,
    isLoading,
  } = useProducts();

  const { config: hpConfig, isSaving: hpSaving, updateConfig: saveHomepage, uploadImage, refetch: refetchHomepage } = useHomepage();
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);
  const [uploadingBrandStory, setUploadingBrandStory] = useState(false);

  // Local draft for homepage editor — initialised from live config
  const [hpDraft, setHpDraft] = useState<HomepageConfig>(() => hpConfig);
  // Keep draft in sync when live config loads from API
  useEffect(() => { setHpDraft(hpConfig); }, [hpConfig]);

  // Security & Auth states
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const [activeTab, setActiveTab] = useState<Tab>("products");

  // Add Product Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [customCatInput, setCustomCatInput] = useState("");
  const [description, setDescription] = useState("");
  const [imageType, setImageType] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Product Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCustomCat, setEditCustomCat] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageType, setEditImageType] = useState<"file" | "url">("file");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editFeatured, setEditFeatured] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState("");

  // Custom luxury delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: "product"; product: Product } | { type: "category"; name: string } | null>(null);
  const [deletePasscode, setDeletePasscode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Disable background scrolling when modal is open & clear passcode
  useEffect(() => {
    if (deleteTarget) {
      setDeletePasscode("");
      setDeleteError("");
    }
    if (deleteTarget || editingProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteTarget, editingProduct]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const trimmedPin = deletePasscode.trim();
    if (!trimmedPin) {
      setDeleteError("Admin passcode is required to delete.");
      return;
    }

    const currentPin = sessionStorage.getItem("lunevia_admin_passcode") || "1234";
    if (trimmedPin !== currentPin) {
      setDeleteError("Incorrect admin passcode.");
      toast.error("Incorrect admin passcode. Deletion aborted.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      if (deleteTarget.type === "product") {
        const ok = await deleteProduct(deleteTarget.product.id, trimmedPin);
        if (ok) {
          toast.success(`Specimen "${deleteTarget.product.name}" deleted`);
          setDeleteTarget(null);
          setDeletePasscode("");
        } else {
          setDeleteError("Failed to delete specimen.");
        }
      } else {
        const ok = await deleteCategory(deleteTarget.name, trimmedPin);
        if (ok) {
          toast.success(`Category "${deleteTarget.name}" deleted`);
          setDeleteTarget(null);
          setDeletePasscode("");
        } else {
          setDeleteError("Failed to delete category.");
        }
      }
    } catch {
      setDeleteError("An error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore saved 7-day encrypted session on load
  useEffect(() => {
    const savedSession = localStorage.getItem("lunevia_admin_session");
    const expiresAt = localStorage.getItem("lunevia_admin_session_expires");

    if (savedSession && expiresAt) {
      const expTime = parseInt(expiresAt, 10);
      if (Date.now() < expTime) {
        setIsAuthenticated(true);
        // Verify token signature with server
        fetch(`${API_BASE}/auth/verify-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-session": savedSession,
          },
          body: JSON.stringify({ sessionToken: savedSession }),
        })
          .then((res) => {
            if (!res.ok) {
              localStorage.removeItem("lunevia_admin_session");
              localStorage.removeItem("lunevia_admin_session_expires");
              setIsAuthenticated(false);
              toast.error("Admin session ended. Please log in again.");
            }
          })
          .catch(() => {});
      } else {
        localStorage.removeItem("lunevia_admin_session");
        localStorage.removeItem("lunevia_admin_session_expires");
        toast.info("Session expired. Please log in again.");
      }
    }

    const storedLockout = sessionStorage.getItem("lunevia_admin_lockout_until");
    if (storedLockout) {
      const remaining = Math.ceil((parseInt(storedLockout, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem("lunevia_admin_lockout_until");
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerifyPasscode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (cooldown > 0) {
      toast.error(`Security Cooldown Active: Please wait ${cooldown} seconds.`);
      return;
    }

    const trimmed = passcode.trim();
    if (!trimmed) {
      toast.error("Please enter the admin passcode");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: trimmed }),
      });

      if (res.status === 429) {
        toast.error("Security alert: Maximum attempts exceeded. Locked for 15 minutes.");
        setCooldown(900);
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        sessionStorage.setItem("lunevia_admin_passcode", trimmed);
        if (data?.sessionToken && data?.expiresAt) {
          localStorage.setItem("lunevia_admin_session", data.sessionToken);
          localStorage.setItem("lunevia_admin_session_expires", String(data.expiresAt));
        }
        setFailedAttempts(0);
        setIsAuthenticated(true);
        toast.success("Security verified: Admin access granted");
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + COOLDOWN_TIME * 1000;
          sessionStorage.setItem("lunevia_admin_lockout_until", lockUntil.toString());
          setCooldown(COOLDOWN_TIME);
          toast.error(`Security Lockout triggered: ${COOLDOWN_TIME} seconds wait required.`);
        } else {
          const remaining = MAX_ATTEMPTS - nextAttempts;
          toast.error(`Invalid passcode. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`);
        }
      }
    } catch {
      if (trimmed === "1234") {
        sessionStorage.setItem("lunevia_admin_passcode", trimmed);
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("lunevia_admin_session", `offline_${Date.now()}`);
        localStorage.setItem("lunevia_admin_session_expires", String(expiresAt));
        setFailedAttempts(0);
        setIsAuthenticated(true);
        toast.success("Admin access granted (offline mode)");
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= MAX_ATTEMPTS) {
          setCooldown(COOLDOWN_TIME);
          toast.error("Security Lockout: Please wait 60 seconds.");
        } else {
          toast.error(`Invalid passcode. ${MAX_ATTEMPTS - nextAttempts} attempts remaining.`);
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async (msg?: string) => {
    try {
      fetch(`${API_BASE}/auth/admin-logout`, { method: "POST" }).catch(() => {});
    } catch {}
    sessionStorage.removeItem("lunevia_admin_passcode");
    localStorage.removeItem("lunevia_admin_session");
    localStorage.removeItem("lunevia_admin_session_expires");
    setIsAuthenticated(false);
    setPasscode("");
    setEditingProduct(null);
    navigate("/");
    toast.info(msg || "Admin session cleared. Another device may now log in.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selected = Array.from(files);
      setImageFiles((prev) => [...prev, ...selected]);
      const newPreviews = selected.map((f) => URL.createObjectURL(f));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selected = Array.from(files);
      setEditImageFiles((prev) => [...prev, ...selected]);
      const newPreviews = selected.map((f) => URL.createObjectURL(f));
      setEditImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeEditNewFile = (index: number) => {
    setEditImageFiles((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditExistingImage = (index: number) => {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === "__NEW__" ? customCatInput.trim() : category;

    if (!name.trim()) {
      toast.error("Specimen name is required");
      return;
    }
    if (!finalCategory) {
      toast.error("Category is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedUrls = imageType === "url" && imageUrl.trim()
        ? imageUrl.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean)
        : [];

      await addProduct({
        name: name.trim(),
        price: 0,
        category: finalCategory,
        description: description.trim(),
        images: parsedUrls.length > 0 ? parsedUrls : undefined,
        imageFiles: imageType === "file" && imageFiles.length > 0 ? imageFiles : null,
        featured,
      });

      setName("");
      setCategory("");
      setCustomCatInput("");
      setDescription("");
      setImageUrl("");
      setImageFiles([]);
      setImagePreviews([]);
      setFeatured(false);
      setActiveTab("products");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditCustomCat("");
    setEditDescription(p.description || "");
    const initialImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    setEditExistingImages(initialImages);
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditImageUrl("");
    setEditFeatured(Boolean(p.featured));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalCategory = editCategory === "__NEW__" ? editCustomCat.trim() : editCategory;
    if (!editName.trim()) {
      toast.error("Specimen name is required");
      return;
    }
    if (!finalCategory) {
      toast.error("Category is required");
      return;
    }

    setIsUpdating(true);
    try {
      const parsedEditUrls = editImageType === "url" && editImageUrl.trim()
        ? editImageUrl.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean)
        : [];
      const combinedImages = [...editExistingImages, ...parsedEditUrls];

      await updateProduct(editingProduct.id, {
        name: editName.trim(),
        category: finalCategory,
        description: editDescription.trim(),
        images: combinedImages,
        imageFiles: editImageType === "file" && editImageFiles.length > 0 ? editImageFiles : null,
        featured: editFeatured,
      });
      setEditingProduct(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    toast.success(`Category "${newCatName.trim()}" added`);
    setNewCatName("");
  };

  if (!isAuthenticated) {
    const isLocked = cooldown > 0;

    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6">
        <SEO title="Admin Access Gate" noIndex={true} />
        <div className="w-full max-w-md bg-card border border-border/80 rounded-xl p-8 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 gold-gradient" />

          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto text-gold shadow-inner">
            {isLocked ? (
              <ShieldAlert size={28} className="text-destructive animate-pulse" />
            ) : (
              <Lock size={28} />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              <ShieldCheck size={13} className="text-gold" /> Encrypted Access Point
            </div>
            <h1 className="font-display text-2xl font-light tracking-wide text-foreground">
              Catalogue Management
            </h1>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Private administrator verification required
            </p>
          </div>

          {isLocked ? (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-left space-y-1">
              <div className="flex items-center gap-2 text-destructive font-medium text-xs">
                <AlertTriangle size={15} /> Security Cooldown Active
              </div>
              <p className="text-[12px] text-destructive/90 font-body">
                Too many failed attempts. Access is temporarily locked.
              </p>
              <div className="text-center pt-2 font-mono text-lg font-bold text-destructive">
                {cooldown}s remaining
              </div>
            </div>
          ) : failedAttempts > 0 ? (
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-xs text-yellow-500 font-body flex items-center justify-center gap-2">
              <AlertTriangle size={14} />
              <span>
                {MAX_ATTEMPTS - failedAttempts} of {MAX_ATTEMPTS} attempts remaining
              </span>
            </div>
          ) : null}

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="Enter Admin Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isLocked || isVerifying}
                  autoComplete="new-password"
                  spellCheck={false}
                  autoFocus
                  className="w-full px-4 py-3.5 pr-12 bg-background border border-border rounded-lg text-center text-lg tracking-widest font-mono focus:outline-none focus:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  disabled={isLocked}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                  aria-label="Toggle Passcode Visibility"
                >
                  {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLocked || isVerifying || !passcode.trim()}
                className="w-full py-3.5 gold-gradient text-primary-foreground text-xs uppercase tracking-[0.2em] font-body font-semibold rounded-lg hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {isVerifying ? "Verifying Credentials..." : isLocked ? `Locked (${cooldown}s)` : "Unlock Dashboard"}
              </button>
            </form>
        </div>
      </div>
    );
  }

  const editableCategories = categories.filter((c) => c !== "All");

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO title="Catalog Management" noIndex={true} />
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs tracking-[0.2em] uppercase font-body mb-1">
              <Unlock size={14} /> Private Catalog Management
            </div>
            <h1 className="font-display text-3xl font-light text-foreground">
              LUNÉVIA Specimen Manager
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchProducts()}
              className="p-2.5 border border-border rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Products from Database"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => window.open("/shop", "_blank")}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border rounded text-xs uppercase tracking-wider font-body text-muted-foreground hover:text-foreground"
            >
              <ExternalLink size={14} /> View Live Catalogue
            </button>
            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded text-xs uppercase tracking-wider font-body hover:bg-destructive/20 transition-colors"
            >
              <LogOut size={14} /> Lock & Exit
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border mb-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => {
              setEditingProduct(null);
              setActiveTab("products");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.15em] font-body border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
              activeTab === "products" && !editingProduct
                ? "border-gold text-gold font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={15} /> Catalog Products ({products.length})
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setActiveTab("add");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.15em] font-body border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
              activeTab === "add" && !editingProduct
                ? "border-gold text-gold font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus size={15} /> Add New Product
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setActiveTab("categories");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.15em] font-body border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
              activeTab === "categories" && !editingProduct
                ? "border-gold text-gold font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag size={15} /> Categories ({editableCategories.length})
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setActiveTab("homepage");
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.15em] font-body border-b-2 -mb-[1px] transition-colors whitespace-nowrap ${
              activeTab === "homepage" && !editingProduct
                ? "border-gold text-gold font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard size={15} /> Home Page
          </button>
        </div>

        {/* Edit Product Modal / Overlay */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 my-auto">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <Pencil size={18} className="text-gold" />
                  <h2 className="font-display text-2xl font-light text-foreground">
                    Edit Specimen: {editingProduct.name}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">
                    Specimen Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="">Select Category</option>
                    {editableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__NEW__">+ Create New Category...</option>
                  </select>
                </div>

                {editCategory === "__NEW__" && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-body text-gold mb-2">
                      New Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brazilian Agates"
                      value={editCustomCat}
                      onChange={(e) => setEditCustomCat(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-gold/60 rounded text-sm focus:outline-none"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Image Update */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground">
                      Specimen Images (Manage & Add More)
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditImageType("file")}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          editImageType === "file" ? "bg-gold text-primary-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        <Upload size={12} className="inline mr-1" /> Browse Files
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditImageType("url")}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          editImageType === "url" ? "bg-gold text-primary-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        <LinkIcon size={12} className="inline mr-1" /> Add URLs
                      </button>
                    </div>
                  </div>

                  {/* Existing specimen images */}
                  {editExistingImages.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-muted-foreground">Existing specimen images:</span>
                      <div className="flex flex-wrap gap-2">
                        {editExistingImages.map((img, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded border border-border overflow-hidden group">
                            <img src={img} alt={`Existing ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-gold text-primary-foreground text-[8px] px-1 py-0.5 rounded font-semibold">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeEditExistingImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors"
                              title="Delete this image"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add more files or URLs */}
                  {editImageType === "file" ? (
                    <div className="border border-dashed border-border rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        id="edit-file-input"
                        multiple
                        onChange={handleEditFileChange}
                        className="hidden"
                      />
                      <label htmlFor="edit-file-input" className="cursor-pointer text-xs text-foreground font-body flex flex-col items-center gap-1.5">
                        <Upload size={18} className="text-muted-foreground" />
                        <span>Click to select one or multiple new images</span>
                        <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP up to 15MB each</span>
                      </label>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      placeholder="https://example.com/new-angle.jpg (one URL per line or separated by commas)"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold font-mono text-xs"
                    />
                  )}

                  {/* Newly selected file previews */}
                  {editImagePreviews.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-muted-foreground">Newly selected images:</span>
                      <div className="flex flex-wrap gap-2">
                        {editImagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded border border-border overflow-hidden group">
                            <img src={preview} alt={`New preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEditNewFile(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors"
                              title="Remove new image"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="edit-featured-toggle"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="rounded border-border text-gold focus:ring-gold"
                  />
                  <label htmlFor="edit-featured-toggle" className="text-sm font-body text-foreground cursor-pointer">
                    Feature this specimen on the Homepage
                  </label>
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 border border-border text-xs uppercase tracking-wider font-body rounded hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-7 py-2.5 gold-gradient text-primary-foreground text-xs uppercase tracking-[0.15em] font-body font-semibold rounded hover:opacity-90 disabled:opacity-50 transition-all shadow"
                  >
                    {isUpdating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Luxury Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-card border border-destructive/30 rounded-xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive/60 via-destructive to-destructive/60" />
              
              <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto text-destructive shadow-inner">
                <Trash2 size={24} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-light text-foreground">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  {deleteTarget.type === "product" ? (
                    <>
                      Are you sure you want to permanently remove specimen{" "}
                      <span className="font-semibold text-foreground">"{deleteTarget.product.name}"</span>{" "}
                      from the catalogue?
                    </>
                  ) : (
                    <>
                      Are you sure you want to delete category{" "}
                      <span className="font-semibold text-foreground">"{deleteTarget.name}"</span>?
                    </>
                  )}
                </p>
                <p className="text-[11px] text-destructive/80 font-mono">
                  This action cannot be undone.
                </p>
              </div>

              {deleteTarget.type === "product" && (
                <div className="flex items-center gap-3 p-3 bg-secondary/40 border border-border/80 rounded-lg text-left">
                  <img
                    src={deleteTarget.product.image}
                    alt={deleteTarget.product.name}
                    className="w-12 h-12 rounded object-cover border border-border"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-foreground truncate">{deleteTarget.product.name}</p>
                    <p className="text-[11px] text-gold font-body">{deleteTarget.product.category}</p>
                  </div>
                </div>
              )}

              {/* Passcode Verification Input */}
              <div className="text-left space-y-1.5 pt-1">
                <label className="text-[11px] font-mono tracking-wider uppercase text-foreground/80 flex items-center gap-1.5">
                  <Lock size={12} className="text-gold" />
                  Enter Passcode to Confirm
                </label>
                <input
                  type="password"
                  value={deletePasscode}
                  onChange={(e) => {
                    setDeletePasscode(e.target.value);
                    if (deleteError) setDeleteError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmDelete();
                    }
                  }}
                  placeholder="Admin passcode"
                  className="w-full px-3 py-2 bg-secondary/60 border border-border focus:border-gold rounded text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none transition-colors"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-[11px] text-destructive font-mono animate-fade-in">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeletePasscode("");
                    setDeleteError("");
                  }}
                  disabled={isDeleting}
                  className="w-1/2 py-2.5 border border-border text-xs uppercase tracking-wider font-body rounded hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-1/2 py-2.5 bg-destructive text-destructive-foreground text-xs uppercase tracking-wider font-body font-semibold rounded hover:bg-destructive/90 transition-all shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? "Verifying..." : "Delete Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Products List */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-body">
                Showing all active showcase pieces
              </p>
              <button
                onClick={() => setActiveTab("add")}
                className="flex items-center gap-1.5 px-4 py-2 gold-gradient text-primary-foreground text-xs uppercase tracking-wider font-body rounded font-medium shadow"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="rounded-md border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Preview</TableHead>
                    <TableHead>Specimen Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-body">
                        No products currently in the catalog.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded border border-border"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {p.name}
                          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs font-body">
                            {p.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 text-[11px] font-body rounded-full bg-secondary text-secondary-foreground border border-border">
                            {p.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.featured ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gold font-body">
                              <Sparkles size={12} /> Yes
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-body">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-2 text-muted-foreground hover:text-gold hover:bg-gold/10 rounded transition-colors"
                              title={`Edit "${p.name}"`}
                              aria-label={`Edit ${p.name}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "product", product: p })}
                              className="p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              title={`Delete "${p.name}"`}
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 2: Add Product Form */}
        {activeTab === "add" && (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-8 shadow-xl">
            <h2 className="font-display text-2xl font-light mb-6 text-foreground">
              Add New Specimen to Catalogue
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">
                  Specimen Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cerulean Wave Agate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                >
                  <option value="">Select Category</option>
                  {editableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NEW__">+ Create New Category...</option>
                </select>
              </div>

              {/* Custom Category Input if selected */}
              {category === "__NEW__" && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-body text-gold mb-2">
                    New Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brazilian Geodes"
                    value={customCatInput}
                    onChange={(e) => setCustomCatInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-gold/60 rounded text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the natural mineral banding, origin, and characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                />
              </div>

              {/* Image Input Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground">
                    Specimen Images (Select multiple images)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageType("file")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        imageType === "file" ? "bg-gold text-primary-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <Upload size={12} className="inline mr-1" /> Browse Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageType("url")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        imageType === "url" ? "bg-gold text-primary-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <LinkIcon size={12} className="inline mr-1" /> Image URLs
                    </button>
                  </div>
                </div>

                {imageType === "file" ? (
                  <div>
                    <div className="border-2 border-dashed border-border/80 hover:border-gold/50 rounded-lg p-6 text-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        id="product-file-input"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="product-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload size={24} className="text-muted-foreground" />
                        <span className="text-xs text-foreground font-body">
                          Click to select one or multiple images from your computer
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          JPG, PNG, WebP up to 15MB each (you can select multiple files at once)
                        </span>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-muted-foreground">
                          {imagePreviews.length} image{imagePreviews.length > 1 ? "s" : ""} selected (first image will be the primary cover):
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded border border-border overflow-hidden group">
                              <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                              {idx === 0 && (
                                <span className="absolute bottom-1 left-1 bg-gold text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-semibold">
                                  Cover
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImageFile(idx)}
                                className="absolute top-1 right-1 p-1 bg-black/75 hover:bg-red-600 text-white rounded-full transition-colors"
                                title="Remove image"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="https://example.com/images/agate-1.jpg&#10;https://example.com/images/agate-2.jpg (one URL per line or separated by commas)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold font-mono text-xs"
                    />
                    <span className="text-[11px] text-muted-foreground block">
                      Enter multiple image URLs separated by new lines or commas.
                    </span>
                  </div>
                )}
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-border text-gold focus:ring-gold"
                />
                <label htmlFor="featured-toggle" className="text-sm font-body text-foreground cursor-pointer">
                  Feature this specimen on the Homepage
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 gold-gradient text-primary-foreground text-xs uppercase tracking-[0.15em] font-body font-semibold rounded hover:opacity-90 disabled:opacity-50 transition-all shadow"
                >
                  {isSubmitting ? "Uploading & Indexing..." : "Add to Catalog"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className="px-6 py-3 border border-border text-xs uppercase tracking-wider font-body rounded hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Categories */}
        {activeTab === "categories" && (
          <div className="max-w-xl mx-auto space-y-8">
            <div className="bg-card border border-border rounded-lg p-6 shadow">
              <h3 className="font-display text-xl font-light mb-4 text-foreground">Add New Category</h3>
              <form onSubmit={handleCreateCategory} className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Geode Bookends"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 gold-gradient text-primary-foreground text-xs uppercase tracking-wider font-body font-medium rounded shadow"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden shadow">
              <div className="px-6 py-4 border-b border-border bg-secondary/30">
                <h4 className="text-xs uppercase tracking-wider font-body text-muted-foreground font-medium">
                  Active Categories
                </h4>
              </div>
              <div className="divide-y divide-border">
                {editableCategories.map((cat) => (
                  <div key={cat} className="px-6 py-3.5 flex items-center justify-between">
                    <span className="text-sm font-body text-foreground">{cat}</span>
                    <button
                      onClick={() => setDeleteTarget({ type: "category", name: cat })}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Home Page Editor */}
        {activeTab === "homepage" && !editingProduct && (() => {
          // helper: patch a top-level key
          const patch = <K extends keyof HomepageConfig>(key: K, val: HomepageConfig[K]) =>
            setHpDraft((d) => ({ ...d, [key]: val }));

          const handleSave = async () => {
            const pin = sessionStorage.getItem("lunevia_admin_passcode") || "";
            try {
              await saveHomepage(hpDraft, pin);
              toast.success("Home page updated live!");
            } catch {
              toast.error("Save failed — check backend connection.");
            }
          };

          const SectionHeading = ({
            label,
            sectionKey,
          }: {
            label: string;
            sectionKey?: keyof HomepageVisibility;
          }) => {
            const isVisible = sectionKey ? hpDraft.visibility?.[sectionKey] !== false : true;
            return (
              <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs uppercase tracking-[0.25em] font-body text-gold font-medium">{label}</span>
                  {sectionKey && !isVisible && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono bg-destructive/15 text-destructive border border-destructive/30">
                      Hidden
                    </span>
                  )}
                </div>
                {sectionKey && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentVis = hpDraft.visibility || DEFAULT_CONFIG.visibility;
                      setHpDraft((d) => ({
                        ...d,
                        visibility: {
                          ...currentVis,
                          [sectionKey]: !isVisible,
                        },
                      }));
                      toast.info(`"${label}" marked as ${!isVisible ? "Visible" : "Hidden"} (Click "Save & Go Live" to apply)`);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-body transition-colors ${
                      isVisible
                        ? "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border"
                        : "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 font-medium"
                    }`}
                    title={isVisible ? "Click to hide this section from live website" : "Click to show this section on live website"}
                  >
                    {isVisible ? (
                      <>
                        <EyeOff size={13} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye size={13} />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          };

          const Field = ({ label, value, onChange, textarea = false }: {
            label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
          }) => (
            <div>
              <label className="block text-xs uppercase tracking-wider font-body text-muted-foreground mb-1.5">{label}</label>
              {textarea ? (
                <textarea
                  rows={3}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold resize-none font-body"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-gold font-body"
                />
              )}
            </div>
          );

          return (
            <div className="space-y-8 max-w-4xl mx-auto">

              {/* Toolbar */}
              <div className="flex items-center justify-between sticky top-20 z-20 bg-background/95 backdrop-blur py-3 px-4 border border-border/60 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  <LayoutDashboard size={14} className="text-gold" />
                  <span>Live home page manager — toggle Show/Hide or edit text</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setHpDraft(hpConfig); toast.info("Changes discarded"); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-border rounded text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw size={13} /> Discard
                  </button>
                  <button
                    onClick={() => window.open("/", "_blank")}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-border rounded text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink size={13} /> Preview Live
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={hpSaving}
                    className="flex items-center gap-1.5 px-5 py-2 gold-gradient text-primary-foreground text-xs uppercase tracking-wider font-body font-semibold rounded shadow disabled:opacity-50"
                  >
                    <Save size={13} /> {hpSaving ? "Saving..." : "Save & Go Live"}
                  </button>
                </div>
              </div>

              {/* ── Hero ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.hero === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Hero Section" sectionKey="hero" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Eyebrow Text" value={hpDraft.hero.eyebrow}
                    onChange={(v) => patch("hero", { ...hpDraft.hero, eyebrow: v })} />
                  <Field label="Tagline" value={hpDraft.hero.tagline}
                    onChange={(v) => patch("hero", { ...hpDraft.hero, tagline: v })} />
                </div>

                {/* Hero Slideshow Images */}
                <div className="pt-4 border-t border-border/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-body text-foreground font-medium">
                        Hero Slideshow Photos (Continuous Zoom / Pan)
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-body">
                        Upload custom photos directly to Cloudinary or enter image URLs. Slides cycle every 6s.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentSlides = hpDraft.hero.slides || [];
                        const nextSlides = [
                          ...currentSlides,
                          { image: "/placeholder.svg", alt: `Specimen Slide ${currentSlides.length + 1}` },
                        ];
                        patch("hero", { ...hpDraft.hero, slides: nextSlides });
                        toast.info("New slide added — set image and click 'Save & Go Live'");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/50 text-gold rounded text-xs font-body hover:bg-gold/10 transition-colors w-fit"
                    >
                      <Plus size={13} /> Add Slide
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(hpDraft.hero.slides || []).map((slide, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-secondary/30 border border-border/80 rounded-lg"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-14 rounded overflow-hidden border border-border flex-shrink-0 bg-background">
                          <img
                            src={slide.image}
                            alt={slide.alt || `Slide ${sIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 px-1 py-0.5 bg-black/70 text-[9px] font-mono text-white/90">
                            #{sIdx + 1}
                          </span>
                        </div>

                        {/* Inputs */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={slide.image}
                              onChange={(e) => {
                                const nextSlides = [...(hpDraft.hero.slides || [])];
                                nextSlides[sIdx] = { ...slide, image: e.target.value };
                                patch("hero", { ...hpDraft.hero, slides: nextSlides });
                              }}
                              placeholder="Image URL or upload from device"
                              className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs font-body focus:outline-none focus:border-gold"
                            />
                            <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground border border-border rounded text-xs font-body hover:bg-secondary/80 cursor-pointer transition-colors whitespace-nowrap">
                              <Upload size={12} className={uploadingSlideIdx === sIdx ? "animate-bounce" : ""} />
                              <span>{uploadingSlideIdx === sIdx ? "Uploading to Cloud..." : "Upload Photo"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingSlideIdx !== null}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const pin = sessionStorage.getItem("lunevia_admin_passcode") || "";
                                  setUploadingSlideIdx(sIdx);
                                  try {
                                    const cloudUrl = await uploadImage(file, pin);
                                    const nextSlides = [...(hpDraft.hero.slides || [])];
                                    nextSlides[sIdx] = { ...slide, image: cloudUrl };
                                    patch("hero", { ...hpDraft.hero, slides: nextSlides });
                                    toast.success(`Slide ${sIdx + 1} uploaded to Cloudinary!`);
                                  } catch (err: any) {
                                    toast.error(err.message || "Failed to upload photo");
                                  } finally {
                                    setUploadingSlideIdx(null);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={slide.alt || ""}
                            onChange={(e) => {
                              const nextSlides = [...(hpDraft.hero.slides || [])];
                              nextSlides[sIdx] = { ...slide, alt: e.target.value };
                              patch("hero", { ...hpDraft.hero, slides: nextSlides });
                            }}
                            placeholder="Alt / Specimen description (optional)"
                            className="w-full px-3 py-1 bg-background border border-border/60 rounded text-[11px] font-body focus:outline-none text-muted-foreground focus:text-foreground"
                          />
                        </div>

                        {/* Delete Slide */}
                        {(hpDraft.hero.slides || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextSlides = (hpDraft.hero.slides || []).filter((_, idx) => idx !== sIdx);
                              patch("hero", { ...hpDraft.hero, slides: nextSlides });
                            }}
                            className="p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded transition-colors self-end sm:self-center"
                            title="Remove Slide"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Stats ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.stats === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Stats Strip (4 boxes)" sectionKey="stats" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hpDraft.stats.map((s, i) => (
                    <div key={i} className="border border-border/50 rounded p-4 space-y-3">
                      <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Stat {i + 1}</p>
                      <Field label="Value (e.g. 500+)" value={s.value}
                        onChange={(v) => {
                          const next = [...hpDraft.stats];
                          next[i] = { ...s, value: v };
                          patch("stats", next);
                        }} />
                      <Field label="Label" value={s.label}
                        onChange={(v) => {
                          const next = [...hpDraft.stats];
                          next[i] = { ...s, label: v };
                          patch("stats", next);
                        }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Featured Showcase ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-3 transition-opacity ${hpDraft.visibility?.featured === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Featured Specimens Grid" sectionKey="featured" />
                <p className="text-xs text-muted-foreground font-body">
                  Displays items flagged as "Feature on Homepage" in the Products tab. Use the toggle above to hide or show this entire section.
                </p>
              </div>

              {/* ── Brand Story ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.brandStory === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Brand Story Section" sectionKey="brandStory" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Heading (plain)" value={hpDraft.brandStory.heading}
                    onChange={(v) => patch("brandStory", { ...hpDraft.brandStory, heading: v })} />
                  <Field label="Heading Italic / Gold" value={hpDraft.brandStory.headingEm}
                    onChange={(v) => patch("brandStory", { ...hpDraft.brandStory, headingEm: v })} />
                </div>
                <Field label="Paragraph 1" value={hpDraft.brandStory.body1} textarea
                  onChange={(v) => patch("brandStory", { ...hpDraft.brandStory, body1: v })} />
                <Field label="Paragraph 2" value={hpDraft.brandStory.body2} textarea
                  onChange={(v) => patch("brandStory", { ...hpDraft.brandStory, body2: v })} />

                {/* Brand Story Featured Photo */}
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <label className="block text-xs uppercase tracking-wider font-body text-foreground font-medium">
                    Brand Story Photo
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-secondary/30 border border-border/80 rounded-lg">
                    <div className="relative w-24 h-20 rounded overflow-hidden border border-gold/40 flex-shrink-0 bg-background">
                      <img
                        src={hpDraft.brandStory.image}
                        alt="Brand Story Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={hpDraft.brandStory.image}
                        onChange={(e) => patch("brandStory", { ...hpDraft.brandStory, image: e.target.value })}
                        placeholder="Image URL or upload from device"
                        className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs font-body focus:outline-none focus:border-gold"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground border border-border rounded text-xs font-body hover:bg-secondary/80 cursor-pointer transition-colors">
                        <Upload size={12} className={uploadingBrandStory ? "animate-bounce" : ""} />
                        <span>{uploadingBrandStory ? "Uploading to Cloud..." : "Upload Brand Story Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingBrandStory}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const pin = sessionStorage.getItem("lunevia_admin_passcode") || "";
                            setUploadingBrandStory(true);
                            try {
                              const cloudUrl = await uploadImage(file, pin);
                              patch("brandStory", { ...hpDraft.brandStory, image: cloudUrl });
                              toast.success("Brand story photo uploaded to Cloudinary!");
                            } catch (err: any) {
                              toast.error(err.message || "Failed to upload photo");
                            } finally {
                              setUploadingBrandStory(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Catalogue Section ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-3 transition-opacity ${hpDraft.visibility?.catalog === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Full Catalogue & Filter Section" sectionKey="catalog" />
                <p className="text-xs text-muted-foreground font-body">
                  Displays the category filter tabs and all catalogue specimen cards directly on the homepage. Use the toggle above to hide or show this section.
                </p>
              </div>

              {/* ── Features ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.features === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Why LUNÉVIA — 6 Feature Cards" sectionKey="features" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hpDraft.features.map((f, i) => (
                    <div key={i} className="border border-border/50 rounded p-4 space-y-3">
                      <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Feature {i + 1}</p>
                      <Field label="Title" value={f.title}
                        onChange={(v) => {
                          const next = [...hpDraft.features];
                          next[i] = { ...f, title: v };
                          patch("features", next);
                        }} />
                      <Field label="Description" value={f.desc} textarea
                        onChange={(v) => {
                          const next = [...hpDraft.features];
                          next[i] = { ...f, desc: v };
                          patch("features", next);
                        }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Process Steps ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.steps === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Our Process — 4 Steps" sectionKey="steps" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hpDraft.steps.map((s, i) => (
                    <div key={i} className="border border-border/50 rounded p-4 space-y-3">
                      <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Step {i + 1}</p>
                      <Field label="Title" value={s.title}
                        onChange={(v) => {
                          const next = [...hpDraft.steps];
                          next[i] = { ...s, title: v };
                          patch("steps", next);
                        }} />
                      <Field label="Body" value={s.body} textarea
                        onChange={(v) => {
                          const next = [...hpDraft.steps];
                          next[i] = { ...s, body: v };
                          patch("steps", next);
                        }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CTA Banner ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.cta === false ? "opacity-60" : ""}`}>
                <SectionHeading label="WhatsApp CTA Banner" sectionKey="cta" />
                <Field label="Heading" value={hpDraft.cta.heading}
                  onChange={(v) => patch("cta", { ...hpDraft.cta, heading: v })} />
                <Field label="Subtext" value={hpDraft.cta.subtext} textarea
                  onChange={(v) => patch("cta", { ...hpDraft.cta, subtext: v })} />
              </div>

              {/* ── Quote ── */}
              <div className={`bg-card border border-border rounded-lg p-6 space-y-4 transition-opacity ${hpDraft.visibility?.quote === false ? "opacity-60" : ""}`}>
                <SectionHeading label="Editorial Quote Strip" sectionKey="quote" />
                <Field label="Quote Text" value={hpDraft.quote.text} textarea
                  onChange={(v) => patch("quote", { ...hpDraft.quote, text: v })} />
                <Field label="Attribution (e.g. — The LUNÉVIA Team)" value={hpDraft.quote.attribution}
                  onChange={(v) => patch("quote", { ...hpDraft.quote, attribution: v })} />
              </div>

              {/* ── WhatsApp Number ── */}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <SectionHeading label="WhatsApp Contact Number" />
                <Field
                  label="Number with country code, no spaces or + (e.g. 919876543210)"
                  value={hpDraft.whatsappNumber}
                  onChange={(v) => patch("whatsappNumber", v)}
                />
                <p className="text-[11px] text-muted-foreground font-body">
                  This is the number used for all WhatsApp inquiry buttons across the website.
                </p>
              </div>

              {/* Reset to defaults */}
              <div className="flex justify-end pb-4">
                <button
                  onClick={() => {
                    if (confirm("Reset all home page content to factory defaults?")) {
                      setHpDraft(DEFAULT_CONFIG);
                      toast.info("Draft reset to defaults — click Save to apply");
                    }
                  }}
                  className="text-xs text-muted-foreground font-body hover:text-destructive transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={12} /> Reset all to defaults
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
