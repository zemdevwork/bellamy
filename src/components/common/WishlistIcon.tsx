"use client";

import Link from "next/link";
import { Heart} from "lucide-react";

function WishlistIcon({ color = "#8B1D3F", userLoggedIn }: { color?: string; userLoggedIn: boolean }) {
  return (
    <Link
      href={userLoggedIn ? "/wishlist" : "/login"}
      className="inline-flex items-center justify-center p-1"
      aria-label="Wishlist"
    >
      <Heart strokeWidth={1.3} color={color} className="w-5 h-5 md:w-7 md:h-7 cursor-pointer hover:opacity-60 transition-all duration-200" />
    </Link>
  );
}

export default WishlistIcon;