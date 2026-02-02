"use client";

import { useTheme } from "next-themes";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { LuMonitor } from "react-icons/lu";
import { useEffect, useState } from "react";

interface ThemeSwitcherProps {
  isElectronHeader?: boolean;
}

export default function ThemeSwitcher({ isElectronHeader = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    if (typeof window !== "undefined" && !!window.windowControls) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsElectron(true);
    }
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return null;

  // Se estiver no Electron e este for o switcher padrão (não do header), não renderiza
  if (isElectron && !isElectronHeader) {
    return null;
  }

  // Se NÃO estiver no Electron e este for o switcher do Header, não renderiza
  if (!isElectron && isElectronHeader) {
    return null;
  }

  const isDark = theme === "dark";
  const isSystem = theme === "system";

  const iconVariants = {
    initial: { rotate: -90, opacity: 0, scale: 0.8 },
    animate: { rotate: 0, opacity: 1, scale: 1 },
    exit: { rotate: 90, opacity: 0, scale: 0.8 },
    transition: { stiffness: 250, damping: 15 },
  };

  const renderIcon = () => {
    const size = isElectronHeader ? 18 : 20;
    if (isSystem) return <LuMonitor size={size} />;
    return isDark ? <FiSun size={size} /> : <FiMoon size={size} />;
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="full"
          variant="light"
          className={`min-w-0 h-auto p-2 hover:bg-foreground/10 transition rounded-md ${isElectronHeader ? 'w-8 h-8' : ''}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={iconVariants.initial}
              animate={iconVariants.animate}
              exit={iconVariants.exit}
              transition={iconVariants.transition}
            >
              {renderIcon()}
            </motion.span>
          </AnimatePresence>
        </Button>
      </DropdownTrigger>

      <DropdownMenu 
        onAction={(key) => setTheme(String(key))}
        selectedKeys={new Set([theme || "system"])}
        selectionMode="single"
      >
        <DropdownItem key="light" startContent={<FiSun />}>
          Claro
        </DropdownItem>

        <DropdownItem key="dark" startContent={<FiMoon />}>
          Escuro
        </DropdownItem>

        <DropdownItem key="system" startContent={<LuMonitor />}>
          Sistema
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
