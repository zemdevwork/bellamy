"use client";

import Image from "next/image";
import Slider from "react-slick";
import Link from "next/link";
import { useMemo } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BannerImages } from "@/constants/values";

type BannerSlide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonLink: string;
  align?: "left" | "center" | "right";
};

export default function Banner() {
  const slides: BannerSlide[] = useMemo(
    () => [
      {
        id: 1,
        image: BannerImages[0],
        title: "Dress Your Little Ones in Pure Joy",
        subtitle:
          "Playful outfits for every mood — crafted for comfort, made for fun.",
        buttonLabel: "Shop Collection",
        buttonLink: "/shop",
        align: "left",
      },
      {
        id: 2,
        image: BannerImages[1],
        title: "Trendy, Comfy, and Always Adorable",
        subtitle: "Let your kids shine in every season with our stylish picks.",
        buttonLabel: "Explore New Arrivals",
        buttonLink: "/shop",
        align: "center",
      },
      {
        id: 3,
        image: BannerImages[2],
        title: "From Playtime to Partytime",
        subtitle:
          "Discover our range of quality kidswear for every joyful occasion.",
        buttonLabel: "Browse Styles",
        buttonLink: "/shop",
        align: "right",
      },
      {
        id: 4,
        image: BannerImages[3],
        title: "Everyday Comfort, Endless Smiles",
        subtitle:
          "Soft fabrics, happy colors, and joyful vibes — made for little explorers.",
        buttonLabel: "Start Shopping",
        buttonLink: "/shop",
        align: "left",
      },
      {
        id: 5,
        image: BannerImages[4],
        title: "Bright Looks for Brighter Days",
        subtitle:
          "Stylish, sustainable, and designed to keep up with their adventures.",
        buttonLabel: "Shop Now",
        buttonLink: "/shop",
        align: "center",
      },
    ],
    []
  );

  // Desktop slider settings with progress bar indicator
  const desktopSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 700,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3500,
      arrows: true,
      pauseOnHover: true,
      swipeToSlide: true,
      adaptiveHeight: false,
      cssEase: "ease-in-out",
      dotsClass: "slick-dots !flex !items-center !justify-center !gap-2 !bottom-8 !left-1/2 !-translate-x-1/2",
      appendDots: (dots: React.ReactNode) => (
        <ul className="flex items-center justify-center gap-2"> {dots} </ul>
      ),
      customPaging: () => (
        <button className="w-12 h-1 bg-white/40 rounded-full overflow-hidden hover:bg-white/60 transition-all cursor-pointer block">
          <div className="h-full bg-white rounded-full w-0 group-[.slick-active]:w-full group-[.slick-active]:animate-[progress_3.5s_linear]" />
        </button>
      ),
    }),
    []
  );

  // Mobile slider settings with modern dot indicators
  const mobileSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 600,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3500,
      arrows: false,
      pauseOnHover: true,
      swipeToSlide: true,
      adaptiveHeight: false,
      cssEase: "ease-in-out",
      dotsClass: "slick-dots !flex !items-center !justify-center !gap-1.5 !-bottom-8 !left-1/2 !-translate-x-1/2",
      appendDots: (dots: React.ReactNode) => (
        <ul className="flex items-center justify-center gap-1.5"> {dots} </ul>
      ),
      customPaging: () => (
        <button className="w-2 h-2 bg-stone-400/60 rounded-full hover:bg-stone-600 transition-all block" />
      ),
    }),
    []
  );

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* Desktop Slider */}
      <div className="hidden md:block h-full [&_.slick-prev]:!w-12 [&_.slick-prev]:!h-12 [&_.slick-prev]:!left-6 [&_.slick-prev]:!z-20 [&_.slick-next]:!w-12 [&_.slick-next]:!h-12 [&_.slick-next]:!right-6 [&_.slick-next]:!z-20 [&_.slick-prev:before]:!text-5xl [&_.slick-prev:before]:!opacity-80 [&_.slick-next:before]:!text-5xl [&_.slick-next:before]:!opacity-80 [&_.slick-prev:hover:before]:!opacity-100 [&_.slick-next:hover:before]:!opacity-100 [&_.slick-dots_li]:!w-12 [&_.slick-dots_li]:!h-1 [&_.slick-dots_li]:!m-0 [&_.slick-dots_li_button]:!w-full [&_.slick-dots_li_button]:!h-full [&_.slick-dots_li_button]:!p-0 [&_.slick-dots_li_button:before]:!hidden [&_.slick-dots_li.slick-active_button]:!bg-white">
        <Slider {...desktopSettings} className="h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative w-full h-[80vh]">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={slide.id === 1}
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,200,100,0.15),transparent_60%)]" />

              {/* Text Content */}
              <div
                className={`relative z-10 h-full flex items-center px-12 lg:px-24 xl:px-32 ${
                  slide.align === "center"
                    ? "justify-center text-center"
                    : slide.align === "right"
                    ? "justify-end text-right"
                    : "justify-start text-left"
                }`}
              >
                <div className="max-w-3xl">
                  <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-bold leading-tight drop-shadow-2xl tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-6 lg:mt-8 text-white/95 text-xl md:text-2xl lg:text-3xl max-w-2xl drop-shadow-lg font-medium leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.buttonLink}
                    className="mt-10 lg:mt-12 inline-flex items-center justify-center rounded-full bg-amber-300/90 hover:bg-amber-300 text-stone-900 px-10 lg:px-12 py-4 lg:py-5 text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {slide.buttonLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Mobile Slider */}
      <div className="block md:hidden h-full px-2 pt-2 pb-10 [&_.slick-dots_li]:!w-2 [&_.slick-dots_li]:!h-2 [&_.slick-dots_li]:!m-0 [&_.slick-dots_li_button]:!w-full [&_.slick-dots_li_button]:!h-full [&_.slick-dots_li_button]:!p-0 [&_.slick-dots_li_button:before]:!hidden [&_.slick-dots_li.slick-active_button]:!bg-stone-800 [&_.slick-dots_li.slick-active_button]:!w-5 [&_.slick-dots_li.slick-active_button]:!rounded-full [&_.slick-dots_li.slick-active_button]:!transition-all [&_.slick-dots_li.slick-active_button]:!duration-300">
        <Slider {...mobileSettings} className="h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="px-0.5">
              <div className="relative w-full h-[calc(80vh-2.5rem)] rounded-2xl overflow-hidden shadow-xl">
                {/* Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === 1}
                  className="object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Text Content */}
                <div className="relative z-10 h-full flex items-end p-4 pb-6">
                  <div className="w-full text-left">
                    <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight drop-shadow-2xl tracking-tight">
                      {slide.title}
                    </h1>
                    <p className="mt-2 text-white/95 text-base sm:text-lg drop-shadow-lg font-medium leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.buttonLink}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-amber-300/90 hover:bg-amber-300 text-stone-900 px-6 py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                    >
                      {slide.buttonLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}