import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  allowedDevOrigins: ["172.20.10.2", "192.168.1.104"],
  outputFileTracingIncludes: {
    "/api/generate/pcf": [
      "./public/data/sample_pcf_iso_14067.csv",
      "./public/branding/relats-logo.svg",
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
