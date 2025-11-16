/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/cms",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
