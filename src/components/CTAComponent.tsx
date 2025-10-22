"use client";

import { isLoggedIn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useKeenSlider, KeenSliderInstance } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect } from "react";
import { CTASlides } from "@/constants/values";

interface CTACardProps {
  image: string;
  title: string;
  subtitle: string;
  bgColor: string;
  titleColor?: string;
  priority?: boolean;
}

function CTACard({
  image,
  title,
  subtitle,
  bgColor,
  titleColor,
  priority = false,
}: CTACardProps) {
  const getTextColor = () => {
    if (titleColor) return titleColor;
    const lightBgs = ["#B8D4E8", "#FFE5D9", "#F8E8EE"];
    return lightBgs.includes(bgColor) ? "#2C3E50" : "#F5E6D3";
  };

  const getSubtitleColor = () => {
    if (titleColor) return "#5B7C99";
    const lightBgs = ["#B8D4E8", "#FFE5D9", "#F8E8EE"];
    return lightBgs.includes(bgColor) ? "#4A5568" : "#F5E6D3";
  };

  return (
    <div className="w-full flex flex-col md:flex-row rounded-xl overflow-hidden shadow-lg h-[400px] md:h-[500px]">
      {/* Image */}
      <div className="relative w-full md:w-1/2 h-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority={priority}
        />
      </div>

      {/* Banner */}
      <div
        className="flex flex-col justify-center items-start p-8 md:p-12 w-full md:w-1/2 text-left"
        style={{ backgroundColor: bgColor }}
      >
        <h2
          className="text-3xl md:text-4xl font-serif font-semibold leading-snug"
          style={{ color: getTextColor() }}
        >
          {title}
        </h2>
        <p
          className="text-xl md:text-2xl font-light italic mt-3 leading-relaxed"
          style={{ color: getSubtitleColor() }}
        >
          {subtitle}
        </p>

        <div className="w-full flex justify-center mt-6">
          <Link
            href={isLoggedIn() ? "/shop" : "/login"}
            className="px-8 py-3 rounded-full bg-white text-gray-900 font-medium text-base md:text-lg shadow hover:scale-105 transition-transform"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

// ✅ Type-safe autoplay plugin
function AutoplayPlugin(slider: KeenSliderInstance) {
  let timeout: ReturnType<typeof setTimeout>;
  let mouseOver = false;

  const clearNextTimeout = () => clearTimeout(timeout);

  const nextTimeout = () => {
    clearTimeout(timeout);
    if (mouseOver) return;
    timeout = setTimeout(() => slider.next(), 4000);
  };

  slider.on("created", () => {
    slider.container.addEventListener("mouseover", () => {
      mouseOver = true;
      clearNextTimeout();
    });
    slider.container.addEventListener("mouseout", () => {
      mouseOver = false;
      nextTimeout();
    });
    nextTimeout();
  });

  slider.on("dragStarted", clearNextTimeout);
  slider.on("animationEnded", nextTimeout);
  slider.on("updated", nextTimeout);
}

export default function CTASlider() {
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      renderMode: "performance",
      slides: {
        perView: 2,
        spacing: 20,
      },
      breakpoints: {
        "(max-width: 1024px)": {
          slides: { perView: 1 },
        },
      },
    },
    [AutoplayPlugin]
  );

  useEffect(() => {
    slider.current?.update();
  }, [slider]);

  return (
    <div className="page-wrap overflow-hidden py-3 sm:py-6 md:py-12 lg:py-16">
      <div ref={sliderRef} className="keen-slider">
        {CTASlides.map((slide, index) => (
          <div key={index} className="keen-slider__slide px-2">
            <CTACard
              image={slide.image}
              title={slide.title}
              subtitle={slide.subtitle}
              bgColor={slide.bgColor}
              titleColor={slide.titleColor}
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
