
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState, useEffect } from "react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export default function Header() {
//   const pathname = usePathname();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isHeaderVisible, setIsHeaderVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);

//   // ✅ categories state
//   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const isActive = (path: string) => {
//     return pathname === path ? "text-blue-900 font-semibold" : "text-gray-700";
//   };

//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         const res = await fetch("/api/category");
//         const data = await res.json();
//         setCategories(data);
//       } catch (error) {
//         console.error("Failed to load categories", error);
//       }
//     }
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       const currentScrollY = window.scrollY;

//       if (isMenuOpen) {
//         setIsHeaderVisible(true);
//         return;
//       }

//       if (currentScrollY < 10) {
//         setIsHeaderVisible(true);
//       } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
//         setIsHeaderVisible(false);
//       } else if (currentScrollY < lastScrollY) {
//         setIsHeaderVisible(true);
//       }

//       setLastScrollY(currentScrollY);
//     };

//     let ticking = false;
//     const throttledHandleScroll = () => {
//       if (!ticking) {
//         requestAnimationFrame(() => {
//           handleScroll();
//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     if (!isMenuOpen) {
//       window.addEventListener("scroll", throttledHandleScroll, { passive: true });
//     }

//     return () => {
//       window.removeEventListener("scroll", throttledHandleScroll);
//     };
//   }, [lastScrollY, isMenuOpen]);

//   useEffect(() => {
//     if (isMenuOpen) {
//       setIsHeaderVisible(true);
//     }
//   }, [isMenuOpen]);

//   return (
//     <header
//       className={`w-full bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
//         isHeaderVisible ? "translate-y-0" : "-translate-y-full"
//       }`}
//     >
//       {/* Free Shipping Bar */}
//       <div className="bg-blue-900 text-white text-center text-sm py-2">
//         Free shipping on orders over ₹500. Shop Now!
//       </div>

//       {/* Navbar */}
//       <div className="flex justify-between items-center px-4 md:px-12 py-4 md:py-6">
//         {/* Mobile Menu Button */}
//         <button
//           onClick={toggleMenu}
//           className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           aria-label="Toggle menu"
//         >
//           <svg
//             className="h-6 w-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             {isMenuOpen ? (
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             ) : (
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M4 6h16M4 12h16M4 18h16"
//               />
//             )}
//           </svg>
//         </button>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex space-x-6 text-gray-700 font-medium flex-1">
//           <Link
//             href="/"
//             className={`hover:text-blue-900 transition-colors ${isActive("/")}`}
//           >
//             HOME
//           </Link>

//           {/* ✅ SHOP with dropdown */}
//           <DropdownMenu>
//             <DropdownMenuTrigger
//               className={`hover:text-blue-900 transition-colors ${isActive("/shop")}`}
//             >
//               SHOP
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               {categories.map((cat) => (
//                 <DropdownMenuItem key={cat.id} asChild>
//                   <Link href={`/shop/category/${cat.id}`}>{cat.name}</Link>
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Link
//             href="/our-story"
//             className={`hover:text-blue-900 transition-colors ${isActive("/our-story")}`}
//           >
//             OUR STORY
//           </Link>
//           <Link
//             href="/contact"
//             className={`hover:text-blue-900 transition-colors ${isActive("/contact")}`}
//           >
//             CONTACT
//           </Link>
//         </nav>

//         {/* Center: Logo */}
//         <Link
//           href="/"
//           className="text-xl md:text-2xl font-bold text-gray-800 flex-1 text-center md:flex-none"
//         >
//           BELLAMY
//         </Link>

//         {/* Right: Icons */}
//         <div className="flex space-x-4 flex-1 justify-end">
//           <div className="hidden md:block"></div>
//         </div>
//       </div>

//       {/* Mobile Menu (unchanged, still has plain SHOP link) */}
//       <div
//         className={`md:hidden bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
//           isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//         }`}
//       >
//         <nav className="px-4 py-4 space-y-3">
//           <Link
//             href="/"
//             className={`block py-2 text-lg font-medium transition-colors ${isActive(
//               "/"
//             )}`}
//             onClick={() => setIsMenuOpen(false)}
//           >
//             HOME
//           </Link>
//           <Link
//             href="/shop"
//             className="block py-2 text-lg font-medium text-gray-700 hover:text-blue-900 transition-colors"
//             onClick={() => setIsMenuOpen(false)}
//           >
//             SHOP
//           </Link>
//           <Link
//             href="/our-story"
//             className={`block py-2 text-lg font-medium transition-colors ${isActive(
//               "/our-story"
//             )}`}
//             onClick={() => setIsMenuOpen(false)}
//           >
//             OUR STORY
//           </Link>
//           <Link
//             href="/contact"
//             className={`block py-2 text-lg font-medium transition-colors ${isActive(
//               "/contact"
//             )}`}
//             onClick={() => setIsMenuOpen(false)}
//           >
//             CONTACT
//           </Link>
          
//         </nav>
        
//       </div>
//     </header>
//   );
// }


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ categories state
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path ? "text-blue-900 font-semibold" : "text-gray-700";
  };

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isMenuOpen) {
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

    if (!isMenuOpen) {
      window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [lastScrollY, isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setIsHeaderVisible(true);
    }
  }, [isMenuOpen]);

  return (
    <header
      className={`w-full bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
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
          <Link
            href="/"
            className={`hover:text-blue-900 transition-colors ${isActive("/")}`}
          >
            HOME
          </Link>

          {/* ✅ SHOP with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`hover:text-blue-900 transition-colors ${isActive("/shop")}`}
            >
              SHOP
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.id} asChild>
                  <Link href={`/shop/category/${cat.id}`}>{cat.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/our-story"
            className={`hover:text-blue-900 transition-colors ${isActive("/our-story")}`}
          >
            OUR STORY
          </Link>
          <Link
            href="/contact"
            className={`hover:text-blue-900 transition-colors ${isActive("/contact")}`}
          >
            CONTACT
          </Link>
        </nav>

        {/* Center: Logo */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-bold text-gray-800 flex-1 text-center md:flex-none"
        >
          BELLAMY
        </Link>

        {/* Right: Icons */}
        <div className="flex space-x-4 flex-1 justify-end">
          <Link
            href="/user-profile"
            className={`p-2 rounded-md text-gray-700 hover:text-blue-900 transition-colors ${isActive("/user-profile")}`}
            aria-label="Profile"
          >
            <svg
              className="h-6 w-6"
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
          </Link>
        </div>
      </div>

      {/* Mobile Menu (unchanged, still has plain SHOP link) */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 py-4 space-y-3">
          <Link
            href="/"
            className={`block py-2 text-lg font-medium transition-colors ${isActive(
              "/"
            )}`}
            onClick={() => setIsMenuOpen(false)}
          >
            HOME
          </Link>
          <Link
            href="/shop"
            className="block py-2 text-lg font-medium text-gray-700 hover:text-blue-900 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            SHOP
          </Link>
          <Link
            href="/our-story"
            className={`block py-2 text-lg font-medium transition-colors ${isActive(
              "/our-story"
            )}`}
            onClick={() => setIsMenuOpen(false)}
          >
            OUR STORY
          </Link>
          <Link
            href="/contact"
            className={`block py-2 text-lg font-medium transition-colors ${isActive(
              "/contact"
            )}`}
            onClick={() => setIsMenuOpen(false)}
          >
            CONTACT
          </Link>
          <Link
            href="/user-profile"
            className={`block py-2 text-lg font-medium transition-colors ${isActive(
              "/user-profile"
            )}`}
            onClick={() => setIsMenuOpen(false)}
          >
            PROFILE
          </Link>
        </nav>
        
      </div>
    </header>
  );
}