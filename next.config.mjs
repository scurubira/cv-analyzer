/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, context) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        };
        return config;
    },
    experimental: {
        allowedDevOrigins: ['benstech.cloud', '*.benstech.cloud', 'localhost', '*.localhost'],
    },
};

export default nextConfig;
