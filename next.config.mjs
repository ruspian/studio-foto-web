/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "afndqvidelkzjtleoncp.supabase.co",
      },
    ],
  },
};

export default nextConfig;
