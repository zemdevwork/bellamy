"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ✅ Replace these with your actual images
import { BannerImages } from "@/constants/values";

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#f0f7ff] flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16 lg:py-20 min-h-[80]">
      {/* Text */}
      <div className="max-w-xl z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 mb-4 sm:mb-6">
          Dress Your Kids <br /> In Comfort & Style
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
          Discover trendy, comfy, and affordable kidswear for every occasion.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          SHOP NOW
        </button>
      </div>

      {/* Image Slider */}
      <div className="flex space-x-5 mt-8 sm:mt-10 lg:mt-0 relative w-full max-w-[350px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-[800px] h-[350px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
        {BannerImages.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`Banner ${index + 1}`}
            width={800}
            height={500}
            className={`absolute inset-0 w-full h-full object-contain rounded-lg transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </section>
  );
}