import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // jose (JWT) est publi� en ESM uniquement : transpil� pour Jest via next/jest
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
