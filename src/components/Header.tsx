"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Free Shipping Bar */}
      <div className="bg-blue-900 text-white text-center text-sm py-2">
        Free shipping on orders over ₹500. Shop Now!
      </div>

      {/* Navbar */}
      <div className="flex justify-between items-center px-12 py-6">
        {/* Left: Menu */}
        <nav className="space-x-6 text-gray-700 font-medium flex-1">
          <Link href="/" className="hover:text-blue-900">HOME</Link>
          <a href="#" className="hover:text-blue-900">SHOP</a>
          <Link href="/our-story" className="hover:text-blue-900">OUR STORY</Link>
          <Link href="/contact" className="hover:text-blue-900">CONTACT</Link>
        </nav>

        {/* Center: Logo */}
        <h1 className="text-2xl font-bold text-gray-800 flex-1 text-center">
          BELLAMY
        </h1>

        {/* Right: Icons (placeholder) */}
        <div className="flex space-x-4 flex-1 justify-end">
          {/* Add cart/user/search icons here later */}
        </div>
      </div>
    </header>
  );
}
