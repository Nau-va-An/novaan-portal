/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'novaan-bucket-dev.s3.ap-southeast-1.amazonaws.com',
                port: '',
            },
        ],
    },
}

module.exports = nextConfig
