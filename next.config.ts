import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    // standalone 모드 사용 시 도커 이미지 크기를 획기적으로 줄여줍니다.
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            }
        ],
    },
};

export default nextConfig;
