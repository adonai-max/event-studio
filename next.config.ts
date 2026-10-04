import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kpokgbtumeqcxacwxjdn.supabase.co",
      },
    ],
  },
};

export default nextConfig;
