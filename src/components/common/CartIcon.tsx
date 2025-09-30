// CartIcon.tsx
"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cartContext";

export default function CartIcon({ color = "#8B1D3F" }: { color?: string }) {
  const { cartCount } = useCart();

  return (
    // CartIcon.tsx
   <Link
      href="/cart"
      className="relative inline-flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full border bg-white"
      style={{ borderColor: color }}
      aria-label="Cart"
    >
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {cartCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1 py-0.5 rounded-full text-white min-w-[14px] sm:min-w-[16px] text-center"
          style={{ backgroundColor: color }}
        >
          {cartCount}
        </span>
      )}
    </Link>
  );
}
