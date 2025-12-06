import { useTranslations } from "next-intl";

import { ChangelogEntry } from "@/_components/IconTimelineItem";
import ARC from "@/components/UI/ARC";

export const changelog: ChangelogEntry = {
  title: "Hello World",
  date: new Date(2025, 11, 5), // O més de janeiro começa em 0, então; 11 = Dezembro (12). Year, Mouth, Day
  type: "Bugfix",
  children: <Changlelog />,
};


function Changlelog() {
  const t = useTranslations("data.changelog.test");

  return (
    <span className="flex text-2xl">
      <ARC />, {t("test")}.
    </span>
  )
}