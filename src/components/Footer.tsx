import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-2xl font-semibold gold-text-gradient mb-4">LUNÉVIA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Curating the world's most extraordinary agate specimens. Each piece is hand-selected for its unique beauty and geological significance.
            </p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Navigate</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <span>lunevia@gmail.com</span>
              <span>+91 9510990215</span>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground tracking-wide">
            © 2026 LUNÉVIA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
