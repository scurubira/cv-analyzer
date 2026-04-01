/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for Next.js 16+ when a webpack config is present alongside Turbopack
    turbopack: {},
    // Prevent Turbopack from breaking on node-native or problematic libraries like pdf-parse
    serverExternalPackages: ['pdf-parse', '@react-pdf/renderer'],
    webpack: (config, { dev }) => {
        // Only apply polling in dev mode (hot reload inside Docker)
        if (dev) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
};

export default nextConfig;
