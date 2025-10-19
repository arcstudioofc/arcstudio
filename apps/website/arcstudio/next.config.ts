import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/arcstudio.ofc",
        permanent: true,
      },
      {
        source: "/instagram",
        destination: "https://www.instagram.com/arcstudio.oficial/",
        permanent: false,
      },
      {
        source: "/twitter",
        destination: "https://twitter.com/arcstudio_ofc",
        permanent: false,
      },
    ];
  },

  images: {
    domains: ["cdn.discordapp.com", "picsum.photos", "wallpapers-clan.com"],
  },
};

export default nextConfig;
