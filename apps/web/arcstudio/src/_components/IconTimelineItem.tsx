import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaShieldAlt, FaCode, FaBug, FaRocket, FaDatabase, FaUsers, FaCogs } from "react-icons/fa";

const Categories = {
  Security: { icon: FaShieldAlt, style: "bg-orange-600 text-white" },
  "Anti-Spam Security": { icon: FaShieldAlt, style: "bg-orange-600 text-white" },
  Feature: { icon: FaCode, style: "bg-blue-600 text-white" },
  Bugfix: { icon: FaBug, style: "bg-red-600 text-white" },
  Performance: { icon: FaRocket, style: "bg-green-600 text-white" },
  Database: { icon: FaDatabase, style: "bg-purple-600 text-white" },
  Social: { icon: FaUsers, style: "bg-pink-600 text-white" },
  Settings: { icon: FaCogs, style: "bg-yellow-600 text-white" },
};

export interface ChangelogEntry {
  title: string;
  date: Date;
  type: keyof typeof Categories;
  children: React.ReactNode;
}

interface IconTimelineItemProps {
  entry: ChangelogEntry;
}

export const IconTimelineItem = ({ entry }: IconTimelineItemProps) => {
  const { icon: IconComponent, style: tagStyle } = Categories[entry.type];
  const t = useTranslations("_components.IconTimeLineItem");
  const locale = useLocale();

  return (
    <div className="flex gap-4 md:gap-6">
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        {IconComponent && (
          <div className={`${tagStyle} p-3 rounded-full shadow-lg text-white`}>
            <IconComponent size={24} />
          </div>
        )}
        <div className="w-0.5 bg-gray-300 dark:bg-gray-700 flex-grow mt-2" />
      </div>

      <div className="flex flex-col flex-grow pb-8">
        <div className="mb-2 flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{entry.title}</h2>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagStyle}`}>
            {entry.type}
          </div>
        </div>

        <div>{entry.children}</div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('releaseDate', { date: entry.date.toLocaleDateString(locale) })}
        </div>
      </div>
    </div>
  );
};
