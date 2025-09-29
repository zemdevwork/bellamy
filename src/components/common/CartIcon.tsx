"use client";
import Link from "next/link";

export default function CartIcon({ count = 0, color = "#8B1D3F" }: { count?: number; color?: string }) {
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full border bg-white"
      style={{ borderColor: color }}
      aria-label="Cart"
    >
      <svg className="h-5 w-5" fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-4a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
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


