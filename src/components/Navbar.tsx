import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems, toggleCart } = useCart();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Catalogue", path: "/shop" },
    { name: "WholeSale & BulkOrders", path: "/wholesale" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleBrandClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined") {
      if (location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121218]/95 backdrop-blur-[12px] border-b border-border/60 transition-all duration-300 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-5 md:px-6 h-16 flex items-center justify-between relative">
        <Link
          to="/"
          onClick={handleBrandClick}
          className="font-display text-2xl font-semibold tracking-wider gold-text-gradient cursor-pointer"
        >
          LUNÉVIA
        </Link>

        {/* Desktop Nav - Centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-body tracking-wide transition-colors duration-300 ${
                  isActive ? "text-gold font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Actions: Cart & Mobile Menu */}
        <div className="flex items-center gap-1">
          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={toggleCart}
            className="relative w-11 h-11 flex items-center justify-center text-foreground hover:text-gold transition-colors rounded-full hover:bg-white/5 cursor-pointer"
            aria-label={`View selection (${totalItems} items)`}
            title="View selection"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-black font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Mobile Hamburger (44x44px minimum tap target) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-11 h-11 flex items-center justify-center text-foreground hover:text-gold transition-colors"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#121218] border-b border-border animate-fade-in">
          <div className="container mx-auto px-5 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-sm tracking-wide min-h-[44px] flex items-center ${
                  location.pathname === link.path ? "text-gold font-medium" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
