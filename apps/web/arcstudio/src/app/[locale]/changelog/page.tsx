import { FaCalendarAlt } from "react-icons/fa";
import { useTranslations } from "next-intl";
// import Link from "next/link";

import { IconTimelineItem } from "@/_components/IconTimelineItem";
import { sortedChangelogs } from "@/data/changelog";


/** 
 * O layout principal da página de changelog foi inspirado no design de:
 * @copyright https://nexdev.social/changelog/
 * @author NexDev Social
 * @description Ele me permitiu usar o layout dele com inspiração para criar o meu próprio.
*/

export default function ChangelogPage() {
  const t = useTranslations("Changelog");


  return (
    <div className="min-h-screen p-6 md:p-10 relative">
      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-10">
          <div className="bg-primary p-4 rounded-2xl flex items-center justify-center shadow-lg text-white">
            <FaCalendarAlt size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold">{t("title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {sortedChangelogs.map((entry) => (
            <div id={entry.title.replace(/\s+/g, "-").toLowerCase()} key={entry.title}>
              <IconTimelineItem entry={entry} />
            </div>
          ))}
        </div>
      </div>

      {/* On This Page fixo à direita */}
      {/* <div className="hidden lg:block fixed top-32 right-10 w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">On This Page</h2>
        <ul className="space-y-2">
          {sortedChangelogs.map((entry) => (
            <li key={entry.title}>
              <Link
                href={`#${entry.title.replace(/\s+/g, "-").toLowerCase()}`}
                className="hover:underline"
              >
                {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
