import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { HomepageProvider } from "@/contexts/HomepageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";

// Lazy-load sub-routes and heavy admin portal to keep initial JS bundle small and fast
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export interface AppProps {
  initialData?: {
    products?: any[];
    categories?: string[];
    homepageConfig?: any;
  };
  RouterComponent?: any;
  routerProps?: any;
}

// Instant scroll to top when visiting a new page or returning to Home (no scroll animation)
function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Unconditionally scroll to top if on Home page, or when visiting a new page
    if (location.pathname === "/" || navType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  return null;
}

// Global keyboard shortcut: Ctrl + Shift + H opens admin portal
function AdminShortcutListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "H" || e.key === "h")) {
        e.preventDefault();
        navigate("/catalog-admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
  return null;
}

export default function App({ initialData, RouterComponent, routerProps }: AppProps = {}) {
  const Router = RouterComponent || BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProductsProvider initialData={initialData}>
          <HomepageProvider initialConfig={initialData?.homepageConfig}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }} {...(routerProps || {})}>
                <ScrollToTop />
                <AdminShortcutListener />
                <Navbar />
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  <Routes>
                    {/* Public Showcase & Catalogue */}
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Private / Hidden Admin Catalog Manager */}
                    <Route path="/catalog-admin" element={<AdminPage />} />
                    <Route path="/admin" element={<AdminPage />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Footer />
              </Router>
            </TooltipProvider>
          </HomepageProvider>
        </ProductsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
