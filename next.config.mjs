/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.medigas.co.id",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    API_SOURCE: process.env.NEXT_PUBLIC_API_URL,
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/fastpec/:path*",
  //       destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
  //     },
  //   ];
  // },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
