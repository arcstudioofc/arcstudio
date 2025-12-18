// import createNextIntlPlugin from "next-intl/plugin";
import { NextConfig } from "next";
import { settings } from "@/lib";

// Aqui você indica o path para o request.ts que define locale/mensagens
// const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  async redirects() {
    return [
      {
        source: "/github",
        destination: settings.links.github,
        permanent: false,
      },
      {
        source: "/instagram",
        destination: "https://instagram.com/arcstudio.oficial",
        permanent: false,
      },
      {
        source: "/twitter",
        destination: "https://twitter.com/arcstudio_ofc",
        permanent: false,
      },
      {
        source: "/app",
        destination: settings.links.app,
        permanent: false,
      },
    ];
  },
};

// Exporta com o plugin integrado
// export default withNextIntl(nextConfig);
export default nextConfig;
