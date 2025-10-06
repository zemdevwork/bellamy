"use client";
import Link from "next/link";
import { Handbag } from "lucide-react";
import { useCart } from "@/context/cartContext";

function CartIcon({ color = "#8B1D3F" }: { color?: string }) {
  const { cartCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-1"
      aria-label="Cart"
    >
      <Handbag strokeWidth={1} color={color} className="w-5 h-5 md:w-7 md:h-7 cursor-pointer hover:scale-[1.2] transition-all duration-200" />
      {cartCount > 0 && (
        <span
          className="absolute -top-1 -right-1 text-[10px] font-bold px-1 rounded-full text-white bg-red-600 min-w-[14px] text-center"
        >
          {cartCount}
        </span>
      )}
    </Link>
  );
}

export default CartIcon;