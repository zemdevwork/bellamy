"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addToWishlist } from "@/server/actions/wishlist-action";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils";
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart";
import { Heart } from "lucide-react";
import { useCart } from '@/context/cartContext';
import ShareButton from "../common/Share";
import { brand, rupee } from "@/constants/values";
import RelatedProducts from "../RelatedProducts";

const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

type VariantOption = {
  attributeId: string;
  attributeName: string;
  valueId: string;
  value: string;
};

type ProductVariant = {
  id: string;
  price: number;
  qty: number;
  images: string[];
  options: VariantOption[];
};

type AttributeCatalog = {
  attributeId: string;
  name: string;
  values: { valueId: string; value: string }[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  image: string;
  brand?: { id: string; name: string };
  price: number;
  subimage: string[];
  variants: ProductVariant[];
  attributesCatalog: AttributeCatalog[];
  defaultVariantId: string | null;
};

export default function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isWishPending, startWishTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { updateCartCount } = useCart();
  const [quantity, setQuantity] = useState(1); // ✅ Added quantity state

  const router = useRouter();

  type CartItem = { variant: { id: string } };

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/product/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data: Product = await res.json();

        const defaultVariantId = data.defaultVariantId || data.variants[0]?.id || null;
        const defaultVariant = data.variants.find(v => v.id === defaultVariantId) || data.variants[0] || null;

        const initialAttributes: Record<string, string> = {};
        if (defaultVariant) {
          for (const opt of defaultVariant.options) {
            initialAttributes[opt.attributeId] = opt.valueId;
          }
        } else if (data.attributesCatalog) {
          for (const attr of data.attributesCatalog) {
            if (attr.values[0]) initialAttributes[attr.attributeId] = attr.values[0].valueId;
          }
        }

        setProduct(data);
        setSelectedVariantId(defaultVariantId);
        setSelectedAttributes(initialAttributes);
        setSelectedImage(defaultVariant?.images?.[0] || data.image || data.subimage?.[0] || null);

        if (isLoggedIn()) {
          const cartRes = await fetch("/api/cart", { cache: "no-store" });
          if (cartRes.ok) {
            const items = await cartRes.json();
            // API returns an array of items
            const exists = Array.isArray(items)
              ? items.some((item: CartItem) => item.variant?.id === (defaultVariantId || ""))
              : false;
            setIsInCart(!!exists);
          }
          const wlRes = await fetch("/api/wishlist");
          if (wlRes.ok) {
            const wl = await wlRes.json();
            const existsW = wl && wl.items?.some((item: { variant: { id: string } }) => item.variant?.id === (defaultVariantId || ""));
            setIsInWishlist(!!existsW);
          }
        } else {
          const localCart = getLocalCart();
          const exists = localCart.some((item) => item.variantId === (defaultVariantId || ""));
          setIsInCart(exists);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-lg">Loading product...</p>
      </div>
    );
  }
  if (error) return <p className="p-8 text-red-500 text-lg">{error}</p>;
  if (!product) return <p className="p-8 text-lg">Product not found.</p>;

  const selectedVariant = product?.variants.find(v => v.id === selectedVariantId) || null;
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const galleryImages = selectedVariant?.images?.length ? selectedVariant.images : [product?.image || "", ...(product?.subimage || [])];


  const handleAddToCart = () => {
    if (!product || !selectedVariantId) return;

    startTransition(async () => {
      try {
        if (isLoggedIn()) {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // body: JSON.stringify({ variantId: selectedVariantId, quantity: 1 }),
            body: JSON.stringify({ variantId: selectedVariantId, quantity }), // ✅ Updated
          });
          if (!res.ok) throw new Error("Failed to add to cart");
          await updateCartCount();
          toast.success(`✅ Added "${capitalizeWords(product.name)}" to your cart!`);
        } else {
          // addLocalCartItem(selectedVariantId, 1);
          addLocalCartItem(selectedVariantId, quantity); // ✅ Updated
          await updateCartCount();
          toast.success(`🛒 Added "${capitalizeWords(product.name)}" to cart (local)!`);
        }

        setIsInCart(true);
      } catch (error) {
        console.error("Failed to add to cart:", error);

        if (error instanceof Error) {
          toast.error(
            `❌ ${error.message || "Failed to add to cart. Try lowering the quantity."}`
          );
        } else {
          toast.error("❌ Failed to add to cart. Please try again.");
        }
      }
    });
  };

  const handleAddToWishlist = () => {
    if (!isLoggedIn()) {
      toast.error("Please login to use wishlist");
      return;
    }
    if (!product || !selectedVariantId) return;

    startWishTransition(async () => {
      try {
        const res = await addToWishlist({ variantId: selectedVariantId });
        if (res?.success) {
          setIsInWishlist(true);
          toast.success(`❤️ Added to wishlist`);
        }
      } catch (error) {
        console.log(error)
        toast.error("Failed to add to wishlist");
      }
    });
  };

  const handleGoToCart = () => router.push("/cart");
  const handleBuyNow = () => {
    if (!isLoggedIn()) {
      toast.error("Please login to continue with Buy Now");
      return;
    }
    if (!product || !selectedVariantId) return;
    setShowCheckout(true);
  };

  return (
    <div className="w-full h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button onClick={() => router.push("/")} className="hover:text-gray-900">Home</button>
        <span>/</span>
        <span className="text-gray-400">{capitalizeWords(product.name)}</span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images (COMPACTED) */}
        <div className="space-y-3">
          {/* Main Image - Adjusted aspect ratio to 4/5 for a slightly smaller look */}
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden" style={{ aspectRatio: "4/5" }}>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={capitalizeWords(product.name)}
                fill
                className="object-cover p-2" // Changed to object-cover for full image view
              />
            )}
          </div>

          {/* Thumbnail Gallery - Changed to horizontal scrollable list */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                // Smaller size for thumbnails (w-16, h-20)
                className={`relative flex-shrink-0 w-16 h-20 cursor-pointer rounded-md overflow-hidden border-2 transition ${selectedImage === img ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
                  }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          {/* Icons */}
          <div className="flex justify-end gap-3">
            <ShareButton url={`${window.location.origin}/product/${productId}`} />
            <button
              onClick={handleAddToWishlist}
              disabled={isWishPending}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50"
            >
              <Heart
                size={18}
                className={isInWishlist ? "text-rose-900" : "text-gray-700"}
                fill={isInWishlist ? brand.primary : "none"}
              />
            </button>
          </div>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {capitalizeWords(product.brand.name)}
            </p>
          )}

          {/* Product Name */}
          <h1 className="text-2xl font-medium text-gray-900">
            {capitalizeWords(product.name)}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-gray-900">{rupee} {price.toLocaleString()}</span>
            <span className="text-lg text-gray-400 line-through">MRP {rupee} {(price * 1.2).toFixed(0)}</span>
            <span className="text-sm text-green-600 font-medium">7% OFF</span>
          </div>
          <p className="text-xs text-gray-500">Inclusive of all taxes</p>

          {/* Attributes Selection */}
          {product.attributesCatalog?.map((attr) => (
            <div key={attr.attributeId}>
              <p className="text-sm font-medium text-gray-900 mb-3">
                Select {attr.name}
              </p>
              <div className="flex gap-2 flex-wrap">
                {attr.values.map((val) => {
                  const isSelected = selectedAttributes[attr.attributeId] === val.valueId;
                  return (
                    <button
                      key={val.valueId}
                      onClick={() => {
                        const next = { ...selectedAttributes, [attr.attributeId]: val.valueId };
                        setSelectedAttributes(next);
                        const match = product.variants.find((v) =>
                          v.options.every((o) => next[o.attributeId] === o.valueId)
                        ) || null;
                        setSelectedVariantId(match ? match.id : null);
                        if (match?.images?.[0]) setSelectedImage(match.images[0]);
                      }}
                      className={`px-4 py-2 text-sm border rounded transition ${isSelected
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                        }`}
                    >
                      {capitalizeWords(val.value)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!isInCart && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {isInCart ? (
              <button
                onClick={handleGoToCart}
                className="w-full py-3 text-sm cursor-pointer font-medium bg-white text-gray-900 border border-gray-900 rounded hover:bg-gray-50 transition"
              >
                GO TO CART
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isPending}
                className="w-full py-3 text-sm font-medium cursor-pointer bg-white text-gray-900 border border-gray-900 rounded hover:bg-gray-50 transition disabled:opacity-50"
              >
                {isPending ? "ADDING..." : "ADD TO BAG"}
              </button>
            )}
            <button
              onClick={handleBuyNow}
              className="w-full py-3 cursor-pointer text-sm font-medium bg-rose-700 text-white rounded hover:bg-rose-800 transition"
            >
              BUY NOW
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Product Details</h3>
            <div className="space-y-2 text-sm">
              {product.brand && (
                <div className="flex">
                  <span className="text-gray-500 w-32">Brand:</span>
                  <span className="text-gray-900 font-medium">{capitalizeWords(product.brand.name)}</span>
                </div>
              )}
              {selectedVariant && (
                <>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Availability:</span>
                    <span className={`font-medium ${selectedVariant.qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedVariant.qty > 0 ? `In Stock (${selectedVariant.qty} available)` : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">SKU:</span>
                    <span className="text-gray-900">{selectedVariant.id.slice(0, 10).toUpperCase()}</span>
                  </div>
                </>
              )}
              {product.attributesCatalog?.map((attr) => {
                const selectedValue = attr.values.find(v => v.valueId === selectedAttributes[attr.attributeId]);
                return selectedValue ? (
                  <div key={attr.attributeId} className="flex">
                    <span className="text-gray-500 w-32">{attr.name}:</span>
                    <span className="text-gray-900">{capitalizeWords(selectedValue.value)}</span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="pt-4 space-y-2 text-sm text-gray-600 border-t mt-4">
              <p>✓ Usually Dispatches within 1 to 2 Days</p>
              <p>✓ Easy 7 day return</p>
              <p>✓ 100% Authentic Products</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Product Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <OrderCheckout
          products={[
            {
              id: selectedVariantId || product.id,
              name: capitalizeWords(product.name),
              price: price,
              quantity, // ✅ Updated
              image: selectedImage ?? product.image ?? undefined,
            },
          ]}
          // total={price * 1}
          total={price * quantity} // ✅ Updated
          onClose={() => setShowCheckout(false)}
        />
      )}
      <RelatedProducts brand={product.brand!}/>
    </div>

  );
}