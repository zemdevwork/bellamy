// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { getUserCart } from "@/server/actions/cart-action";
// import { useState, useEffect } from "react";
// import { LogoutDialog } from "./auth/logout-modal"; 
// import { getLocalCart } from "@/lib/local-cart";

// export const isLoggedIn = () => {
//   return localStorage.getItem('user') !== null;
// };

// export default function Header() {
//   const pathname = usePathname();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isHeaderVisible, setIsHeaderVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
//   const [userLoggedIn, setUserLoggedIn] = useState(false);
//   const [userName, setUserName] = useState("");

//   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
//   const [cartCount, setCartCount] = useState(0);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const isActive = (path: string) => {
//     return pathname === path ? "text-blue-900 font-semibold" : "text-gray-700";
//   };

//   // Check login status
//   useEffect(() => {
//     const checkLoginStatus = () => {
//       if (typeof window !== "undefined") {
//         const loggedIn = isLoggedIn();
//         setUserLoggedIn(loggedIn);
        
//         if (loggedIn) {
//           try {
//             const user = JSON.parse(localStorage.getItem("user")!);
//             setUserName(user.name || "User");
//           } catch (error) {
//             console.error("Failed to parse user data:", error);
//             setUserName("User");
//           }
//         }
//       }
//     };

//     checkLoginStatus();

//     // Listen for storage changes to update login status
//     const handleStorageChange = () => {
//       checkLoginStatus();
//     };

//     window.addEventListener('storage', handleStorageChange);
    
//     // Also listen for custom events when localStorage is updated in the same tab
//     window.addEventListener('userStatusChange', handleStorageChange);

//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//       window.removeEventListener('userStatusChange', handleStorageChange);
//     };
//   }, []);

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
//   async function fetchCartCount() {
//     try {
//       if (userLoggedIn) {
//         // For logged-in users, get cart from server
//         const cart = await getUserCart();
//         const totalItems = cart?.items?.length || 0;
//         setCartCount(totalItems);
//       } else {
//         // For logged-out users, get cart from localStorage
//         const localCart = getLocalCart();
//         const totalItems = localCart.reduce((sum, item) => sum + item.quantity, 0);
//         setCartCount(totalItems);
//       }
//     } catch (error) {
//       console.error("Failed to load cart", error);
//     }
//   }
//   fetchCartCount();
// }, [userLoggedIn]); // Add userLoggedIn as dependency

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

  
//   const handleLogoutClick = () => {
//     setIsLogoutModalOpen(true);
//   };

//   return (
//     <>
//       <header
//         className={`w-full bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
//           }`}
//       >
//         {/* Free Shipping Bar */}
//         <div className="bg-blue-900 text-white text-center text-sm py-2">
//           Free shipping on orders over ₹500. Shop Now!
//         </div>

//         {/* Navbar */}
//         <div className="flex justify-between items-center px-4 md:px-12 py-4 md:py-6 relative">
//           {/* Mobile Menu Button (Left on Mobile) */}
//           <button
//             onClick={toggleMenu}
//             className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             aria-label="Toggle menu"
//           >
//             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               {isMenuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>

//           {/* Desktop Navigation (Left) */}
//           <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
//             <Link
//               href="/"
//               className={`hover:text-blue-900 transition-colors ${isActive("/")}`}
//             >
//               HOME
//             </Link>
//             {/* SHOP Dropdown */}
//             <div className="relative group">
//               <Link
//                 href="/shop"
//                 className={`hover:text-blue-900 transition-colors ${isActive("/shop")}`}
//               >
//                 SHOP
//               </Link>
//               <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                 <ul>
//                   {categories.map((cat, index) => (
//                     <li key={cat.id} className={index < categories.length - 1 ? "border-gray-200" : ""}>
//                       <Link
//                         href={`/shop/category/${cat.id}`}
//                         className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-900 hover:underline transition-colors text-sm font-medium uppercase tracking-wide"
//                       >
//                         {cat.name}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//             <Link
//               href="/our-story"
//               className={`hover:text-blue-900 transition-colors ${isActive("/our-story")}`}
//             >
//               OUR STORY
//             </Link>
//             <Link
//               href="/contact"
//               className={`hover:text-blue-900 transition-colors ${isActive("/contact")}`}
//             >
//               CONTACT
//             </Link>
//           </nav>

//           {/* Center: Logo */}
//           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//             <Link
//               href="/"
//               className="text-xl md:text-2xl font-bold text-gray-800"
//             >
//               BELLAMY
//             </Link>
//           </div>

//           {/* Right: Icons */}
//           <div className="flex items-center space-x-4">
//             <Link
//               href="/cart"
//               className={`relative p-2 rounded-md text-gray-700 hover:text-blue-900 transition-colors ${isActive(
//                 "/cart"
//               )}`}
//               aria-label="Cart"
//             >
//               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-4a2 2 0 100-4 2 2 0 000 4z" />
//               </svg>
//               {cartCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-blue-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
//                   {cartCount}
//                 </span>
//               )}
//             </Link>
            
//             {/* Profile / Login */}
//             <div className="relative group">
//               {userLoggedIn ? (
//                 <>
//                   {/* Profile Avatar */}
//                   <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-700 text-white font-bold cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
//                     {userName?.[0]?.toUpperCase() || "U"}
//                   </div>
//                   {/* Dropdown */}
//                   <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl border border-gray-100 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
//                     <div className="py-1">
//                       <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
//                         Hello, {userName}
//                       </div>
//                       <Link
//                         href="/user-profile"
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-900 transition-colors"
//                       >
//                         <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                         </svg>
//                         Profile
//                       </Link>
//                       <button
//                         onClick={handleLogoutClick}
//                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
//                       >
//                         <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                         </svg>
//                         Logout
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-900 to-blue-800 text-white text-sm font-medium hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
//                 >
//                   Login
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Mobile Menu */}
//         <div
//           className={`md:hidden bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
//             isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//           }`}
//         >
//           <nav className="px-4 py-4 space-y-3">
//             <Link
//               href="/"
//               className={`block py-2 text-lg font-medium transition-colors ${isActive("/")}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               HOME
//             </Link>
//             <details className="group">
//               <summary className="flex justify-between items-center py-2 text-lg font-medium text-gray-700 hover:text-blue-900 cursor-pointer">
//                 SHOP
//                 <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </summary>
//               <div className="pl-4 mt-2 space-y-2">
//                 {categories.map((cat) => (
//                   <Link
//                     key={cat.id}
//                     href={`/shop/category/${cat.id}`}
//                     className="block text-gray-600 hover:text-blue-900 transition-colors"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     {cat.name}
//                   </Link>
//                 ))}
//               </div>
//             </details>
//             <Link
//               href="/our-story"
//               className={`block py-2 text-lg font-medium transition-colors ${isActive("/our-story")}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               OUR STORY
//             </Link>
//             <Link
//               href="/contact"
//               className={`block py-2 text-lg font-medium transition-colors ${isActive("/contact")}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               CONTACT
//             </Link>
//             {userLoggedIn && (
//               <Link
//                 href="/profile"
//                 className={`block py-2 text-lg font-medium transition-colors ${isActive("/profile")}`}
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 PROFILE
//               </Link>
//             )}
//           </nav>
//         </div>
//       </header>

//       {/* Logout Modal */}
//       <LogoutDialog 
//         open={isLogoutModalOpen} 
//         setOpen={setIsLogoutModalOpen} 
//       />
//     </>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserCart } from "@/server/actions/cart-action";
import { useState, useEffect } from "react";
import { LogoutDialog } from "./auth/logout-modal";
import { getLocalCart } from "@/lib/local-cart";
import CartIcon from "@/components/common/CartIcon";
import WishlistIcon from "@/components/common/WishlistIcon";

export const isLoggedIn = () => {
  return localStorage.getItem('user') !== null;
};

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const brand = {
    primary: "#8B1D3F", // maroon
    primaryDark: "#6F1632",
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => pathname === path;

  // Check login status
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
    const handleStorageChange = () => { checkLoginStatus(); };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStatusChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStatusChange', handleStorageChange);
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

  useEffect(() => {
    async function fetchCartCount() {
      try {
        if (userLoggedIn) {
          const cart = await getUserCart();
          const totalItems = cart?.items?.length || 0;
          setCartCount(totalItems);
        } else {
          const localCart = getLocalCart();
          const totalItems = localCart.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Failed to load cart", error);
      }
    }
    fetchCartCount();
  }, [userLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (isMenuOpen) { setIsHeaderVisible(true); return; }
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
        requestAnimationFrame(() => { handleScroll(); ticking = false; });
        ticking = true;
      }
    };

    if (!isMenuOpen) {
      window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    }
    return () => { window.removeEventListener("scroll", throttledHandleScroll); };
  }, [lastScrollY, isMenuOpen]);

  useEffect(() => { if (isMenuOpen) setIsHeaderVisible(true); }, [isMenuOpen]);

  const handleLogoutClick = () => { setIsLogoutModalOpen(true); };

  return (
    <>
      <header
        className={`w-full bg-white sticky top-0 z-50 transition-transform duration-300 ease-in-out ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* Promo Bar */}
        <div className="text-white text-center text-xs md:text-sm py-2" style={{ backgroundColor: brand.primary }}>
          New GST rates are now live across all products
        </div>

        {/* Top Bar: Logo centered, icons right */}
        <div className="flex justify-between items-center px-4 md:px-12 py-3 md:py-4 border-b" style={{ borderColor: "#F0E5E9" }}>
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full text-gray-800 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Left spacer for symmetry on desktop */}
          <div className="hidden md:block w-24" />

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="text-2xl font-semibold tracking-wider" style={{ color: brand.primary }}>
              BELLAMY
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <CartIcon count={cartCount} color={brand.primary} />
            {userLoggedIn && <WishlistIcon color={brand.primary} />}

            <div className="relative group">
              {userLoggedIn ? (
                <>
                  {/* Outline user icon button */}
                  <button aria-label="Account" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border" style={{ borderColor: brand.primary }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={brand.primary} strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl border border-gray-100 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Hello, {userName}</div>
                      <Link href="/user-profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profile
                      </Link>
                      <button onClick={handleLogoutClick} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" aria-label="Login" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border" style={{ borderColor: brand.primary }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={brand.primary} strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Nav Row (centered) */}
        <div className="hidden md:block">
          <div className="flex items-center justify-center py-3 shadow-sm/0" style={{ boxShadow: "inset 0 -1px 0 0 #F0E5E9", backgroundColor: "#F7ECEF" }}>
            <nav className="flex items-center gap-10 text-sm tracking-wide">
              <Link href="/" className={`transition-colors`} style={{ color: isActive("/") ? brand.primary : "#3f3f3f" }}>HOME</Link>
              <div className="relative group">
                <Link href="/shop" className={`transition-colors`} style={{ color: isActive("/shop") ? brand.primary : "#3f3f3f" }}>SHOP</Link>
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 bg-white shadow-2xl border rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden"
                  style={{ borderColor: "#E3D5CA", width: 360 }}>
                  <div className="grid grid-cols-2">
                    <div className="col-span-2 border-b px-4 py-3 text-[13px] font-semibold" style={{ color: brand.primary, borderColor: "#E3D5CA" }}>Shop Categories</div>
                    {(() => {
                      const mid = Math.ceil(categories.length / 2);
                      const left = categories.slice(0, mid);
                      const right = categories.slice(mid);
                      const renderCol = (items: { id: string; name: string }[]) => (
                        <div className="px-4 py-3 first:border-r" style={{ borderColor: "#E3D5CA" }}>
                          <div className="text-[12px] font-semibold mb-2" style={{ color: brand.primary }}>Browse</div>
                          <ul className="space-y-2">
                            {items.map((cat) => (
                              <li key={cat.id}>
                                <Link href={`/shop/category/${cat.id}`} className="block text-[13px] text-gray-700 hover:underline" style={{ color: "#3f3f3f" }}>
                                  {cat.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                      return (<>{renderCol(left)}{renderCol(right)}</>);
                    })()}
                  </div>
                </div>
              </div>
              <Link href="/our-story" className={`transition-colors`} style={{ color: isActive("/our-story") ? brand.primary : "#3f3f3f" }}>OUR STORY</Link>
              <Link href="/contact" className={`transition-colors`} style={{ color: isActive("/contact") ? brand.primary : "#3f3f3f" }}>CONTACT</Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-white border-t transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`} style={{ borderColor: "#F0E5E9" }}>
          <nav className="px-4 py-4 space-y-3">
            <Link href="/" className={`block py-2 text-base font-medium ${isActive("/")}`} onClick={() => setIsMenuOpen(false)}>HOME</Link>
            <details className="group">
              <summary className="flex justify-between items-center py-2 text-base font-medium text-gray-800 cursor-pointer">
                SHOP
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="pl-4 mt-2 space-y-2">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/shop/category/${cat.id}`} className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/our-story" className={`block py-2 text-base font-medium ${isActive("/our-story")}`} onClick={() => setIsMenuOpen(false)}>OUR STORY</Link>
            <Link href="/contact" className={`block py-2 text-base font-medium ${isActive("/contact")}`} onClick={() => setIsMenuOpen(false)}>CONTACT</Link>
            {userLoggedIn && (
              <Link href="/profile" className={`block py-2 text-base font-medium ${isActive("/profile")}`} onClick={() => setIsMenuOpen(false)}>PROFILE</Link>
            )}
          </nav>
        </div>
      </header>

      <LogoutDialog open={isLogoutModalOpen} setOpen={setIsLogoutModalOpen} />
    </>
  );
}


