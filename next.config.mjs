import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files :)
await jiti.import("./env/server");
await jiti.import("./env/client");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true,
  },
  transpilePackages: [
    // If you're using 'standalone' mode, you'll need to transpile the t3-oss/env packages
    // "@t3-oss/env-nextjs", "@t3-oss/env-core",
  ],
};

export default nextConfig;
