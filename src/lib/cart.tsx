import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "./types";

const STORAGE_KEY = "yummys-cart";

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  total: number;
  count: number;
  add: (line: Omit<CartLine, "id" | "qty">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const count = lines.reduce((sum, l) => sum + l.qty, 0);

    return {
      lines,
      isOpen,
      total,
      count,
      add: (line) => {
        setLines((prev) => {
          const existing = prev.find(
            (l) => l.itemId === line.itemId && l.optionId === line.optionId,
          );
          if (existing) {
            return prev.map((l) =>
              l.id === existing.id ? { ...l, qty: l.qty + 1 } : l,
            );
          }
          return [...prev, { ...line, id: crypto.randomUUID(), qty: 1 }];
        });
        setIsOpen(true);
      },
      setQty: (id, qty) => {
        if (qty <= 0) {
          setLines((prev) => prev.filter((l) => l.id !== id));
          return;
        }
        setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
      },
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines([]),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
