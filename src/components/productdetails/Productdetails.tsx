"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/server/actions/cart-action";
import OrderCheckout from "@/components/orders/OrderCheckout";
import { isLoggedIn } from "@/lib/utils"; // 👈 add this


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

        const cartRes = await fetch("/api/cart");
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          const exists =
            cartData && cartData.items?.some((item: CartItem) => item.productId === data.id);
          setIsInCart(!!exists);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) return <p className="p-6">Loading product...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  const colorAttrs = product.attributes
    ?.filter((a) => a.key.toLowerCase() === "color")
    .map((a) => a.value);
  const sizeAttrs = product.attributes
    ?.filter((a) => a.key.toLowerCase() === "size")
    .map((a) => a.value);

  const handleAddToCart = () => {
    if (!product) return;
    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (quantity > 10) {
      toast.error("Cannot add more than 10 items at once");
      return;
    }
    startTransition(async () => {
      try {
        await addToCart({
          productId: product.id,
          quantity,
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        });
        toast.success(`Added "${product.name}" to cart!`);
        setIsInCart(true);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        if (error instanceof Error) {
          toast.error(error.message || "Failed to add to cart. Try to lower the quantity.");
        } else {
          toast.error("Failed to add to cart. Please try again.");
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
    <div className="min-h-screen">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-black mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back
      </button>

      {/* TWO COLUMN LAYOUT */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 p-6 rounded-xl shadow-lg border bg-white">
        {/* LEFT: IMAGE GALLERY */}
        <div>
          <div className="w-full h-[420px] relative border rounded-xl overflow-hidden shadow-sm">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-6"
              />
            )}
          </div>

          <div className="flex space-x-3 mt-4 overflow-x-auto">
            {[product.image, ...product.subimage].map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 relative cursor-pointer border rounded-lg transition hover:scale-105 ${
                  selectedImage === img ? "border-black shadow-sm" : "border-gray-300"
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-contain p-2" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT DETAILS */}
        <div className="flex flex-col space-y-4">
          {/* Product Name */}
          <h1 className="text-2xl font-serif text-gray-900">{product.name}</h1>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Brand:</span> {product.brand.name}
            </p>
          )}

          {/* Price */}
          <div>
            {product.oldPrice && (
              <span className="line-through text-gray-400 mr-2">₹{product.oldPrice}</span>
            )}
            <span className="text-2xl font-bold text-blue-700">₹{product.price}</span>
            <p className="text-xs text-gray-500 mt-1">Inclusive of taxes</p>
          </div>

          {/* Colors */}
          {colorAttrs?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Color:</p>
              <div className="flex gap-2 flex-wrap">
                {colorAttrs.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-full border text-sm transition ${
                      selectedColor === color
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizeAttrs?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Size:</p>
              <div className="flex gap-2 flex-wrap">
                {sizeAttrs.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full border text-sm transition ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded-full bg-gray-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-1 text-lg disabled:text-gray-400"
              >
                -
              </button>
              <span className="px-4 font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {isInCart ? (
              <button
                onClick={handleGoToCart}
                className="flex-1 py-3 rounded-lg border border-gray-800 hover:bg-gray-50 font-medium"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isPending}
                className="flex-1 py-3 rounded-lg border border-gray-800 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Add to Cart"}
              </button>
            )}
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 font-medium shadow"
            >
              Buy Now
            </button>
          </div>

          {/* Description */}
          <div className="pt-4 border-t text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-1">Product Description:</p>
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
              name: product.name,
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
