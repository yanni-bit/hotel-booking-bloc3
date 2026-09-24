import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // jose (JWT) est publié en ESM uniquement : transpilé pour Jest via next/jest
  transpilePackages: ["jose"],
  // Next.js 15 diffuse la metadata en fin de document sur les pages dynamiques.
  // Les pages de recherche dépendent de searchParams : leur <title> arrivait
  // après </main> au lieu du <head>. On rétablit une metadata bloquante.
  htmlLimitedBots: /.*/,
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
