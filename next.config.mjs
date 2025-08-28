/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Environment variables configuration
  env: {
    // For client-side: Always use proxy in production to avoid mixed content issues
    NEXT_PUBLIC_API_BASE_URL: process.env.NODE_ENV === 'production' 
      ? "/api/v1" 
      : (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"),
    // For server-side: Use direct AWS backend URL
    API_BASE_URL: process.env.API_BASE_URL || "https://api.personal-cfo.io",
  },
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

export default nextConfig;
