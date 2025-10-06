"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { LogoutDialog } from "./auth/logout-modal";
import CartIcon from "@/components/common/CartIcon";
import WishlistIcon from "@/components/common/WishlistIcon";
import { brand } from "@/constants/values";
import { isLoggedIn } from "@/lib/utils";
import SearchComponent from "@/components/search";
import { bodoniModa } from "@/lib/font";
import UserIcon from "./common/UserIcon";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setIsProfileMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
    }
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== "undefined") {
        const loggedIn = isLoggedIn();
        setUserLoggedIn(loggedIn);
      }
    };

    checkLoginStatus();
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userStatusChange", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userStatusChange", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    }
    fetchCategories();
  }, []);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isMenuOpen || isProfileMenuOpen || isSearchOpen) {
        setIsHeaderVisible(true);
        return;
      }
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

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

    if (!isMenuOpen && !isProfileMenuOpen && !isSearchOpen) {
      window.addEventListener("scroll", throttledHandleScroll, {
        passive: true,
      });
    }
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [lastScrollY, isMenuOpen, isProfileMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (isMenuOpen || isProfileMenuOpen || isSearchOpen)
      setIsHeaderVisible(true);
  }, [isMenuOpen, isProfileMenuOpen, isSearchOpen]);

  return (
    <>
      <header
        className={`w-full bg-white sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Main Header Bar */}
        <div
          className="flex items-center md:shadow-lg shadow-stone-100 justify-between md:justify-center px-4 sm:px-6 md:px-8 py-2 md:py-3 lg:py-5 border-b"
          style={{ borderColor: "#F0E5E9" }}
        >
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
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

            {/* Logo */}
            <Link
              href="/"
              className={`text-xl sm:text-2xl md:3xl font-bold ${bodoniModa.className}`}
              style={{ color: brand.primary }}
            >
              BELLAMY
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchComponent brand={brand} />
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Search Icon */}
            <button
              onClick={toggleSearch}
              className="md:hidden p-1"
              aria-label="Toggle search"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* User */}
            <UserIcon
              userLoggedIn={userLoggedIn}
              color={brand.primary}
            />

            {/* Wishlist */}
            <WishlistIcon userLoggedIn={userLoggedIn} color={brand.primary} />

            {/* Cart */}
            <CartIcon color={brand.primary} />
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        <div
          className={`md:hidden bg-white border-b transition-all duration-300 ease-in-out overflow-hidden ${
            isSearchOpen
              ? "max-h-20 opacity-100 py-3 px-4"
              : "max-h-0 opacity-0"
          }`}
          style={{ borderColor: "#F0E5E9" }}
        >
          <SearchComponent brand={brand} />
        </div>

        {/* Navigation Bar */}
        <div
          className="hidden md:block md:shadow-lg"
          style={{ borderColor: "#F0E5E9" }}
        >
          <div className="flex items-center justify-center px-8 lg:px-12 py-1 sm:py-2 md:py-3 lg:py-4">
            <nav className="flex text-xs font-bold items-center gap-8 lg:gap-12 tracking-wider">
              <Link
                href="/"
                className="transition-colors hover:opacity-70"
                style={{ color: isActive("/") ? brand.primary : "#3f3f3f" }}
              >
                HOME
              </Link>

              <div className="relative group">
                <Link
                  href="/shop"
                  className="transition-colors hover:opacity-70"
                  style={{
                    color: isActive("/shop") ? brand.primary : "#3f3f3f",
                  }}
                >
                  SHOP
                </Link>

                {/* Dropdown */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-3 bg-white shadow-2xl border rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden"
                  style={{ borderColor: "#E3D5CA", width: 360 }}
                >
                  <div className="grid grid-cols-2">
                    <div
                      className="col-span-2 border-b px-4 py-3 text-[13px] font-semibold"
                      style={{ color: brand.primary, borderColor: "#E3D5CA" }}
                    >
                      Shop Categories
                    </div>
                    {(() => {
                      const mid = Math.ceil(categories.length / 2);
                      const left = categories.slice(0, mid);
                      const right = categories.slice(mid);
                      const renderCol = (
                        items: { id: string; name: string }[]
                      ) => (
                        <div
                          className="px-4 py-3 first:border-r"
                          style={{ borderColor: "#E3D5CA" }}
                        >
                          <div
                            className="text-[12px] font-semibold mb-2"
                            style={{ color: brand.primary }}
                          >
                            Browse
                          </div>
                          <ul className="space-y-2">
                            {items.map((cat) => (
                              <li key={cat.id}>
                                <Link
                                  href={`/shop/category/${cat.id}`}
                                  className="block font-normal text-[13px] text-gray-700 hover:underline"
                                  style={{ color: "#3f3f3f" }}
                                >
                                  {cat.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                      return (
                        <>
                          {renderCol(left)}
                          {renderCol(right)}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <Link
                href="/our-story"
                className="transition-colors hover:opacity-70"
                style={{
                  color: isActive("/our-story") ? brand.primary : "#3f3f3f",
                }}
              >
                OUR STORY
              </Link>

              <Link
                href="/contact"
                className="transition-colors hover:opacity-70"
                style={{
                  color: isActive("/contact") ? brand.primary : "#3f3f3f",
                }}
              >
                CONTACT
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white border-t transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ borderColor: "#F0E5E9" }}
        >
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-base font-medium"
              style={{ color: isActive("/") ? brand.primary : "#3f3f3f" }}
              onClick={() => setIsMenuOpen(false)}
            >
              HOME
            </Link>
            <details className="group">
              <summary className="flex justify-between items-center py-2 text-base font-medium text-gray-800 cursor-pointer">
                SHOP
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="pl-4 mt-2 space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/category/${cat.id}`}
                    className="block text-gray-700 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </details>
            <Link
              href="/our-story"
              className="block py-2 text-base font-medium"
              style={{
                color: isActive("/our-story") ? brand.primary : "#3f3f3f",
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              OUR STORY
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-base font-medium"
              style={{
                color: isActive("/contact") ? brand.primary : "#3f3f3f",
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT
            </Link>
            {userLoggedIn && (
              <Link
                href="/user-profile"
                className="block py-2 text-base font-medium"
                style={{
                  color: isActive("/user-profile") ? brand.primary : "#3f3f3f",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                PROFILE
              </Link>
            )}
          </nav>
        </div>
      </header>

      <LogoutDialog open={isLogoutModalOpen} setOpen={setIsLogoutModalOpen} />
    </>
  );
}
