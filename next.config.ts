import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-c4419e23-2253-4d6f-b186-d68254a100c6.space-z.ai",
    "http://127.0.0.1:3000",
  ],
};

export default nextConfig;
