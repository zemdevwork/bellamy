"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon({ count = 0, color = "#8B1D3F" }: { count?: number; color?: string }) {
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full border bg-white"
      style={{ borderColor: color }}
      aria-label="Cart"
    >
      <ShoppingCart size={18} color={color} />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}


