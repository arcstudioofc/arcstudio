import { FaGithub, FaUserShield } from "react-icons/fa";

import { settings } from "@/lib/settings";
import { GoProjectRoadmap } from "react-icons/go";

export const itemsNotCompact: Record<string, NavItem> = {
  dashboard: {
    href: "/app",
    label: "Dashboard",
    // position: "left",
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
