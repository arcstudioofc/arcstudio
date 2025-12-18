"use client";

import Image from "next/image";
import { MdTranslate } from "react-icons/md";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

import { useLocale, useTranslations, globalLocales } from "@/lib/i18n";


export default function LocaleSwitcher() {
  const t = useTranslations("lib.i18n.localeSwitcher");
  const { locale, setLocale } = useLocale();

  const getIconByLocale = (loc: string) => {
    switch (loc) {
      case "pt":
        return <Image src="/images/brazil-flag.png" width={18} height={18} alt="Brasil" />;
      case "en":
        return <Image src="/images/usa-flag.png" width={18} height={18} alt="EUA" />;
      default:
        return <MdTranslate size={20} />;
    }
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="full"
          variant="light"
          className="min-w-0 h-auto p-2 hover:bg-foreground/10 transition rounded-md"
          aria-label={t("ariaLabel")}
        >
          {getIconByLocale(locale)}
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label={t("ariaLabel")}
        onAction={(key) => setLocale(String(key))}
        selectedKeys={new Set([locale])}
        selectionMode="single"
      >
        {globalLocales.map((loc) => (
          <DropdownItem key={loc} startContent={getIconByLocale(loc)}>
            {t(`languages.${loc}`)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
