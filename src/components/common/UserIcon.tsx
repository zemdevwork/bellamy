"use client";

import { useState, useRef, useEffect } from "react";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { loggedInUser } from "@/lib/utils";
import { LogoutDialog } from "../auth/logout-modal";
import { brand } from "@/constants/values";

interface UserIconProps {
  color?: string;
  userLoggedIn: boolean;
}

export default function UserIcon({
  color = "#8B1D3F",
  userLoggedIn,
}: UserIconProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ✅ Runs only on client side — avoids SSR mismatch
    const data = loggedInUser();
    setUser(data);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="md:relative static" ref={dropdownRef}>
      {/* User Icon */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center p-1"
        aria-label="Account"
      >
        <UserRound
          strokeWidth={1.3}
          color={color}
          className="w-5 h-5 md:w-7 md:h-7 cursor-pointer hover:opacity-60 transition-all duration-200"
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute mt-2 w-48 bg-white border rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 z-50
          ${isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}
          md:left-0 md:top-full
          right-0 top-10 md:mt-2`}
        style={{
          borderColor: "#E3D5CA",
          boxShadow: "0px 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Always show hello message */}
        <div
          className="px-4 py-3 text-[13px] font-semibold border-b"
          style={{
            color: brand.primary,
            borderColor: "#E3D5CA",
            backgroundColor: "#FCF9F8",
          }}
        >
          Hello, {user?.name || "User"}
        </div>

        {userLoggedIn ? (
          <>
            <Link
              href="/user-profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-stone-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsLogoutOpen(true);
              }}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-stone-50 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-stone-50 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            Login
          </Link>
        )}
      </div>

      <LogoutDialog open={isLogoutOpen} setOpen={setIsLogoutOpen} />
    </div>
  );
}
