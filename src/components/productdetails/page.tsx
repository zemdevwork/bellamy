"use client";
import { useState } from "react";
import Image from "next/image";

const dummyImages = [
  "/kids1.png",
  "/kids2.png",
  "/kids3.png",
  "/kids4.png",
  "/kids5.png",
];

export default function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(dummyImages[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT SIDE - IMAGE GALLERY */}
        <div>
          <div className="w-full h-[500px] relative border rounded-lg overflow-hidden">
            <Image
              src={selectedImage}
              alt="Product"
              fill
              className="object-contain p-6"
            />
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex space-x-4 mt-4 overflow-x-auto">
            {dummyImages.map((img, idx) => (
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
          <p className="uppercase text-sm text-gray-500 tracking-wider">
            Bellamy Kids
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Boys Cotton Printed T-Shirt & Shorts Set – Summer Collection
          </h1>

          {/* Price */}
          <div>
            <p className="text-lg text-gray-600">MRP</p>
            <p className="text-2xl font-bold text-gray-900">Rs. 799.00</p>
            <p className="text-sm text-gray-500">Inclusive of taxes</p>
          </div>

          {/* Size Options */}
          <div className="mt-2 flex items-center space-x-3">
            <span className="text-sm text-gray-700">Select Size:</span>
            {["1-2Y", "3-4Y", "5-6Y", "7-8Y"].map((size) => (
              <button
                key={size}
                className="px-4 py-1.5 border rounded-full text-sm hover:bg-black hover:text-white"
              >
                {size}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-gray-700 font-medium">Quantity</span>
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-lg"
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
            <button className="w-full border border-gray-700 py-3 rounded-md hover:bg-gray-100">
              Add to Cart
            </button>
            <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-900">
              Buy Now
            </button>
          </div>

          {/* Payment Options */}
          <div className="flex items-center space-x-4 mt-4">
            <Image src="/visa.png" alt="Visa" width={50} height={30} />
            <Image src="/mastercard.png" alt="Mastercard" width={50} height={30} />
            <Image src="/amex.png" alt="Amex" width={50} height={30} />
            <Image src="/applepay.png" alt="ApplePay" width={50} height={30} />
            <Image src="/upi.png" alt="UPI" width={50} height={30} />
          </div>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Description</h2>
          <p className="text-gray-600 leading-relaxed">
            This stylish cotton printed t-shirt and shorts set is designed to keep 
            your little one comfortable and trendy during the summer. 
            Made with breathable fabric, it’s perfect for daily wear and outings.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>100% Pure Cotton</li>
            <li>Soft & Breathable Fabric</li>
            <li>Trendy Summer Print</li>
            <li>Available in multiple sizes</li>
          </ul>
        </div>
        <div className="h-64 overflow-y-scroll border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Fabric & Care</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Fabric: 100% Cotton <br />
            Care: Machine wash cold with like colors. Do not bleach. Tumble dry low.
          </p>
          <h3 className="font-semibold mt-4 mb-2">Why You’ll Love It</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Lightweight, breathable, and perfect for active kids. 
            The bright prints and soft fabric make it a must-have for every wardrobe.
          </p>
        </div>
      </div>
    </div>
  );
}
