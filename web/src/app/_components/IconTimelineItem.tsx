import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaShieldAlt, FaCode, FaBug, FaRocket, FaDatabase, FaUsers, FaCogs, FaPencilAlt, FaTrash } from "react-icons/fa";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip } from "@heroui/react";

import { ChangelogType } from "@/constants/changelogTypes";
import { Link } from "@/lib/i18n/navigation";

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type ChangelogCategory = { icon: React.ElementType; iconClass: string; chipColor: ChipColor };

export const ChangelogCategories: Record<string, ChangelogCategory> = {
  [ChangelogType.Security]: {
    icon: FaShieldAlt,
    iconClass: "bg-orange-600/90 text-white ring-1 ring-orange-300/50",
    chipColor: "warning",
  },
  [ChangelogType.AntiSpamSecurity]: {
    icon: FaShieldAlt,
    iconClass: "bg-orange-600/90 text-white ring-1 ring-orange-300/50",
    chipColor: "warning",
  },
  [ChangelogType.Feature]: {
    icon: FaCode,
    iconClass: "bg-blue-600/90 text-white ring-1 ring-blue-300/50",
    chipColor: "primary",
  },
  [ChangelogType.Bugfix]: {
    icon: FaBug,
    iconClass: "bg-red-600/90 text-white ring-1 ring-red-300/50",
    chipColor: "danger",
  },
  [ChangelogType.Performance]: {
    icon: FaRocket,
    iconClass: "bg-green-600/90 text-white ring-1 ring-green-300/50",
    chipColor: "success",
  },
  [ChangelogType.Database]: {
    icon: FaDatabase,
    iconClass: "bg-violet-600/90 text-white ring-1 ring-violet-300/50",
    chipColor: "secondary",
  },
  [ChangelogType.Social]: {
    icon: FaUsers,
    iconClass: "bg-pink-600/90 text-white ring-1 ring-pink-300/50",
    chipColor: "secondary",
  },
  [ChangelogType.Settings]: {
    icon: FaCogs,
    iconClass: "bg-yellow-600/90 text-white ring-1 ring-yellow-300/50",
    chipColor: "default",
  },
};

const DEFAULT_CHANGELOG_CATEGORY: ChangelogCategory = ChangelogCategories[ChangelogType.Feature];

export interface ChangelogEntry {
  _id?: string;
  title: string;
  date: Date;
  type: string;
  author?: string;
  href?: string;
  children?: React.ReactNode;
}

interface IconTimelineItemProps {
  entry: ChangelogEntry;
  isAdmin?: boolean;
  showActions?: boolean;
  onEdit?: (entry: ChangelogEntry) => void;
  onDelete?: (id: string) => void;
}

export const IconTimelineItem = ({
  entry,
  isAdmin,
  showActions,
  onEdit,
  onDelete,
}: IconTimelineItemProps) => {
  const { icon: IconComponent, iconClass, chipColor } =
    ChangelogCategories[entry.type] ?? DEFAULT_CHANGELOG_CATEGORY;
  const t = useTranslations("_components.IconTimeLineItem");
  const locale = useLocale();

  return (
    <Card
      shadow="sm"
      isHoverable
      className="group border border-foreground/10 bg-background/75 backdrop-blur-sm"
    >
      <CardHeader className="gap-3 p-4 md:p-5 items-start">
        <div
          className={`${iconClass} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm`}
        >
          <IconComponent size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {entry.href ? (
                <Link
                  href={entry.href}
                  className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  {entry.title}
                </Link>
              ) : (
                entry.title
              )}
            </h2>
            <Chip color={chipColor} variant="flat" size="sm" className="font-semibold">
              {entry.type}
            </Chip>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{t("releaseDate", { date: entry.date.toLocaleDateString(locale) })}</span>
            {entry.author ? (
              <span className="font-mono tracking-wide">{entry.author}</span>
            ) : null}
          </div>
        </div>
        
        {isAdmin && showActions ? (
          <div className="ml-auto flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
            <Button
              isIconOnly
              variant="light"
              color="primary"
              size="sm"
              onPress={() => onEdit?.(entry)}
              aria-label={t("editActionLabel")}
            >
              <FaPencilAlt size={14} />
            </Button>
            <Button
              isIconOnly
              variant="light"
              color="danger"
              size="sm"
              onPress={() => entry._id && onDelete?.(entry._id)}
              aria-label={t("deleteActionLabel")}
            >
              <FaTrash size={14} />
            </Button>
          </div>
        ) : null}
      </CardHeader>

      {entry.children ? (
        <>
          <CardBody className="pt-0 px-4 md:px-5">
            <div className="rounded-xl border border-foreground/10 bg-background/55 p-4 md:p-5">
              {entry.children}
            </div>
          </CardBody>
          <CardFooter className="pt-0 px-4 pb-4 md:px-5 md:pb-5">
            <span className="text-[11px] uppercase tracking-wide text-foreground/50">
              {t("detailLabel")}
            </span>
          </CardFooter>
        </>
      ) : null}
    </Card>
  );
};
