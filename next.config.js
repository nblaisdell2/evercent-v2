/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    YNAB_CLIENT_ID: process.env.YNAB_CLIENT_ID,
    YNAB_REDIRECT_URI: process.env.YNAB_REDIRECT_URI,
    YNAB_CLIENT_SECRET: process.env.YNAB_CLIENT_SECRET,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
  },
};

module.exports = nextConfig;
