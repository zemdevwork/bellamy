// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// // ✅ Replace these with your actual images
// import { BannerImages } from "@/constants/values";

// export default function Banner() {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const router = useRouter();

//   // Auto-slide every 3 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % BannerImages.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="relative bg-[#f0f7ff] flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16 lg:py-20 min-h-[80]">
//       {/* Text */}
//       <div className="max-w-xl z-10">
//         <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 mb-4 sm:mb-6">
//           Dress Your Kids <br /> In Comfort & Style
//         </h2>
//         <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
//           Discover trendy, comfy, and affordable kidswear for every occasion.
//         </p>
//         <button
//           onClick={() => router.push("/shop")}
//           className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
//         >
//           SHOP NOW
//         </button>
//       </div>

//       {/* Image Slider */}
//       <div className="flex space-x-5 mt-8 sm:mt-10 lg:mt-0 relative w-full max-w-[350px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-[800px] h-[350px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
//         {BannerImages.map((img, index) => (
//           <Image
//             key={index}
//             src={img}
//             alt={`Banner ${index + 1}`}
//             width={800}
//             height={500}
//             className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-1000 ${
//               index === currentIndex ? "opacity-100" : "opacity-0"
//             }`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BannerImages } from "@/constants/values";

export default function Banner() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const total = BannerImages.length;
  const goTo = useCallback((i: number) => setIndex((i + total) % total), [total]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay
  useEffect(() => {
    if (total <= 1) return;
    if (isHovering) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, total, isHovering]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  };

  const slides = useMemo(() => BannerImages, []);

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Slides */}
      <div
        ref={sliderRef}
        className="absolute inset-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`Banner ${i + 1}`}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Gradient overlays for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center md:justify-start">
        <div className="px-6 md:px-12 lg:px-20 max-w-3xl text-center md:text-left">
          <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight drop-shadow-md">
            Dress Your Kids In Comfort & Style
          </h1>
          <p className="mt-4 text-white/90 text-base md:text-lg max-w-2xl">
            Discover trendy, comfy, and affordable kidswear for every occasion.
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-white/90 hover:bg-white text-gray-900 px-6 py-3 text-sm md:text-base font-semibold transition-colors"
          >
            Shop now
          </button>
        </div>
      </div>

      {/* Controls */}
      {total > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M15.78 18.28a.75.75 0 01-1.06 0l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 111.06 1.06L10.56 12l5.22 5.22a.75.75 0 010 1.06z" clipRule="evenodd"/></svg>
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M8.22 5.72a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06L13.44 12 8.22 6.78a.75.75 0 010-1.06z" clipRule="evenodd"/></svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  i === index ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}


