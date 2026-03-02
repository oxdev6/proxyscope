/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Dev/prod-friendly: web calls same-origin `/api/*`, which can be
    // served by `@proxyscope/api` (port 3001) during development.
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
