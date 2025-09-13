"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path ? "text-blue-900 font-semibold" : "text-gray-700";
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show header when mobile menu is open
      if (isMenuOpen) {
        setIsHeaderVisible(true);
        return;
      }
      
      // Show header when at the top of the page
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      }
      // Only hide header when scrolling down past 200px
      else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsHeaderVisible(false);
      } 
      // Show header when scrolling up from any position
      else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Only add scroll listener if mobile menu is closed
    if (!isMenuOpen) {
      window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    }
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY, isMenuOpen]);

  // Keep header visible when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      setIsHeaderVisible(true);
    }
  }, [isMenuOpen]);

  return (
    <header 
      className={`w-full bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Free Shipping Bar */}
      <div className="bg-blue-900 text-white text-center text-sm py-2">
        Free shipping on orders over ₹500. Shop Now!
      </div>

      {/* Navbar */}
      <div className="flex justify-between items-center px-4 md:px-12 py-4 md:py-6">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium flex-1">
          <Link href="/" className={`hover:text-blue-900 transition-colors ${isActive("/")}`}>
            HOME
          </Link>
          <a href="#" className="hover:text-blue-900 transition-colors">
            SHOP
          </a>
          <Link href="/our-story" className={`hover:text-blue-900 transition-colors ${isActive("/our-story")}`}>
            OUR STORY
          </Link>
          <Link href="/contact" className={`hover:text-blue-900 transition-colors ${isActive("/contact")}`}>
            CONTACT
          </Link>
        </nav>

        {/* Center: Logo */}
        <Link href="/" className="text-xl md:text-2xl font-bold text-gray-800 flex-1 text-center md:flex-none">
          BELLAMY
        </Link>

        {/* Right: Icons (placeholder) */}
        <div className="flex space-x-4 flex-1 justify-end">
          {/* Add cart/user/search icons here later */}
          <div className="hidden md:block">
            {/* Desktop icons placeholder */}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="px-4 py-4 space-y-3">
          <Link
            href="/"
            className={`block py-2 text-lg font-medium transition-colors ${isActive("/")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            HOME
          </Link>
          <a
            href="#"
            className="block py-2 text-lg font-medium text-gray-700 hover:text-blue-900 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            SHOP
          </a>
          <Link
            href="/our-story"
            className={`block py-2 text-lg font-medium transition-colors ${isActive("/our-story")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            OUR STORY
          </Link>
          <Link
            href="/contact"
            className={`block py-2 text-lg font-medium transition-colors ${isActive("/contact")}`}
            onClick={() => setIsMenuOpen(false)}
          >
            CONTACT
          </Link>
        </nav>
      </div>
    </header>
  );
}
