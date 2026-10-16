/** @type {import('next').NextConfig} */
const nextConfig = {
  // The PDF report library runs its own renderer, so Next.js loads it as a
  // normal Node package instead of bundling it.
  serverExternalPackages: ["@react-pdf/renderer"],
  // No floating Next.js button in the corner while developing.
  devIndicators: false,
  // Lets pages cache public data with the "use cache" directive (see src/lib/cache.js).
  cacheComponents: true,
};

export default nextConfig;
