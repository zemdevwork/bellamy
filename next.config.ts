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
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**", // allow all images from Pinterest
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**", // allow all images from Unsplash
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**", // allow all images from Pexels
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
