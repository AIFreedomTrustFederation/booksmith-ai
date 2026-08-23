import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/booksmith-ai",
        assetPrefix: "/booksmith-ai/",
      }
    : {}),
};

export default nextConfig;
