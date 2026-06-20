/**
 * The repo deploys every app to a GitHub Pages subpath
 * (https://yuratadevosyan.github.io/three-js-and-animations/<app>/).
 * Next.js doesn't do that out of the box, so we statically export and prefix
 * every asset/route with the subpath in production. Locally everything stays
 * at the root so `next dev` just works.
 */
const REPO = 'three-js-and-animations';
const APP = 'cyber-portfolio';

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? `/${REPO}/${APP}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  // Static export has no Image Optimization server.
  images: { unoptimized: true },
  // Don't let lint style nits block the static export; types are still checked.
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
