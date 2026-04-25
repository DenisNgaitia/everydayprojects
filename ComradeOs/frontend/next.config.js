/** @type {import('next').NextConfig} */

// Next.js PWA Configuration (requires next-pwa package in actual build)
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  output: 'export', // Required for InfinityFree static hosting
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withPWA(nextConfig);
