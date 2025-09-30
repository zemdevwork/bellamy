'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLoggedIn } from '@/lib/utils';
import { getUserCart } from '@/server/actions/cart-action';
import { getLocalCart } from '@/lib/local-cart';

interface CartContextType {
  cartCount: number;
  updateCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

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

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};