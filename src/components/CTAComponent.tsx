"use client";

import { isLoggedIn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
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
  // Determine text color based on background for better visibility
  const getTextColor = () => {
    if (titleColor) return titleColor;
    // Light backgrounds get dark text, dark backgrounds get light text
    const lightBgs = ["#B8D4E8", "#FFE5D9", "#F8E8EE"];
    return lightBgs.includes(bgColor) ? "#2C3E50" : "#F5E6D3";
  };

  const getSubtitleColor = () => {
    // If custom titleColor exists, use a complementary color
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

        {/* Centered Button */}
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

export default function CTASlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2, // 1 card on mobile
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024, // lg breakpoint
        settings: {
          slidesToShow: 1, // 2 cards on larger screens
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="page-wrap overflow-hidden py-3 sm:py-6 md:py-12 lg:py-16">
      <Slider {...settings}>
        {CTASlides.map((slide, index) => (
          <div key={index} className="px-2">
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
      </Slider>
    </div>
  );
}