"use client";

import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiMoon, FiSun } from "react-icons/fi";
import { LuMonitor } from "react-icons/lu";

interface ThemeSwitcherProps {
  isElectronHeader?: boolean;
}

const ARIA_LABEL = "Select theme";

const THEME_OPTIONS = [
  {
    key: "light",
    label: "Claro",
    badge: "LGT",
    icon: FiSun,
  },
  {
    key: "dark",
    label: "Escuro",
    badge: "DRK",
    icon: FiMoon,
  },
  {
    key: "system",
    label: "Sistema",
    badge: "AUTO",
    icon: LuMonitor,
  },
] as const;

type ThemeOption = (typeof THEME_OPTIONS)[number];
type ThemeKey = ThemeOption["key"];

export default function ThemeSwitcher({ isElectronHeader = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMounted(true);
      setIsElectron(Boolean(window.windowControls));
    }, 0);

    return () => clearTimeout(id);
  }, []);

  const selectedTheme = useMemo<ThemeKey>(() => {
    if (theme === "light" || theme === "dark" || theme === "system") {
      return theme;
    }

    return "system";
  }, [theme]);

  const selectedThemeOption = useMemo(
    () =>
      THEME_OPTIONS.find((option) => option.key === selectedTheme) ??
      THEME_OPTIONS[2],
    [selectedTheme],
  );

  if (!mounted) return null;

  // Se estiver no Electron e este for o switcher padrão (não do header), não renderiza.
  if (isElectron && !isElectronHeader) {
    return null;
  }

  // Se NÃO estiver no Electron e este for o switcher do Header, não renderiza.
  if (!isElectron && isElectronHeader) {
    return null;
  }

  const iconVariants = {
    initial: { rotate: -90, opacity: 0, scale: 0.8 },
    animate: { rotate: 0, opacity: 1, scale: 1 },
    exit: { rotate: 90, opacity: 0, scale: 0.8 },
    transition: { stiffness: 250, damping: 15 },
  };

  const renderIcon = () => {
    const size = isElectronHeader ? 18 : 20;
    const SelectedIcon = selectedThemeOption.icon;
    return <SelectedIcon size={size} />;
  };

  return (
    <Dropdown
      placement="bottom-end"
      backdrop="blur"
      shouldBlockScroll={false}
      onOpenChange={setIsOpen}
      classNames={{
        backdrop:
          "bg-gradient-to-br from-background/25 via-background/45 to-primary/20 backdrop-blur-[3px]",
        content:
          "overflow-hidden rounded-2xl border border-foreground/15 bg-background/85 p-0 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl",
      }}
      motionProps={{
        variants: {
          enter: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1],
            },
          },
          exit: {
            opacity: 0,
            y: -8,
            scale: 0.98,
            transition: {
              duration: 0.12,
              ease: [0.4, 0, 1, 1],
            },
          },
        },
      }}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="full"
          variant="light"
          aria-label={ARIA_LABEL}
          className={`min-w-0 rounded-full border border-foreground/15 bg-background/70 shadow-sm backdrop-blur-md transition data-[hover=true]:border-primary/40 data-[hover=true]:bg-background/95 data-[hover=true]:shadow-md data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary/30 ${
            isElectronHeader ? "h-8 w-8 p-0" : "h-10 w-10 p-0"
          } ${
            isOpen
              ? "border-primary/45 bg-background/95 shadow-md ring-2 ring-primary/20"
              : ""
          }`}
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
        aria-label={ARIA_LABEL}
        onAction={(key) => setTheme(String(key))}
        selectedKeys={new Set([selectedTheme])}
        selectionMode="single"
        disallowEmptySelection
        hideSelectedIcon
        classNames={{
          base: "min-w-[210px] rounded-2xl p-1",
          list: "gap-1 px-1 pb-1",
        }}
      >
        {THEME_OPTIONS.map((option) => {
          const isSelected = option.key === selectedTheme;
          const Icon = option.icon;

          return (
            <DropdownItem
              key={option.key}
              textValue={option.label}
              className="rounded-xl px-2 py-1.5 transition data-[hover=true]:bg-primary/10 data-[selected=true]:bg-primary/15"
              startContent={
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground/5 text-foreground/80">
                  <Icon size={16} />
                </span>
              }
              endContent={
                <div className="ml-2 flex items-center gap-1.5">
                  <Chip
                    size="sm"
                    radius="sm"
                    variant={isSelected ? "flat" : "bordered"}
                    className={
                      isSelected
                        ? "h-6 border border-primary/20 bg-primary/10 px-2 text-[10px] font-semibold uppercase tracking-widest text-primary/90"
                        : "h-6 border border-foreground/15 bg-background/60 px-2 text-[10px] font-semibold uppercase tracking-widest text-foreground/65"
                    }
                  >
                    {option.badge}
                  </Chip>
                  <span
                    className={
                      isSelected
                        ? "text-primary transition-opacity"
                        : "pointer-events-none opacity-0 transition-opacity"
                    }
                  >
                    <FiCheck aria-hidden size={14} />
                  </span>
                </div>
              }
            >
              <span
                className={
                  isSelected
                    ? "truncate text-sm font-semibold text-primary"
                    : "truncate text-sm font-medium text-foreground/85"
                }
              >
                {option.label}
              </span>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
