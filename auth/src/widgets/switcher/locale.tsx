"use client";

import { getLocaleOptions, type LocaleOption } from "@arcstudio/i18n";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@heroui/react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

const ARIA_LABEL = "Select language";
const SEARCH_THRESHOLD = 8;
const FLAG_CODE_OFFSET = 127397;
const FALLBACK_LOCALE_OPTIONS: LocaleOption[] = routing.locales.map(
  (value) => ({
    value,
    label: value,
  }),
);

function formatLocaleCode(locale: string): string {
  return locale.trim().replace(/_/g, "-").toUpperCase();
}

function extractRegion(locale: string): string | null {
  const normalizedLocale = locale.trim().toLowerCase().replace(/_/g, "-");
  if (normalizedLocale === "") return null;

  const parts = normalizedLocale.split("-").filter(Boolean);
  if (parts.length < 2) return null;

  for (let index = parts.length - 1; index >= 1; index -= 1) {
    const part = parts[index];
    if (/^[a-z]{2}$/.test(part)) return part;
  }

  return null;
}

function regionToFlagEmoji(region: string): string | null {
  if (!/^[a-z]{2}$/i.test(region)) return null;

  const codepoints = region
    .toUpperCase()
    .split("")
    .map((char) => FLAG_CODE_OFFSET + char.charCodeAt(0));

  return String.fromCodePoint(...codepoints);
}

function getLocaleFlag(locale: string): string {
  const region = extractRegion(locale);
  if (!region) return "🌐";
  return regionToFlagEmoji(region) ?? "🌐";
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function LocaleSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [localeOptions, setLocaleOptions] = useState<LocaleOption[]>(
    FALLBACK_LOCALE_OPTIONS,
  );
  const [searchValue, setSearchValue] = useState("");

  const selectedLocaleOption = useMemo(
    () => localeOptions.find((loc) => loc.value === locale),
    [locale, localeOptions],
  );
  const selectedLocaleLabel = selectedLocaleOption?.label ?? locale;
  const selectedLocaleFlag = getLocaleFlag(
    selectedLocaleOption?.value ?? locale,
  );
  const selectedLocaleCode = formatLocaleCode(locale);
  const shouldShowSearch = localeOptions.length > SEARCH_THRESHOLD;
  const filteredLocaleOptions = useMemo(() => {
    if (!shouldShowSearch) return localeOptions;

    const normalizedSearch = normalizeForSearch(searchValue);
    if (normalizedSearch === "") return localeOptions;

    return localeOptions.filter((option) => {
      const normalizedLabel = normalizeForSearch(option.label);
      const normalizedValue = normalizeForSearch(option.value);
      const normalizedCode = normalizeForSearch(formatLocaleCode(option.value));

      return (
        normalizedLabel.includes(normalizedSearch) ||
        normalizedValue.includes(normalizedSearch) ||
        normalizedCode.includes(normalizedSearch)
      );
    });
  }, [localeOptions, searchValue, shouldShowSearch]);

  useEffect(() => {
    let active = true;

    getLocaleOptions(routing.locales)
      .then((options) => {
        if (!active) return;
        setLocaleOptions(options);
      })
      .catch(() => {
        if (!active) return;
        setLocaleOptions(FALLBACK_LOCALE_OPTIONS);
      });

    return () => {
      active = false;
    };
  }, []);

  function handlerSelectLocale(newLocale: (typeof routing.locales)[number]) {
    setSearchValue("");

    const query = Object.fromEntries(
      new URLSearchParams(window.location.search),
    );

    router.replace({ pathname, query }, { locale: newLocale });
  }

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
          radius="full"
          variant="light"
          className={`h-10 min-w-[190px] max-w-[280px] justify-between rounded-full border border-foreground/15 bg-background/70 px-2.5 text-sm shadow-sm backdrop-blur-md transition data-[hover=true]:border-primary/40 data-[hover=true]:bg-background/95 data-[hover=true]:shadow-md data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary/30 ${
            isOpen
              ? "border-primary/45 bg-background/95 shadow-md ring-2 ring-primary/20"
              : ""
          }`}
          aria-label={ARIA_LABEL}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-base leading-none">
              {selectedLocaleFlag}
            </span>

            <span className="truncate text-left font-semibold text-foreground/90">
              {selectedLocaleLabel}
            </span>
          </div>

          <div className="ml-2 flex shrink-0 items-center">
            <Chip
              size="sm"
              radius="sm"
              variant="flat"
              className="h-6 border border-primary/20 bg-primary/10 px-2 text-[10px] font-semibold uppercase tracking-widest text-primary/90"
            >
              {selectedLocaleCode}
            </Chip>
          </div>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label={ARIA_LABEL}
        onAction={(key) =>
          handlerSelectLocale(String(key) as (typeof routing.locales)[number])
        }
        selectedKeys={new Set([locale])}
        selectionMode="single"
        disallowEmptySelection
        hideSelectedIcon
        topContent={
          shouldShowSearch ? (
            <div className="px-2 pt-2 pb-1">
              <Input
                aria-label="Search languages"
                placeholder="Search languages"
                size="sm"
                variant="faded"
                value={searchValue}
                onValueChange={setSearchValue}
                startContent={
                  <FiSearch
                    aria-hidden
                    className="text-foreground/50"
                    size={14}
                  />
                }
                classNames={{
                  base: "w-full",
                  inputWrapper:
                    "border-foreground/15 bg-background/65 transition data-[hover=true]:border-primary/30 group-data-[focus=true]:border-primary/50",
                  input: "text-sm text-foreground/90",
                }}
              />
            </div>
          ) : undefined
        }
        emptyContent={
          shouldShowSearch && searchValue.trim() !== ""
            ? "No languages found."
            : "No languages available."
        }
        classNames={{
          base: "min-w-[270px] rounded-2xl p-1",
          list: "gap-1 px-1 pb-1",
        }}
      >
        {filteredLocaleOptions.map((loc) => {
          const isSelected = loc.value === locale;
          const localeCode = formatLocaleCode(loc.value);

          return (
            <DropdownItem
              key={loc.value}
              textValue={`${loc.label} ${loc.value}`}
              className="rounded-xl px-2 py-1.5 transition data-[hover=true]:bg-primary/10 data-[selected=true]:bg-primary/15"
              startContent={
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground/5 text-base leading-none">
                  {getLocaleFlag(loc.value)}
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
                    {localeCode}
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
              <div className="flex min-w-0">
                <span
                  className={
                    isSelected
                      ? "truncate text-sm font-semibold text-primary"
                      : "truncate text-sm font-medium text-foreground/85"
                  }
                >
                  {loc.label}
                </span>
              </div>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
