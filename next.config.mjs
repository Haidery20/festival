/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // In development, proxy the standalone CMS app under /cms
    if (process.env.NODE_ENV === "development") {
      return [
        { source: "/cms", destination: "http://localhost:3000" },
        { source: "/cms/:path*", destination: "http://localhost:3000/:path*" },
      ]
    }
    return []
  },
}

export default nextConfig
