/** @type {import('next').NextConfig} */
const nextConfig = {
  // The PDF report library runs its own renderer, so Next.js loads it as a
  // normal Node package instead of bundling it.
  serverExternalPackages: ["@react-pdf/renderer"],
  // No floating Next.js button in the corner while developing.
  devIndicators: false,
  // Lets pages cache public data with the "use cache" directive (see src/lib/cache.js).
  cacheComponents: true,
  // In development, check navigations only in segments that set `instant`.
  // Signed-in and public pages read the session before drawing anything, on
  // purpose (see the `instant = false` layouts), so the default check of every
  // page would flag each one.
  experimental: { instantInsights: { validationLevel: "manual-warning" } },
};

export default nextConfig;
