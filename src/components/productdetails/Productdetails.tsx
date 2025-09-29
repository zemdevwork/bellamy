"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/server/actions/cart-action";
import { addToWishlist } from "@/server/actions/wishlist-action";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils"; // 👈 add this
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart"; // 👈 add this

// Utility function to capitalize first letter of each word
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
  price: number; // default variant price
  subimage: string[]; // default variant images
  variants: ProductVariant[];
  attributesCatalog: AttributeCatalog[];
  defaultVariantId: string | null;
};

export default function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isWishPending, startWishTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

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

        // ✅ Check cart (server if logged in, local if not)
        if (isLoggedIn()) {
          const cartRes = await fetch("/api/cart");
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const exists = cartData && cartData.items?.some((item: CartItem) => item.variant?.id === (defaultVariantId || ""));
            setIsInCart(!!exists);
          }
          // check wishlist presence
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

  // ✅ Add to cart (server OR local)
const handleAddToCart = () => {
  if (!product || !selectedVariantId) return;

  // 🔹 Validation messages
  if (quantity < 1) {
    toast.error("❌ Quantity must be at least 1");
    return;
  }
  if (quantity > 10) {
    toast.error("❌ Cannot add more than 10 items at once");
    return;
  }

  startTransition(async () => {
    try {
      if (isLoggedIn()) {
        // ✅ Logged in → server cart
        await addToCart({
          variantId: selectedVariantId,
          quantity,
        });
        toast.success(`✅ Added "${capitalizeWords(product.name)}" to your cart!`);
      } else {
        // ✅ Guest → local cart
        addLocalCartItem(selectedVariantId, quantity);
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

  // ✅ Add to wishlist (server only)
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
      } catch (e) {
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
    <div className="w-full min-h-screen">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-black mb-8 text-lg"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      {/* TWO COLUMN LAYOUT */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 rounded-xl shadow-lg border bg-white">
        {/* LEFT: IMAGE GALLERY */}
        <div>
          <div className="w-full h-[500px] relative border rounded-xl overflow-hidden shadow-sm">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={capitalizeWords(product.name)}
                fill
                className="object-contain p-6"
              />
            )}
          </div>

          <div className="flex space-x-4 mt-6 overflow-x-auto">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-24 h-24 relative cursor-pointer border rounded-lg transition hover:scale-105 ${
                  selectedImage === img
                    ? "border-black shadow-sm"
                    : "border-gray-300"
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-contain p-2" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT DETAILS */}
        <div className="flex flex-col space-y-6">
          {/* Product Name */}
          <h1 className="text-3xl font-serif text-gray-900">{capitalizeWords(product.name)}</h1>

          {/* Brand */}
          {product.brand && (
            <p className="text-base text-gray-600">
              <span className="font-medium">Brand:</span> {capitalizeWords(product.brand.name)}
            </p>
          )}

          {/* Price */}
          <div>
            <span className="text-3xl font-bold text-blue-700">
              ₹{price}
            </span>
            <p className="text-sm text-gray-500 mt-1">Inclusive of taxes</p>
          </div>
          {/* Attributes selection */}
          {product.attributesCatalog?.map((attr) => (
            <div key={attr.attributeId}>
              <p className="text-base font-medium text-gray-700 mb-3">{attr.name}:</p>
              <div className="flex gap-3 flex-wrap">
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
                      className={`px-5 py-2 rounded-full border text-sm transition ${
                        isSelected ? "bg-black text-white border-black" : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {capitalizeWords(val.value)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-base font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-full bg-gray-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-4 py-2 text-lg disabled:text-gray-400 hover:bg-gray-100 rounded-l-full"
              >
                -
              </button>
              <span className="px-6 py-2 font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg hover:bg-gray-100 rounded-r-full"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            {isInCart ? (
              <button
                onClick={handleGoToCart}
                className="flex-1 py-4 text-lg rounded-lg border border-gray-800 hover:bg-gray-50 font-medium"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isPending}
                className="flex-1 py-4 text-lg rounded-lg border border-gray-800 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Add to Cart"}
              </button>
            )}
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 text-lg rounded-lg bg-black text-white hover:bg-gray-800 font-medium shadow"
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={isWishPending || isInWishlist}
              className="px-5 py-4 text-lg rounded-lg border border-gray-800 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              {isInWishlist ? "In Wishlist" : isWishPending ? "Adding..." : "Add to Wishlist"}
            </button>
          </div>

          {/* Description */}
          <div className="pt-6 border-t text-base text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-2 text-lg">Product Description:</p>
            {product.description}
          </div>
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
              quantity,
              image: selectedImage ?? product.image ?? undefined,
            },
          ]}
          total={price * quantity}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}