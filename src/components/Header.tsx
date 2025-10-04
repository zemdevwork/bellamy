"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { LogoutDialog } from "./auth/logout-modal";
import CartIcon from "@/components/common/CartIcon";
import WishlistIcon from "@/components/common/WishlistIcon";
import { brand } from "@/constants/values";
import { isLoggedIn } from "@/lib/utils";
import SearchComponent from "@/components/search"; // Assuming this is your Search bar component

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // New state for mobile search
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Ensure only one mobile menu/search is open at a time
    if (!isMenuOpen) {
      setIsProfileMenuOpen(false);
      setIsSearchOpen(false); // Close search when opening main menu
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    // Close other menus
    if (!isProfileMenuOpen) {
      setIsMenuOpen(false);
      setIsSearchOpen(false); // Close search when opening profile menu
    }
  };
  
  // New function to toggle mobile search
  const toggleSearch = () => {
      setIsSearchOpen(!isSearchOpen);
      // Close other menus
      if (!isSearchOpen) {
          setIsMenuOpen(false);
          setIsProfileMenuOpen(false);
      }
  };

  // Check login status (Omitted for brevity, assumed unchanged)
  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== "undefined") {
        const loggedIn = isLoggedIn();
        setUserLoggedIn(loggedIn);
        if (loggedIn) {
          try {
            const user = JSON.parse(localStorage.getItem("user")!);
            setUserName(user.name || "User");
          } catch (error) {
            console.error("Failed to parse user data:", error);
            setUserName("User");
          }
        }
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

  // Close profile menu when clicking outside (Omitted for brevity, assumed unchanged)
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

  // Scroll handling (Updated to include isSearchOpen)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isMenuOpen || isProfileMenuOpen || isSearchOpen) { // Check new search state
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

    if (!isMenuOpen && !isProfileMenuOpen && !isSearchOpen) { // Check new search state
      window.addEventListener("scroll", throttledHandleScroll, {
        passive: true,
      });
    }
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [lastScrollY, isMenuOpen, isProfileMenuOpen, isSearchOpen]); // Added isSearchOpen

  useEffect(() => {
    if (isMenuOpen || isProfileMenuOpen || isSearchOpen) setIsHeaderVisible(true); // Added isSearchOpen
  }, [isMenuOpen, isProfileMenuOpen, isSearchOpen]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`w-full bg-white sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Promo Bar */}
        <div
          className="text-white text-center text-xs md:text-sm py-2"
          style={{ backgroundColor: brand.primary }}
        >
          New GST rates are now live across all products
        </div>

        {/* Top Bar (Main Navigation Row) */}
        <div
          className="flex justify-between items-center px-3 sm:px-4 md:px-12 py-2.5 sm:py-3 md:py-4 border-b relative"
          style={{ borderColor: "#F0E5E9" }}
        >
          {/* Left Side: Mobile Menu Button & Desktop Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-1.5 sm:p-2 rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none z-10"
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

            {/* Desktop Logo */}
            <div className="hidden md:block">
              <Link
                href="/"
                className="text-xl lg:text-2xl font-semibold tracking-wider"
                style={{ color: brand.primary }}
              >
                BELLAMY
              </Link>
            </div>
          </div>

          {/* Center: Mobile Logo & Desktop Search */}
          {/* Mobile Logo: Absolute positioning for true centering */}
          <div className="md:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/"
              className="text-base font-serif sm:text-lg font-semibold tracking-wider"
              style={{ color: brand.primary }}
            >
              BELLAMY
            </Link>
          </div>

          {/* Desktop Search Component - Center on Desktop, Hidden on Mobile */}
          <div className="hidden md:block md:flex-1 md:max-w-2xl lg:max-w-xl">
            <SearchComponent brand={brand} />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {/* Mobile Search Icon */}
            <button
                onClick={toggleSearch}
                className="md:hidden p-1.5 sm:p-2 rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle search"
            >
                <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isSearchOpen ? (
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    )}
                </svg>
            </button>

            <CartIcon color={brand.primary} />
            {userLoggedIn && <WishlistIcon color={brand.primary} />}

            <div className="relative" ref={profileMenuRef}>
              {userLoggedIn ? (
                <div className="relative group">
                  {/* Profile button */}
                  <button
                    onClick={toggleProfileMenu}
                    aria-label="Account"
                    className="w-7 h-7 cursor-pointer sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white border transition-all duration-300 hover:scale-110 hover:shadow-md text-sm font-semibold uppercase"
                    style={{ borderColor: brand.primary, color: brand.primary }}
                  >
                    {userName ? userName.charAt(0) : "U"}
                  </button>

                  {/* Profile dropdown (Omitted for brevity, assumed unchanged) */}
                  <div
                    className={`absolute right-0 mt-2 w-44 bg-white shadow-xl border border-gray-100 rounded-lg overflow-hidden transition-all duration-200 z-50 ${
                      isProfileMenuOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible"
                    }`}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Hello, {userName}
                      </div>
                      <Link
                        href="/user-profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  aria-label="Login"
                  className="font-serif px-3 py-1 rounded-2xl border flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md text-sm sm:text-base"
                  style={{ borderColor: brand.primary }}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Collapsed Row */}
        <div
            className={`md:hidden bg-white border-b transition-all duration-300 ease-in-out overflow-hidden ${
                isSearchOpen ? "max-h-20 opacity-100 py-3 px-4" : "max-h-0 opacity-0"
            }`}
            style={{ borderColor: "#F0E5E9" }}
        >
            <SearchComponent brand={brand} />
        </div>

        {/* Desktop Nav Row (Omitted for brevity, assumed unchanged) */}
        <div className="hidden md:block">
          <div
            className="flex items-center justify-center py-3"
            style={{
              boxShadow: "inset 0 -1px 0 0 #F0E5E9",
              backgroundColor: "#F7ECEF",
            }}
          >
            <nav className="flex items-center gap-10 text-sm tracking-wide">
              <Link
                href="/"
                className="transition-colors"
                style={{ color: isActive("/") ? brand.primary : "#3f3f3f" }}
              >
                HOME
              </Link>
              <div className="relative group">
                <Link
                  href="/shop"
                  className="transition-colors"
                  style={{
                    color: isActive("/shop") ? brand.primary : "#3f3f3f",
                  }}
                >
                  SHOP
                </Link>
                {/* Desktop Dropdown (Omitted for brevity, assumed unchanged) */}
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
                                  className="block text-[13px] text-gray-700 hover:underline"
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
                className="transition-colors"
                style={{
                  color: isActive("/our-story") ? brand.primary : "#3f3f3f",
                }}
              >
                OUR STORY
              </Link>
              <Link
                href="/contact"
                className="transition-colors"
                style={{
                  color: isActive("/contact") ? brand.primary : "#3f3f3f",
                }}
              >
                CONTACT
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu (Omitted for brevity, assumed unchanged) */}
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