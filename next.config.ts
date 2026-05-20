import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-b61ce5a39cc042cabc94943b3c8f74b4.r2.dev",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/entreprises",
        destination: "/#services",
        permanent: true,
      },
      {
        source: "/particuliers",
        destination: "/#services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
