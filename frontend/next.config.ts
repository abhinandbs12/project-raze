import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in a
  // parent directory (C:\Users\abhin) otherwise makes Next infer the wrong
  // root and warn on every dev/build run. Docs: turbopack.root (Next 16).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
