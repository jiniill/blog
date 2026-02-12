import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "#velite": "./.velite",
    },
  },
  webpack: (config) => {
    config.resolve.alias["#velite"] = `${process.cwd()}/.velite`;
    return config;
  },
};

export default nextConfig;
