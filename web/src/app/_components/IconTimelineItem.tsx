import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaShieldAlt, FaCode, FaBug, FaRocket, FaDatabase, FaUsers, FaCogs, FaPencilAlt, FaTrash } from "react-icons/fa";

import { ChangelogType } from "@/constants/changelogTypes";

export const ChangelogCategories: Record<
  ChangelogType,
  { icon: React.ElementType; style: string }
> = {
  [ChangelogType.Security]: {
    icon: FaShieldAlt,
    style: "bg-orange-600 text-white",
  },
  [ChangelogType.AntiSpamSecurity]: {
    icon: FaShieldAlt,
    style: "bg-orange-600 text-white",
  },
  [ChangelogType.Feature]: {
    icon: FaCode,
    style: "bg-blue-600 text-white",
  },
  [ChangelogType.Bugfix]: {
    icon: FaBug,
    style: "bg-red-600 text-white",
  },
  [ChangelogType.Performance]: {
    icon: FaRocket,
    style: "bg-green-600 text-white",
  },
  [ChangelogType.Database]: {
    icon: FaDatabase,
    style: "bg-purple-600 text-white",
  },
  [ChangelogType.Social]: {
    icon: FaUsers,
    style: "bg-pink-600 text-white",
  },
  [ChangelogType.Settings]: {
    icon: FaCogs,
    style: "bg-yellow-600 text-white",
  },
};


export interface ChangelogEntry {
  _id?: string;
  title: string;
  date: Date;
  type: ChangelogType;
  children: React.ReactNode;
}

interface IconTimelineItemProps {
  entry: ChangelogEntry;
  isAdmin?: boolean;
  showActions?: boolean;
  onEdit?: (entry: ChangelogEntry) => void;
  onDelete?: (id: string) => void;
}

export const IconTimelineItem = ({ entry, isAdmin, showActions, onEdit, onDelete }: IconTimelineItemProps) => {
  const { icon: IconComponent, style: tagStyle } = ChangelogCategories[entry.type];
  const t = useTranslations("_components.IconTimeLineItem");
  const locale = useLocale();

  return (
    <div className="flex gap-4 md:gap-6 group relative">
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
          
          {isAdmin && showActions && (
            <div className="flex gap-2 ml-auto animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => onEdit?.(entry)}
                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-full transition-colors"
                title="Editar"
              >
                <FaPencilAlt size={14} />
              </button>
              <button 
                onClick={() => entry._id && onDelete?.(entry._id)}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-full transition-colors"
                title="Deletar"
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}
        </div>

        <div>{entry.children}</div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('releaseDate', { date: entry.date.toLocaleDateString(locale) })}
        </div>
      </div>
    </div>
  );
};
