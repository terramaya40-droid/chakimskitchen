import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
import { useCart } from "../lib/cart";

export function Header() {
  const { count, open } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-plum/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-plum-deep sm:text-xl"
        >
          Chef Chakim's Yummys
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 sm:flex">
          <a
            href="#menu"
            className="text-sm font-medium text-plum/70 transition hover:text-plum"
          >
            Menu
          </a>
          <a
            href="#story"
            className="text-sm font-medium text-plum/70 transition hover:text-plum"
          >
            Our Story
          </a>
          <Link
            to="/admin"
            className="text-sm font-medium text-plum/70 transition hover:text-plum"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={open}
            className="relative flex items-center gap-2 rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream transition hover:bg-plum-deep active:scale-95"
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-plum-deep shadow-sm">
                {count}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={open}
            className="relative flex items-center gap-1.5 rounded-full bg-plum px-3 py-1.5 text-xs font-medium text-cream active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>Cart</span>
            {count > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-plum-deep">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-plum/80 transition hover:bg-plum/10 active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="animate-fade-in space-y-2 border-t border-plum/10 bg-cream px-4 py-3 shadow-lg sm:hidden">
          <a
            href="#menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-plum/80 hover:bg-plum/10 hover:text-plum"
          >
            Menu
          </a>
          <a
            href="#story"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-plum/80 hover:bg-plum/10 hover:text-plum"
          >
            Our Story
          </a>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-plum/80 hover:bg-plum/10 hover:text-plum"
          >
            Admin Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
