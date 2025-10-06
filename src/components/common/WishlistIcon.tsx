"use client";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistIcon({
  color = "#8B1D3F",
}: {
  color?: string;
}) {
  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border bg-white transition-all duration-300 hover:scale-110 hover:shadow-md"
      style={{ borderColor: color }}
      aria-label="Wishlist"
    >
      <Heart
        className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform duration-300"
        strokeWidth={1.8}
        color={color}
      />
    </Link>
  );
}