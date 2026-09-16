import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // jose (JWT) est publié en ESM uniquement : transpilé pour Jest via next/jest
  transpilePackages: ["jose"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;