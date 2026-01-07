"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

import { MdTranslate } from "react-icons/md";

interface LocaleSwitcherProps {
  isElectronHeader?: boolean;
}

export default function LocaleSwitcher({ isElectronHeader = false }: LocaleSwitcherProps) {
  const t = useTranslations("lib.i18n.localeSwitcher");
  const [isElectron, setIsElectron] = useState(false);

  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && !!window.windowControls) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsElectron(true);
    }
  }, []);

  // Se estiver no Electron e este for o switcher da Navbar, não renderiza
  if (isElectron && !isElectronHeader && !pathname.includes('admin')) {
    // Nota: Mantemos no admin ou se explicitamente solicitado
    // Mas o pedido do usuário é: "no site se mantem no navbar no electron some e vai pro header"
    return null;
  }

  // Se NÃO estiver no Electron e este for o switcher do Header, não renderiza
  if (!isElectron && isElectronHeader) {
    return null;
  }

  function handlerSelectLocale(newLocale: (typeof routing.locales)[number]) {
    const query = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );

    router.replace({ pathname, query }, { locale: newLocale });
  }

  const getIconByLocale = (loc: string) => {
    switch (loc) {
      case "pt-br":
        return <Image src="/images/brazil-flag.png" width={18} height={18} alt="Brasil" />;
      case "en-us":
        return <Image src="/images/usa-flag.png" width={18} height={18} alt="EUA" />;
      case "es-es":
        return <Image src="/images/spanish-flag.png" width={18} height={18} alt="Espanha" />;
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
          className={`min-w-0 h-auto p-2 hover:bg-foreground/10 transition rounded-md ${isElectronHeader ? 'w-8 h-8' : ''}`}
          aria-label={t("ariaLabel")}
        >
          <MdTranslate size={isElectronHeader ? 18 : 24} />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label={t("ariaLabel")}
        onAction={(key) =>
          handlerSelectLocale(String(key) as (typeof routing.locales)[number])
        }
        selectedKeys={new Set([locale])}
        selectionMode="single"
      >
        {routing.locales.map((loc) => (
          <DropdownItem
            key={loc}
            startContent={getIconByLocale(loc)}
          >
            {t(`languages.${loc}`)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
