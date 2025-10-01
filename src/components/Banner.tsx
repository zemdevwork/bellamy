"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { BannerImages } from "@/constants/values";
import Link from "next/link";

export default function Banner() {
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
    const id = setInterval(next, 3000);
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

      {/* Gradient overlays for readability with warm brand vibe */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,114,182,0.15),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center md:justify-start">
        <div className="px-6 md:px-12 lg:px-20 xl:px-24 max-w-4xl text-center md:text-left">
          <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight drop-shadow-2xl tracking-tight">
            Dress Your Kids In Comfort & Style
          </h1>
          <p className="mt-5 md:mt-6 lg:mt-8 text-white/95 text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-2xl drop-shadow-lg font-medium leading-relaxed">
            Discover trendy, comfy, and affordable kidswear for every occasion.
          </p>
          <Link
            href="/shop"
            className="mt-8 md:mt-10 lg:mt-12 inline-flex items-center justify-center rounded-full bg-amber-200/90 hover:bg-amber-200 text-stone-900 px-8 md:px-10 lg:px-12 py-3.5 md:py-4 lg:py-5 text-base md:text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Shop now
          </Link>
        </div>
      </div>

      {/* Controls */}
      {total > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-3 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10 h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 md:h-6 md:w-6">
              <path fillRule="evenodd" d="M15.78 18.28a.75.75 0 01-1.06 0l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 111.06 1.06L10.56 12l5.22 5.22a.75.75 0 010 1.06z" clipRule="evenodd"/>
            </svg>
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-3 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-10 h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 md:h-6 md:w-6">
              <path fillRule="evenodd" d="M8.22 5.72a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06L13.44 12 8.22 6.78a.75.75 0 010-1.06z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 md:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2 md:gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 md:h-3 w-2.5 md:w-3 rounded-full transition-all ${
                  i === index ? "bg-white w-6 md:w-8" : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}