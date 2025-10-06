"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cartContext";

export default function CartIcon({ color = "#8B1D3F" }: { color?: string }) {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border bg-white transition-all duration-300 hover:scale-110 hover:shadow-md"
      style={{ borderColor: color }}
      aria-label="Cart"
    >
      <ShoppingCart
        className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform duration-300"
        strokeWidth={1.8}
        color={color}
      />
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