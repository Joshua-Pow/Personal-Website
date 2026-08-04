import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Phone / LAN testing hits the dev server by IP; without this, Next 16 blocks
  // /_next/* chunks (403) so the page shell SSR's but client Motion stays at opacity 0.
  allowedDevOrigins: ["192.168.*.*"],
  experimental: {
    optimizePackageImports: ["motion", "@base-ui/react", "swr"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
    ],
  },
};

initOpenNextCloudflareForDev();

export default withBundleAnalyzer(nextConfig);
