import { Metadata } from "next";
import { getTranslations } from "next-intl/server"; 

import Team from "@/_components/pages/team";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Team");

  return {
    title: t("metaTitle"), 
    description: t("metaDescription"),
  };
}

export default function HomePage() {
  return <Team />;
}