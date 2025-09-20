"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  subimage: string[];
  image: string;
  description: string;
  sizes?: string[];
};

export default function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);

  const router = useRouter();

  // Fetch Product
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/product/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data: Product = await res.json();

        setProduct(data);
        setSelectedImage(data.subimage?.[0] || null);

        // ✅ Check if already in cart (dummy check using localStorage for demo)
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const exists = cart.some((item: any) => item.id === data.id);
        setIsInCart(exists);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Loading & Error States
  if (loading) return <p className="p-6">Loading product...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6">Product not found.</p>;

  // Handlers
  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cart.some((item: any) => item.id === product.id)) {
      cart.push({ id: product.id, quantity, size: selectedSize });
      localStorage.setItem("cart", JSON.stringify(cart));
      setIsInCart(true);
    }
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  const handleBuyNow = () => {
    console.log("Buying now:", { productId, quantity, selectedSize });
    alert("Proceeding to checkout!");
  };

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE - IMAGE GALLERY */}
        <div>
          <div className="w-full h-[500px] relative border rounded-lg overflow-hidden">
            {selectedImage && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-6"
              />
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex space-x-4 mt-4 overflow-x-auto">
            {product.subimage.map((img, idx) => (
              <div
                key={idx}
                className={`w-24 h-24 relative cursor-pointer border rounded-md ${
                  selectedImage === img ? "border-black" : "border-gray-300"
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
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div>
            {product.oldPrice && (
              <p className="line-through text-gray-500">Rs. {product.oldPrice}</p>
            )}
            <p className="text-2xl font-bold text-gray-900">Rs. {product.price}</p>
            <p className="text-sm text-gray-500">Inclusive of taxes</p>
          </div>

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex items-center space-x-3">
              <span className="text-sm text-gray-700">Select Size:</span>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-1.5 border rounded-full text-sm transition ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "hover:bg-black hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-gray-700 font-medium">Quantity</span>
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 text-lg disabled:text-gray-400"
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 mt-6">
            {isInCart ? (
              <button
                onClick={handleGoToCart}
                className="w-full border border-gray-700 py-3 rounded-md hover:bg-gray-100"
              >
                Go to Cart
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full border border-gray-700 py-3 rounded-md hover:bg-gray-100"
              >
                Add to Cart
              </button>
            )}
            <button
              onClick={handleBuyNow}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-900"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>
    </div>
  );
}
