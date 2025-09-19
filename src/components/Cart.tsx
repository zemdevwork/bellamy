// 'use client';

// import { useState, useTransition } from 'react';
// import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
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
// import { Separator } from '@/components/ui/separator';
// import { toast } from 'sonner';
// import { addToCart, updateCartItem, removeFromCart } from '@/server/actions/cart-action';

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

// interface CartComponentProps {
//   cart?: Cart | null;
//   onCartUpdate?: () => void;
// }

// export function CartComponent({ cart, onCartUpdate }: CartComponentProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isPending, startTransition] = useTransition();

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
//         onCartUpdate?.();
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
//         onCartUpdate?.();
//       } catch (error) {
//         toast.error('Failed to remove item');
//         console.error(error);
//       }
//     });
//   };

//   const handleAddToCart = async (productId: string, quantity: number = 1) => {
//     startTransition(async () => {
//       try {
//         await addToCart({ productId, quantity });
//         toast.success('Added to cart');
//         onCartUpdate?.();
//       } catch (error) {
//         toast.error('Failed to add to cart');
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
//             {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
//           </SheetDescription>
//         </SheetHeader>

//         <div className="flex-1 overflow-auto py-4">
//           {!cart?.items || cart.items.length === 0 ? (
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
//         <img
//           src={item.product.image}
//           alt={item.product.name}
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

// // Optional: Add to Cart Button Component for Product Pages
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
'use client';

import { useState, useTransition } from 'react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { addToCart, updateCartItem, removeFromCart } from '@/server/actions/cart-action';

import Image from 'next/image';

// Types
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface CartComponentProps {
  cart?: Cart | null;
  onCartUpdate?: () => void;
}

export function CartComponent({ cart, onCartUpdate }: CartComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items?.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    startTransition(async () => {
      try {
        await updateCartItem({ productId, quantity: newQuantity });
        toast.success('Cart updated');
        onCartUpdate?.();
      } catch (error) {
        toast.error('Failed to update cart');
        console.error(error);
      }
    });
  };

  const handleRemoveItem = async (productId: string) => {
    startTransition(async () => {
      try {
        await removeFromCart({ productId });
        toast.success('Item removed from cart');
        onCartUpdate?.();
      } catch (error) {
        toast.error('Failed to remove item');
        console.error(error);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          {!cart?.items || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add some items to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  disabled={isPending}
                />
              ))}
            </div>
          )}
        </div>

        {cart?.items && cart.items.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              disabled={isPending}
            >
              Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  disabled?: boolean;
}

function CartItemCard({ item, onUpdateQuantity, onRemove, disabled }: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    onUpdateQuantity(item.productId, newQuantity);
  };

  const handleInputChange = (value: string) => {
    const newQuantity = parseInt(value) || 1;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4">
      {item.product.image && (
        <Image
          src={item.product.image}
          alt={item.product.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-md object-cover"
        />
      )}
      
      <div className="flex-1 space-y-2">
        <h4 className="font-medium leading-none">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">
          ${item.product.price.toFixed(2)} each
        </p>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={disabled || quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleInputChange(e.target.value)}
            className="h-8 w-16 text-center"
            disabled={disabled}
          />
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-medium">
          ${(item.product.price * quantity).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(item.productId)}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Optional: Add to Cart Button Component for Product Pages
interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddToCartButton({ 
  productId, 
  quantity = 1, 
  variant = 'default',
  size = 'default',
  className,
  children,
  onSuccess
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        await addToCart({ productId, quantity });
        toast.success('Added to cart');
        onSuccess?.();
      } catch (error) {
        toast.error('Failed to add to cart');
        console.error(error);
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? 'Adding...' : (children || 'Add to Cart')}
    </Button>
  );
}