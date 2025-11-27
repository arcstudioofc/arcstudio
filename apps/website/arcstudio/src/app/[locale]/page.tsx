import { Metadata } from "next";
import { getTranslations } from "next-intl/server"; 

import Home from "@/components/pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home");

  return {
    title: t("metaTitle"), 
    description: t("metaDescription"),
  };
}

export default function HomePage() {
  return <Home />;
}