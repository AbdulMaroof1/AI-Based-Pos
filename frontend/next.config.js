/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
    TENANT_SERVICE_URL: process.env.TENANT_SERVICE_URL || 'http://localhost:3001',
    MODULE_ACCESS_SERVICE_URL: process.env.MODULE_ACCESS_SERVICE_URL || 'http://localhost:3002',
    POS_SERVICE_URL: process.env.POS_SERVICE_URL || 'http://localhost:3003',
  },
}

module.exports = nextConfig

