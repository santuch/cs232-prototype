/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.thaimissing.go.th",
                pathname: "/image/**",
            },
            {
                protocol: "http",
                hostname: "www.backtohome.org",
                pathname: "/news_bth/**",
            },
            {
                protocol: "https",
                hostname: "web.backtohome.org",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
        ],
    },
};

module.exports = nextConfig;
