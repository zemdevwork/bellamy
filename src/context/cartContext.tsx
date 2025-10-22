'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLoggedIn } from '@/lib/utils';
import { getUserCart } from '@/server/actions/cart-action';
import { getUserWishlist } from '@/server/actions/wishlist-action';
import { getLocalCart } from '@/lib/local-cart';

interface CartWishlistContextType {
  cartCount: number;
  wishlistCount: number;
  updateCartCount: () => Promise<void>;
  updateWishlistCount: () => Promise<void>;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export function CartWishlistProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCartCount = async () => {
    try {
      if (isLoggedIn()) {
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
  };

  const updateWishlistCount = async () => {
    try {
      if (isLoggedIn()) {
        const wishlist = await getUserWishlist();
        const totalItems = wishlist?.items?.length || 0;
        setWishlistCount(totalItems);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
      console.error("Failed to load wishlist", error);
    }
  };


  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
  }, []);

  return (
    <CartWishlistContext.Provider value={{ 
      cartCount, 
      wishlistCount, 
      updateCartCount, 
      updateWishlistCount,
    }}>
      {children}
    </CartWishlistContext.Provider>
  );
}

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (context === undefined) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider');
  }
  return context;
};

// Optional: Keep the old hook names for backwards compatibility
export const useCart = () => {
  const { cartCount, updateCartCount } = useCartWishlist();
  return { cartCount, updateCartCount };
};

export const useWishlist = () => {
  const { wishlistCount, updateWishlistCount } = useCartWishlist();
  return { wishlistCount, updateWishlistCount };
};