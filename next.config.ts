import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  allowedDevOrigins: ["172.20.10.2"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
