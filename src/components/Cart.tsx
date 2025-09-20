

// 'use client';

// import { useState, useTransition, useEffect } from 'react';
// import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import { addToCart, updateCartItem, removeFromCart } from '@/server/actions/cart-action';
// import Image from 'next/image';

// // Types
// interface CartItem {
//   id: string;
//   productId: string;
//   quantity: number;
//   product: {
//     id: string;
//     name: string;
//     price: number;
//     image?: string;
//   };
// }

// interface Cart {
//   id: string;
//   items: CartItem[];
// }

// // Add this function to your cart-action.ts file first
// async function getUserCart() {
//   try {
//     const response = await fetch('/api/cart', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch cart');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Failed to get cart:', error);
//     return null;
//   }
// }

// export function CartComponent() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isPending, startTransition] = useTransition();
//   const [cart, setCart] = useState<Cart | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchCart = async () => {
//     try {
//       setLoading(true);
//       const userCart = await getUserCart();
//       setCart(userCart);
//     } catch (error) {
//       console.error('Failed to fetch cart:', error);
//       setCart(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   // Refresh cart when sheet opens
//   useEffect(() => {
//     if (isOpen) {
//       fetchCart();
//     }
//   }, [isOpen]);

//   const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
//   const totalPrice = cart?.items?.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0
//   ) || 0;

//   const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
//     if (newQuantity < 1) return;

//     startTransition(async () => {
//       try {
//         await updateCartItem({ productId, quantity: newQuantity });
//         toast.success('Cart updated');
//         await fetchCart(); // Refresh cart data
//       } catch (error) {
//         toast.error('Failed to update cart');
//         console.error(error);
//       }
//     });
//   };

//   const handleRemoveItem = async (productId: string) => {
//     startTransition(async () => {
//       try {
//         await removeFromCart({ productId });
//         toast.success('Item removed from cart');
//         await fetchCart(); // Refresh cart data
//       } catch (error) {
//         toast.error('Failed to remove item');
//         console.error(error);
//       }
//     });
//   };

//   return (
//     <Sheet open={isOpen} onOpenChange={setIsOpen}>
//       <SheetTrigger asChild>
//         <Button variant="outline" size="icon" className="relative">
//           <ShoppingCart className="h-4 w-4" />
//           {totalItems > 0 && (
//             <Badge
//               variant="destructive"
//               className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
//             >
//               {totalItems}
//             </Badge>
//           )}
//         </Button>
//       </SheetTrigger>
      
//       <SheetContent className="flex w-full flex-col sm:max-w-lg">
//         <SheetHeader>
//           <SheetTitle>Shopping Cart</SheetTitle>
//           <SheetDescription>
//             {loading ? 'Loading...' : 
//              totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
//           </SheetDescription>
//         </SheetHeader>

//         <div className="flex-1 overflow-auto py-4">
//           {loading ? (
//             <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
//               <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-black rounded-full"></div>
//               <p className="text-sm text-muted-foreground">Loading cart...</p>
//             </div>
//           ) : !cart?.items || cart.items.length === 0 ? (
//             <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
//               <ShoppingCart className="h-12 w-12 text-muted-foreground" />
//               <div>
//                 <p className="text-lg font-medium">Your cart is empty</p>
//                 <p className="text-sm text-muted-foreground">
//                   Add some items to get started
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {cart.items.map((item) => (
//                 <CartItemCard
//                   key={item.id}
//                   item={item}
//                   onUpdateQuantity={handleUpdateQuantity}
//                   onRemove={handleRemoveItem}
//                   disabled={isPending}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {cart?.items && cart.items.length > 0 && (
//           <div className="space-y-4 border-t pt-4">
//             <div className="flex items-center justify-between text-lg font-semibold">
//               <span>Total</span>
//               <span>${totalPrice.toFixed(2)}</span>
//             </div>
//             <Button 
//               className="w-full" 
//               size="lg"
//               disabled={isPending}
//             >
//               Checkout
//             </Button>
//           </div>
//         )}
//       </SheetContent>
//     </Sheet>
//   );
// }

// interface CartItemCardProps {
//   item: CartItem;
//   onUpdateQuantity: (productId: string, quantity: number) => void;
//   onRemove: (productId: string) => void;
//   disabled?: boolean;
// }

// function CartItemCard({ item, onUpdateQuantity, onRemove, disabled }: CartItemCardProps) {
//   const [quantity, setQuantity] = useState(item.quantity);

//   const handleQuantityChange = (newQuantity: number) => {
//     if (newQuantity < 1) return;
//     setQuantity(newQuantity);
//     onUpdateQuantity(item.productId, newQuantity);
//   };

//   const handleInputChange = (value: string) => {
//     const newQuantity = parseInt(value) || 1;
//     if (newQuantity >= 1) {
//       setQuantity(newQuantity);
//       onUpdateQuantity(item.productId, newQuantity);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4 rounded-lg border p-4">
//       {item.product.image && (
//         <Image
//           src={item.product.image}
//           alt={item.product.name}
//           width={64}
//           height={64}
//           className="h-16 w-16 rounded-md object-cover"
//         />
//       )}
      
//       <div className="flex-1 space-y-2">
//         <h4 className="font-medium leading-none">{item.product.name}</h4>
//         <p className="text-sm text-muted-foreground">
//           ${item.product.price.toFixed(2)} each
//         </p>
        
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="icon"
//             className="h-8 w-8"
//             onClick={() => handleQuantityChange(quantity - 1)}
//             disabled={disabled || quantity <= 1}
//           >
//             <Minus className="h-4 w-4" />
//           </Button>
          
//           <Input
//             type="number"
//             min="1"
//             value={quantity}
//             onChange={(e) => handleInputChange(e.target.value)}
//             className="h-8 w-16 text-center"
//             disabled={disabled}
//           />
          
//           <Button
//             variant="outline"
//             size="icon"
//             className="h-8 w-8"
//             onClick={() => handleQuantityChange(quantity + 1)}
//             disabled={disabled}
//           >
//             <Plus className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
      
//       <div className="text-right">
//         <p className="font-medium">
//           ${(item.product.price * quantity).toFixed(2)}
//         </p>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 text-destructive hover:text-destructive"
//           onClick={() => onRemove(item.productId)}
//           disabled={disabled}
//         >
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// // Updated AddToCartButton component
// interface AddToCartButtonProps {
//   productId: string;
//   quantity?: number;
//   variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
//   size?: 'default' | 'sm' | 'lg' | 'icon';
//   className?: string;
//   children?: React.ReactNode;
//   onSuccess?: () => void;
// }

// export function AddToCartButton({ 
//   productId, 
//   quantity = 1, 
//   variant = 'default',
//   size = 'default',
//   className,
//   children,
//   onSuccess
// }: AddToCartButtonProps) {
//   const [isPending, startTransition] = useTransition();

//   const handleAddToCart = () => {
//     startTransition(async () => {
//       try {
//         await addToCart({ productId, quantity });
//         toast.success('Added to cart');
//         onSuccess?.();
        
//         // Trigger window event to update cart count
//         window.dispatchEvent(new CustomEvent('cartUpdated'));
//       } catch (error) {
//         toast.error('Failed to add to cart');
//         console.error(error);
//       }
//     });
//   };

//   return (
//     <Button
//       variant={variant}
//       size={size}
//       className={className}
//       onClick={handleAddToCart}
//       disabled={isPending}
//     >
//       {isPending ? 'Adding...' : (children || 'Add to Cart')}
//     </Button>
//   );
// }
"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

import { getUserCart, updateCartItem, removeFromCart } from "@/server/actions/cart-action";

type Cart = {
  id: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      image: string | null;
    };
  }[];
};

export default function CartComponent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchCart = async () => {
    setLoading(true);
    const userCart = await getUserCart();
    setCart(userCart);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    startTransition(async () => {
      try {
        await updateCartItem({ productId, quantity: newQuantity });
        fetchCart();
      } catch {
        toast.error("Failed to update cart");
      }
    });
  };

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      try {
        await removeFromCart({ productId });
        toast.success("Item removed");
        fetchCart();
      } catch {
        toast.error("Failed to remove item");
      }
    });
  };

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) || 0;

  if (loading) {
    return <p className="text-center py-10">Loading cart...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">
          Add some products to continue shopping.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">Your cart</h1>

      {/* Header row */}
      <div className="grid grid-cols-12 items-center border-b pb-4 mb-6 text-sm font-medium text-muted-foreground">
        <div className="col-span-6">PRODUCT</div>
        <div className="col-span-3 text-center">QUANTITY</div>
        <div className="col-span-3 text-right">TOTAL</div>
      </div>

      {/* Cart Items */}
      <div className="space-y-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center border-b pb-6"
          >
            {/* Product */}
            <div className="col-span-6 flex items-center gap-4">
              {item.product.image && (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-24 h-24"
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Rs. {item.product.price}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="col-span-3 flex items-center justify-center">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity - 1)
                  }
                  disabled={isPending || item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity + 1)
                  }
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(item.productId)}
                disabled={isPending}
                className="ml-4 text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Total */}
            <div className="col-span-3 text-right font-medium">
              Rs. {(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Total */}
      <div className="flex justify-end mt-10">
        <div className="w-full max-w-md space-y-4 border-t pt-6">
          <div className="flex justify-between text-lg">
            <span>Estimated total</span>
            <span className="font-semibold">Rs. {total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Taxes included. Discounts and shipping calculated at checkout.
          </p>
          <Button className="w-full h-12 text-lg font-medium">
            Buy it now
          </Button>
        </div>
      </div>
    </div>
  );
}
