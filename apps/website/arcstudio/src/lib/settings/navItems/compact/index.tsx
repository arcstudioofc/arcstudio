import { FaGithub, FaUserShield } from "react-icons/fa6";

import { settings } from "@/lib/settings";
import { GoProjectRoadmap } from "react-icons/go";

export const itemsCompact: Record<string, NavItemBase> = {
  dashboard: {
    href: "/app",
    label: "Dashboard",
    icon: <GoProjectRoadmap className="text-lg" />,
  },
  team: {
    href: "/team",
    icon: <FaUserShield className="text-lg" />,
  },
  github: {
    href: settings.links.github,
    icon: <FaGithub className="text-lg" />,
  },
};
