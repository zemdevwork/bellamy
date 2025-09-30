"use client";
import Link from "next/link";

export default function WishlistIcon({
  color = "#8B1D3F",
}: {
  color?: string;
}) {
  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full border bg-white"
      style={{ borderColor: color }}
      aria-label="Wishlist"
    >
      <svg
        className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    </Link>
  );
}
