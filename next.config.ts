import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.gamemonetize.com",
      },
    ],
  },
};

export default nextConfig;
