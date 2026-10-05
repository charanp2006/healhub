import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Keeps Next.js from failing production builds on TS errors
    ignoreBuildErrors: true, 
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;


// import type { NextConfig } from "next";

  // const nextConfig: NextConfig = {
  //   typescript: {
  //     ignoreBuildErrors: true,
  //   },

  // export default nextConfig;
