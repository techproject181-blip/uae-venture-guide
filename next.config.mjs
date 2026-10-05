/** @type {import('next').NextConfig} */
const nextConfig = {
  // The PDF report library runs its own renderer, so Next.js loads it as a
  // normal Node package instead of bundling it.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
