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

  const settings = useMemo(
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
      appendDots: (dots: React.ReactNode) => (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ul style={{ margin: 0 }}> {dots} </ul>
        </div>
      ),
      customPaging: () => (
        <div className="h-3 w-3 bg-white/70 rounded-full hover:bg-white transition-all" />
      ),
    }),
    []
  );

  return (
    <section className="relative w-full h-screen md:h-[90vh] overflow-hidden cursor-pointer">
      <Slider {...settings} className="h-full">
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-screen">
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
              className={`relative z-10 h-full flex items-center px-6 md:px-12 lg:px-24 xl:px-32 ${
                slide.align === "center"
                  ? "justify-center text-center"
                  : slide.align === "right"
                  ? "justify-end text-right"
                  : "justify-start text-left"
              }`}
            >
              <div className="max-w-3xl">
                <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight drop-shadow-2xl tracking-tight">
                  {slide.title}
                </h1>
                <p className="mt-5 md:mt-6 lg:mt-8 text-white/95 text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-2xl drop-shadow-lg font-medium leading-relaxed">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.buttonLink}
                  className="mt-8 md:mt-10 lg:mt-12 inline-flex items-center justify-center rounded-full bg-amber-300/90 hover:bg-amber-300 text-stone-900 px-8 md:px-10 lg:px-12 py-3.5 md:py-4 lg:py-5 text-base md:text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {slide.buttonLabel}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}
