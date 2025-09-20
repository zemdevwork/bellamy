import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // allow all images from Cloudinary
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },{
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_URL as string,
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
