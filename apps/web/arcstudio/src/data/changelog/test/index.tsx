import { useTranslations } from "next-intl";

import { ChangelogEntry } from "@/_components/IconTimelineItem";
import ARC from "@/components/UI/ARC";

export const changelog: ChangelogEntry = {
  title: "Hello World",
  date: "05/12/2025",
  type: "Bug",
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