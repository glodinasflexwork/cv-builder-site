import type { NextConfig } from "next";

/**
 * Next.js configuration for the CV builder application.  This app is exported
 * as a fully static site using the `export` output mode.  The image loader is
 * set to `akamai` with an empty path so that it works on static hosts like
 * GitHub Pages【466501155991259†L319-L327】.  The `assetPrefix` and `basePath` values are
 * derived from the `BASE_PATH` environment variable, which is set by the
 * GitHub Actions workflow during deployment to prefix all assets with the
 * repository name【466501155991259†L319-L340】.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    loader: 'akamai',
    path: '',
  },
  assetPrefix: process.env.BASE_PATH || '',
  basePath: process.env.BASE_PATH || '',
  trailingSlash: true,
};

export default nextConfig;
