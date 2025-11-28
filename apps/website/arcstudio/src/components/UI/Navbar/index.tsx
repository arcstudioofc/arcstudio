import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FaBars, FaTimes, FaFire, FaDonate, FaInfoCircle } from "react-icons/fa";
import { IconType } from "react-icons";

import LocaleSwitcher from "@/components/UI/switcher/locale";

type NavLink = { key: string; href: string; icon: IconType };

const navLinks: NavLink[] = [
  { key: "changelog", href: "/changelog", icon: FaFire },
  { key: "pricing", href: "/pricing", icon: FaDonate },
  { key: "about", href: "/about", icon: FaInfoCircle },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("components.UI.Navbar");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
          <Image
            src="/favicon.ico"
            alt="Logo ARC Studio"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-xl font-bold text-foreground tracking-tight">
            ARC Studio
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="group relative text-sm font-medium text-foreground/70 hover:text-primary/80 py-1 px-1 rounded-md transition-colors flex items-center space-x-2"
            >

              <link.icon className="h-4 w-4" />
              <span>{t(`links.${link.key}`)}</span>
              <span className="absolute bottom-0 left-0 right-0 h-[1px] w-0 bg-primary/80 transition-all duration-300 group-hover:w-full"></span>

            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">

          <div className="hidden md:flex items-center space-x-4">

            <Link
              href="/app"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-md"
            >
              {t("buttons.start")}
            </Link>
            <LocaleSwitcher />
          </div>


          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label={t("ariaLabels.toggleMenu")}
          >
            {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden absolute w-full bg-background border-t border-foreground/10 transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 overflow-hidden"
          }`}
      >
        <div className="flex flex-col space-y-3 px-6 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="group relative text-sm font-medium text-foreground/70 hover:text-primary/80 py-1 px-1 rounded-md transition-colors flex items-center space-x-2"
            >

              <link.icon className="h-4 w-4" />
              <span>{t(`links.${link.key}`)}</span>
              <span className="absolute bottom-0 left-0 right-0 h-[1px] w-0 bg-primary/80 transition-all duration-300 group-hover:w-full"></span>

            </Link>
          ))}

          <div className="h-px w-full bg-foreground/10 my-2" />

          <Link
            href="/app"
            onClick={toggleMenu}
            className="w-full text-center px-4 py-2 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-md"
          >
            {t("buttons.start")}
          </Link>

          <div className="flex justify-start space-x-4 pt-2">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}