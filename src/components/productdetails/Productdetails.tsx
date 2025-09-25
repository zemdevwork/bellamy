"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/server/actions/cart-action";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils"; // 👈 add this
import { addLocalCartItem, getLocalCart } from "@/lib/local-cart"; // 👈 add this

// Utility function to capitalize first letter of each word
const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

type Attribute = {
  key: string;
  value: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  subimage: string[];
  image: string;
  description: string;
  brand: {
    id: string;
    name: string;
  };
  attributes: Attribute[];
};

export default function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCheckout, setShowCheckout] = useState(false);

  const router = useRouter();

  type CartItem = {
    productId: string;
    quantity: number;
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/product/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data: Product = await res.json();

        setProduct(data);
        setSelectedImage(data.image || data.subimage?.[0] || null);

        // ✅ Check cart (server if logged in, local if not)
        if (isLoggedIn()) {
          const cartRes = await fetch("/api/cart");
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const exists =
              cartData &&
              cartData.items?.some((item: CartItem) => item.productId === data.id);
            setIsInCart(!!exists);
          }
        } else {
          const localCart = getLocalCart();
          const exists = localCart.some((item) => item.productId === data.id);
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

  const colorAttrs = product.attributes
    ?.filter((a) => a.key.toLowerCase() === "color")
    .map((a) => a.value);
  const sizeAttrs = product.attributes
    ?.filter((a) => a.key.toLowerCase() === "size")
    .map((a) => a.value);

  // ✅ Add to cart (server OR local)
const handleAddToCart = () => {
  if (!product) return;

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
          productId: product.id,
          quantity,
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        });
        toast.success(`✅ Added "${capitalizeWords(product.name)}" to your cart!`);
      } else {
        // ✅ Guest → local cart
        addLocalCartItem(product.id, quantity);
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


  const handleGoToCart = () => router.push("/cart");
  const handleBuyNow = () => {
    if (!isLoggedIn()) {
      toast.error("Please login to continue with Buy Now");
      return;
    }
    if (!product) return;
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
            {[product.image, ...product.subimage].map((img, idx) => (
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
            {product.oldPrice && (
              <span className="line-through text-gray-400 mr-3 text-lg">
                ₹{product.oldPrice}
              </span>
            )}
            <span className="text-3xl font-bold text-blue-700">
              ₹{product.price}
            </span>
            <p className="text-sm text-gray-500 mt-1">Inclusive of taxes</p>
          </div>

          {/* Colors */}
          {colorAttrs?.length > 0 && (
            <div>
              <p className="text-base font-medium text-gray-700 mb-3">Color:</p>
              <div className="flex gap-3 flex-wrap">
                {colorAttrs.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-2 rounded-full border text-sm transition ${
                      selectedColor === color
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {capitalizeWords(color)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizeAttrs?.length > 0 && (
            <div>
              <p className="text-base font-medium text-gray-700 mb-3">Size:</p>
              <div className="flex gap-3 flex-wrap">
                {sizeAttrs.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full border text-sm transition ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              id: product.id,
              name: capitalizeWords(product.name),
              price: product.price,
              quantity,
              image: product.image ?? undefined,
            },
          ]}
          total={product.price * quantity}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}