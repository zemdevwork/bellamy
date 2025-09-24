"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/server/actions/cart-action";

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
          const exists = cartData.items?.some(
            (item: CartItem) => item.productId === data.id
          );
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

  if (loading) return <p className="p-6">Loading product...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  // 🔹 Extract attributes
  const colorAttrs = product.attributes
    ?.filter((a) => a.key.toLowerCase() === "color")
    .map((a) => a.value);
  const sizeAttrs = product.attributes
    ?.filter((a) => a.key.toLowerCase() === "size")
    .map((a) => a.value);

  const handleAddToCart = () => {
    if (!product) return;

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
        toast.error("Failed to add to cart. Please try again.");
      }
    });
  };

  const handleGoToCart = () => router.push("/cart");
  const handleBuyNow = () => {
    toast.info("Proceeding to checkout!");
    router.push("/checkout");
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT SIDE - IMAGE GALLERY */}
        <div>
          <div className="w-full h-[380px] relative border rounded-2xl overflow-hidden shadow-md bg-white">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-6"
              />
            )}
          </div>

          <div className="flex space-x-4 mt-4 overflow-x-auto">
            {[product.image, ...product.subimage].map((img, idx) => (
              <div
                key={idx}
                className={`w-20 h-20 relative cursor-pointer border rounded-lg transition-transform hover:scale-105 ${
                  selectedImage === img
                    ? "border-black shadow"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img}
                  alt="Thumbnail"
                  fill
                  className="object-contain p-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - PRODUCT DETAILS */}
        <div className="flex flex-col space-y-6 bg-white p-5 rounded-2xl shadow-lg border max-h-[600px] overflow-y-auto">
          {/* Product Name */}
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {product.name}
          </h1>

          {/* Brand */}
          {product.brand && (
            <p className="text-base text-gray-600">
              <span className="font-semibold text-gray-800">Brand:</span>{" "}
              {product.brand.name}
            </p>
          )}
            {/* Price */}
            <div className="space-y-1">
            {product.oldPrice && (
              <p className="line-through text-gray-400">₹{product.oldPrice}</p>
            )}
            <p className="text-2xl font-bold text-violet-600">₹{product.price}</p>
            <p className="text-sm text-gray-500">Inclusive of taxes</p>
          </div>

          {/* Colors */}
          {colorAttrs && colorAttrs.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Color:
              </p>
              <div className="flex gap-3 flex-wrap">
                {colorAttrs.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-full text-sm font-medium transition ${
                      selectedColor === color
                        ? "bg-black text-white border-black"
                        : "hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizeAttrs && sizeAttrs.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
               Size:
              </p>
              <div className="flex gap-3">
                {sizeAttrs.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-full text-sm font-medium transition ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-gray-700 font-medium">Quantity</span>
            <div className="flex items-center border rounded-lg shadow-sm bg-gray-50">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 text-lg disabled:text-gray-400"
              >
                -
              </button>
              <span className="px-4 font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            {isInCart ? (
              <button
                onClick={handleGoToCart}
                className="flex-1 border border-gray-800 py-3 rounded-lg hover:bg-gray-100 font-medium"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isPending}
                className="flex-1 border border-gray-800 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium"
              >
                {isPending ? "Adding..." : "Add to Cart"}
              </button>
            )}
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-600 font-medium shadow"
            >
              Buy Now
            </button>
          </div>

          {/* Description */}
          <div className="pt-4 border-t">
            {/* <h2 className="text-lg font-semibold mb-2 text-gray-900">
              Product Description
            </h2> */}
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
