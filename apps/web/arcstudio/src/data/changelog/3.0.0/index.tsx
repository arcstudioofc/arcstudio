// import Image from "next/image";
// import { useTranslations } from "next-intl";

import { ChangelogEntry } from "@/app/_components/IconTimelineItem";
import ARC from "@/components/UI/ARC";

export const changelog: ChangelogEntry = {
  title: "v3.0.0 - Reboot (Nova era!)",
  date: new Date(2025, 11, 31),
  type: "Performance",
  children: <Changelog />,
};

function Changelog() {
  // const t = useTranslations("data.changelog.3_0_0");

  return (
    <div>
      <h1 className="text-2xl font-semibold flex gap-2">
        Foi feito uma atualização geral em nosso sistema <ARC />
      </h1>
      {/* <p className="mt-4 text-justify">
        Update em desenvolvimento.
      </p>
      <Image
        src="/images/arc_banner.png"
        alt="ARC Studio Reboot"
        width={900}
        height={500}
        className="mt-6 rounded-lg shadow-lg"
      /> */}
    </div>
  );
}
