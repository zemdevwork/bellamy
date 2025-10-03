// "use client";

// import React, { useState, useTransition, useEffect } from "react";
// import { toast } from "sonner";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import OrderCheckout from "@/components/orders/OrderCheckout";
// import { isLoggedIn } from "@/lib/utils";
// import { addLocalCartItem, getLocalCart } from "@/lib/local-cart";
// import { Eye, ShoppingCart } from "lucide-react";
// import { useCart } from "@/context/cartContext";
// import { rupee } from "@/constants/values";

// type ProductProps = {
//   id: string;
//   name: string;
//   price: string;
//   oldPrice?: string;
//   image: string;
//   badge?: string;
//   description?: string;
//   variantId?: string;
//   brandName?: string;
//   brandThemePrimary?: string;
// };

// export default function ProductCard({
//   id,
//   name,
//   price,
//   oldPrice,
//   image,
//   badge,
//   description,
//   variantId,
//   brandName,
//   brandThemePrimary = "#000",
// }: ProductProps) {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [isPending, startTransition] = useTransition();
//   const [isInCart, setIsInCart] = useState(false);
//   const [showCheckout, setShowCheckout] = useState(false);
//   const router = useRouter();
//   const { updateCartCount } = useCart();

//   // Check if product already in cart on mount
//   useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         if (isLoggedIn()) {
//           const res = await fetch("/api/cart", { cache: "no-store" });
//           if (!res.ok) return;
//           const cart = await res.json();
//           // cart is now an array
//           if (Array.isArray(cart)) {
//             const exists = cart.some(
//               (item: { variant: { id: string } }) =>
//                 !!item.variant &&
//                 (variantId ? item.variant.id === variantId : false)
//             );
//             setIsInCart(exists);
//           }
//         } else {
//           const localCart = getLocalCart();
//           const exists = localCart.some((item) =>
//             variantId ? item.variantId === variantId : false
//           );
//           setIsInCart(exists);
//         }
//       } catch (error) {
//         console.error("Error loading cart:", error);
//       }
//     };

//     if (id) fetchCart();
//   }, [id, variantId]);

//   const discountPercentage = oldPrice
//     ? Math.round(
//         ((parseFloat(oldPrice) -
//           parseFloat(price)) /
//           parseFloat(oldPrice)) *
//           100
//       )
//     : 0;

//   // Add to cart handler
//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!variantId) {
//       toast.error("Variant is required");
//       return;
//     }

//     startTransition(async () => {
//       try {
//         if (isLoggedIn()) {
//           const res = await fetch("/api/cart", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ variantId, quantity: 1 }),
//           });
//           if (!res.ok) throw new Error("Failed to add to cart");
//           await updateCartCount();
//           toast.success(`Added "${name}" to cart!`);
//         } else {
//           addLocalCartItem(variantId, 1);
//           await updateCartCount();
//           toast.success(`Added "${name}" to cart (Local)!`);
//         }
//         setIsInCart(true);
//       } catch (error) {
//         console.error("Failed to add to cart:", error);
//         toast.error("Failed to add to cart. Please try again.");
//       }
//     });
//   };

//   const handleGoToCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     router.push("/cart");
//   };

//   const handleViewDetails = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     router.push(`/product/${id}`);
//   };

//   return (
//     <div className="group relative  mx-2">
//       <div
//         onClick={() => router.push(`/product/${id}`)}
//         className="cursor-pointer"
//       >
//         <div
//           className="
//     bg-white 
//     transition-all duration-500
//     hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
//     p-4
//     md:rounded-tr-xl md:rounded-bl-xl
//     lg:rounded-tr-2xl lg:rounded-bl-2xl
//     overflow-hidden
//     w-[360px] 
//     min-h-[580px]
//     flex
//     flex-col
//   "
//         >
//           {/* Badges */}
//           {(badge || discountPercentage > 0) && (
//             <div className="absolute z-10 inset-x-0 top-0 flex justify-between p-3">
//               <div>
//                 {badge && (
//                   <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
//                     {badge}
//                   </span>
//                 )}
//               </div>
//               {discountPercentage > 0 && (
//                 <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
//                   -{discountPercentage}%
//                 </span>
//               )}
//             </div>
//           )}

//           {/* Image */}
//           <div className="relative w-full h-[420px] overflow-hidden bg-[#F9F6F7] md:rounded-tr-md md:rounded-bl-md lg:rounded-tr-lg lg:rounded-bl-lg">
//             <Image
//               src={image}
//               alt={name}
//               fill
//               className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
//               onLoad={() => setImageLoaded(true)}
//             />
//             {!imageLoaded && (
//               <div className="absolute inset-0 bg-gray-200 animate-pulse" />
//             )}

//             {/* Action Buttons - Always visible, bottom center */}
//             <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-5">
//               {/* Already in cart */}
//               {isInCart ? (
//                 <button
//                   onClick={handleGoToCart}
//                   aria-label="Go to cart"
//                   title="Go to cart"
//                   className="inline-flex hover:w-24 items-center justify-center w-15 h-10 rounded-full cursor-pointer 
//                bg-amber-50 text-stone-700 hover:opacity-80 transition-all shadow-lg"
//                 >
//                   <ShoppingCart size={18} />
//                 </button>
//               ) : (
//                 // Add to cart
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={isPending}
//                   aria-label="Add to cart"
//                   title="Add to cart"
//                   className="inline-flex items-center hover:w-24 justify-center w-15 h-10 rounded-full cursor-pointer 
//                bg-stone-200 text-stone-800 hover:bg-amber-50 transition-all disabled:opacity-50 shadow-lg"
//                 >
//                   <ShoppingCart size={18} />
//                 </button>
//               )}

//               <button
//                 onClick={handleViewDetails}
//                 aria-label="View details"
//                 title="View details"
//                 className="inline-flex items-center justify-center w-15 h-10 rounded-full hover:w-24 cursor-pointer bg-white/80 text-stone-700 hover:bg-stone-50 transition-all shadow-lg"
//               >
//                 <Eye size={18} />
//               </button>
//             </div>
//           </div>

//           {/* Product Info */}
//           <div className="pt-3 flex flex-col gap-1">
//             <div className="text-xs text-gray-500 h-4">{brandName || ""}</div>
//             <h3 className="font-serif text-sm text-gray-900 line-clamp-2 h-10">
//               {name}
//             </h3>
//             <div className="flex items-center gap-2">
//               {oldPrice && (
//                 <span className="text-xs text-gray-400 line-through">
//                   {rupee}{oldPrice}
//                 </span>
//               )}
//               <div
//                 className="font-semibold text-base"
//                 style={{ color: brandThemePrimary }}
//               >
//                 {rupee}{price}
//               </div>
//             </div>
//             {description ? (
//               <p className="text-xs text-gray-600 line-clamp-2 h-8">
//                 {description}
//               </p>
//             ) : (
//               <div className="h-8"></div>
//             )}
//           </div>
//         </div>
//       </div>

//       {showCheckout && (
//         <OrderCheckout
//           products={[
//             {
//               id: variantId as string,
//               name,
//               price: parseFloat(price),
//               quantity: 1,
//               image,
//             },
//           ]}
//           total={parseFloat(price)}
//           onClose={() => setShowCheckout(false)}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils";
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart";
import { Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { rupee } from "@/constants/values";

type ProductProps = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  badge?: string;
  description?: string;
  variantId?: string;
  brandName?: string;
  brandThemePrimary?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  badge,
  description,
  variantId,
  brandName,
  brandThemePrimary = "#000",
}: ProductProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isInCart, setIsInCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const { updateCartCount } = useCart();

  // Check if product already in cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (isLoggedIn()) {
          const res = await fetch("/api/cart", { cache: "no-store" });
          if (!res.ok) return;
          const cart = await res.json();
          // cart is now an array
          if (Array.isArray(cart)) {
            const exists = cart.some(
              (item: { variant: { id: string } }) =>
                !!item.variant &&
                (variantId ? item.variant.id === variantId : false)
            );
            setIsInCart(exists);
          }
        } else {
          const localCart = getLocalCart();
          const exists = localCart.some((item) =>
            variantId ? item.variantId === variantId : false
          );
          setIsInCart(exists);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };

    if (id) fetchCart();
  }, [id, variantId]);

  const discountPercentage = oldPrice
    ? Math.round(
      ((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) *
      100
    )
    : 0;

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variantId) {
      toast.error("Variant is required");
      return;
    }

    startTransition(async () => {
      try {
        if (isLoggedIn()) {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId, quantity: 1 }),
          });
          if (!res.ok) throw new Error("Failed to add to cart");
          await updateCartCount();
          toast.success(`Added "${name}" to cart!`);
        } else {
          addLocalCartItem(variantId, 1);
          await updateCartCount();
          toast.success(`Added "${name}" to cart (Local)!`);
        }
        setIsInCart(true);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add to cart. Please try again.");
      }
    });
  };

  const handleGoToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/cart");
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${id}`);
  };

  return (
    <div className="group relative mx-2">
      <div
        onClick={() => router.push(`/product/${id}`)}
        className="cursor-pointer"
      >
        <div
          className="
    bg-white 
    transition-all duration-300
    hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]
    rounded-lg
    overflow-hidden
     w-[318px]
    min-h-[520px]
    flex
    flex-col
  "
        >
          {/* Badges */}
          {(badge || discountPercentage > 0) && (
            <div className="absolute z-10 inset-x-0 top-0 flex justify-between p-4">
              <div>
                {badge && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded text-[11px] font-medium uppercase tracking-wide">
                    {badge}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="bg-green-600 text-white px-3 py-1 rounded text-[11px] font-medium">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          )}

          {/* Image */}
          <div className="relative w-full h-[480px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg rounded-b-lg">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 rounded-t-lg rounded-b-lg"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}

            {/* Action Buttons - Bottom center with Taneira style */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Already in cart */}
              {isInCart ? (
                <button
                  onClick={handleGoToCart}
                  aria-label="Go to cart"
                  title="Go to cart"
                  className="flex items-center justify-center w-12 h-12 rounded-full 
               bg-white hover:bg-gray-50 text-gray-800 transition-all shadow-lg backdrop-blur-sm"
                >
                  <ShoppingCart size={20} strokeWidth={1.5} />
                </button>
              ) : (
                // Add to cart
                <button
                  onClick={handleAddToCart}
                  disabled={isPending}
                  aria-label="Add to cart"
                  title="Add to cart"
                  className="flex items-center justify-center w-12 h-12 rounded-full 
               bg-white hover:bg-gray-50 text-gray-800 transition-all disabled:opacity-50 shadow-lg backdrop-blur-sm"
                >
                  <ShoppingCart size={20} strokeWidth={1.5} />
                </button>
              )}

              <button
                onClick={handleViewDetails}
                aria-label="View details"
                title="View details"
                className="flex items-center justify-center w-12 h-12 rounded-full 
             bg-white hover:bg-gray-50 text-gray-800 transition-all shadow-lg backdrop-blur-sm"
              >
                <Eye size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3 flex flex-col gap-2">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-[36px] leading-tight">
              {name}
            </h3>
            <div className="flex items-baseline gap-2">
              <div
                className="font-bold text-base"
                style={{ color: brandThemePrimary }}
              >
                {rupee}{price}
              </div>
              {oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {rupee}{oldPrice}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-tight">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {showCheckout && (
        <OrderCheckout
          products={[
            {
              id: variantId as string,
              name,
              price: parseFloat(price),
              quantity: 1,
              image,
            },
          ]}
          total={parseFloat(price)}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}