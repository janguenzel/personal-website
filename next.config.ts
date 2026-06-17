import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // GitHub avatars shown on the board.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
