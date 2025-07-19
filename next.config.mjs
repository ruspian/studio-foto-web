/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zfzgkuuns1nrwpm9.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
