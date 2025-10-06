"use client";

import { useState, useRef, useEffect } from "react";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { loggedInUser } from "@/lib/utils";
import { LogoutDialog } from "../auth/logout-modal"; 

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = loggedInUser();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Icon */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center p-1"
        aria-label="Account"
      >
        <UserRound
          strokeWidth={1}
          color={color}
          className="w-5 h-5 md:w-7 md:h-7 cursor-pointer hover:scale-[1.2] transition-all duration-200"
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden transition-all duration-200 z-50 ${
          isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {userLoggedIn ? (
          <>
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              Hello, {user.name || "User"}
            </div>
            <Link
              href="/user-profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsLogoutOpen(true);
              }}
              className="w-full cursor-pointer text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
