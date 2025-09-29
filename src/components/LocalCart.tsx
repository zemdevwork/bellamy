"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { dummyCart } from "@/server/actions/cart-action";
import { getLocalCart } from "@/lib/local-cart";

type CartItem = {
  variantId: string;
  quantity: number;
};

type ProductWithDetails = {
  variantId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  } | null;
};

type DummyCartResponse = {
  success: boolean;
  message: string;
  data: ProductWithDetails[] | null;
};

export default function LocalCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productsWithDetails, setProductsWithDetails] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fetchCartDetails = async () => {
    setLoading(true);
    const localCart = getLocalCart();
    setCartItems(localCart);

    if (localCart.length === 0) {
      setProductsWithDetails([]);
      setLoading(false);
      return;
    }

    try {
      const response = await dummyCart(localCart) as DummyCartResponse;
      if (response.success && response.data) {
        setProductsWithDetails(response.data);
      } else {
        toast.error("Failed to fetch product details");
        setProductsWithDetails([]);
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
      toast.error("Failed to load cart");
      setProductsWithDetails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const updateLocalStorage = (updatedCart: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
    setCartItems(updatedCart);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    startTransition(async () => {
      try {
        const updatedCart = cartItems.map(item => 
          item.variantId === productId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        updateLocalStorage(updatedCart);
        
        // Update the products with details
        setProductsWithDetails(prev => 
          prev.map(product => 
            product.variantId === productId 
              ? { ...product, quantity: newQuantity }
              : product
          )
        );
        
        toast.success("Cart updated");
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("Failed to update cart");
      }
    });
  };

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      try {
        const updatedCart = cartItems.filter(item => item.variantId !== productId);
        updateLocalStorage(updatedCart);
        
        // Remove from products with details
        setProductsWithDetails(prev => 
          prev.filter(product => product.variantId !== productId)
        );
        
        toast.success("Item removed");
      } catch (error) {
        console.error("Error removing item:", error);
        toast.error("Failed to remove item");
      }
    });
  };

  const handleBuyNow = () => {
    router.push("/login");
  };

  const total = productsWithDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading Cart...</p>
      </div>
    );
  }

  if (productsWithDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">
          Add some products to continue shopping.
        </p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      {/* Title */}
      <h1 className="text-3xl font-serif mb-8">Your cart</h1>

      {/* Header row */}
      <div className="grid grid-cols-12 items-center border-b pb-4 mb-6 text-sm font-medium text-muted-foreground">
        <div className="col-span-6">PRODUCT</div>
        <div className="col-span-3 text-center">QUANTITY</div>
        <div className="col-span-3 text-right">TOTAL</div>
      </div>

      {/* Cart Items */}
      <div className="space-y-6">
        {productsWithDetails.map((item) => (
          <div
            key={item.variantId}
            className="grid grid-cols-12 items-center border-b pb-6"
          >
            {/* Product */}
            <div onClick={() => item.product && router.push(`/product/${item.product.id}`)} className="col-span-6 flex items-center gap-4">
              {item.product?.image && (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-24 h-24"
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{item.product?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Rs. {item.price}
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
                    handleUpdateQuantity(item.variantId, item.quantity - 1)
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
                    handleUpdateQuantity(item.variantId, item.quantity + 1)
                  }
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(item.variantId)}
                disabled={isPending}
                className="ml-4 text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Total */}
            <div className="col-span-3 text-right font-medium">
              Rs. {(item.price * item.quantity).toFixed(2)}
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
          <Button
            className="w-full h-12 text-lg font-medium"
            onClick={handleBuyNow}
            disabled={isPending}
          >
            Buy it now
          </Button>
        </div>
      </div>
    </div>
  );
}