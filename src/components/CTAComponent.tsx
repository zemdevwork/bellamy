"use client";

import { Card } from "@/components/ui/card";
import { isLoggedIn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function CTAComponent() {
  return (
    <section className="page-wrap py-20">
        <Card className="w-full h-full overflow-hidden border-none shadow-xl shadow-gray-50 rounded-xl">
          <div className="grid md:grid-cols-2 gap-0 h-full">
            {/* Image Section */}
            <div className="relative h-96 md:h-[500px] lg:h-[600px] min-h-[400px]">
              <Image
                src="https://i.pinimg.com/1200x/cf/b8/e3/cfb8e32b4975021903da1bad82877ebf.jpg"
                alt="Happy kids shopping"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-center p-12 bg-gradient-to-br from-rose-100 to-pink-100">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                  Discover Joy in Every Outfit
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-lg">
                  Explore our curated collection of comfortable, stylish clothing
                  designed to keep your little ones happy and confident all day long.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <Link
                    href={isLoggedIn() ? "/shop" : "/register"}
                    className="px-8 py-3 rounded-lg text-white font-semibold text-center transition-transform hover:scale-105"
                    style={{ backgroundColor: "#8B1D3F" }}
                  >
                    {isLoggedIn() ? "Shop Now" : "Get Started"}
                  </Link>
                  <Link
                    href="/shop"
                    className="px-8 py-3 rounded-lg border-2 border-gray-900 text-gray-900 font-semibold text-center transition-transform hover:bg-gray-900 hover:text-white hover:scale-105"
                  >
                    Browse Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
    </section>
  );
}
