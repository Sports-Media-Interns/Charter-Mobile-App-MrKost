/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Re-enable when shared packages are implemented
  // transpilePackages: ["@sportsmedia/shared", "@sportsmedia/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
