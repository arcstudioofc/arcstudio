import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaGithub, FaEnvelope, FaInstagram, FaCube, FaBuilding } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IconType } from "react-icons";

import ThemeSwitcher from "@/components/UI/switcher/theme";
import LocaleSwitcher from "@/components/UI/switcher/locale";
import { settings } from "@/lib";
import ARC from "@/components/UI/ARC";


type FooterLink = { key: string; href: string; new?: boolean; isDisabled?: boolean };
type FooterSection = { key: string; icon: IconType; links: FooterLink[] };

const footerSections: FooterSection[] = [
  {
    key: "product",
    icon: FaCube,
    links: [
      { key: "app", href: "/app" },
      { key: "pricing", href: "/pricing" },
      { key: "changelog", href: "/changelog", new: true },
    ],
  },
  {
    key: "company",
    icon: FaBuilding,
    links: [
      { key: "about", href: "/about" },
      { key: "team", href: "/team" },
      { key: "contact", href: "mailto:" + settings.email },
    ],
  },
  {
    key: "support",
    icon: FaEnvelope,
    links: [
      { key: "faq", href: "/faq" },
      { key: "docs", href: "/docs", isDisabled: true },
      { key: "terms", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { icon: FaGithub, href: "/github", label: "GitHub" },
  { icon: FaInstagram, href: settings.links.instagram, label: "Instagram" },
  { icon: FaXTwitter, href: settings.links.twitter, label: "Twitter (X)" },
  { icon: FaEnvelope, href: "mailto:" + settings.email, label: "Email" },
];

export function Footer() {
  const t = useTranslations("components.UI.Footer");

  return (
    <footer className="w-full bg-background pt-12 pb-6 border-t border-foreground/10 text-foreground/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10">

          <div className="col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center">
              <ARC />
              <span className="text-xl font-bold text-foreground">, Inc.</span>
            </div>

            <p className="text-sm">
              {t("copyright.developedBy")} <Link className="hover:underline" href={"https://github.com/yeytaken"}>Israel R. Jatobá</Link>
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} ARC Studio. {t("copyright.rightsReserved")}
            </p>

            <div className="flex space-x-4 mt-4">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-primary transition-colors"
                  aria-label={item.label}
                >
                  <item.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.key} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center space-x-2">
                {section.icon && (
                  <section.icon className="w-4 h-4 text-foreground" />
                )}
                <span>{t(`${section.key}.title`)}</span>
              </h3>

              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.key} className="flex items-center space-x-2">
                    {(link.isDisabled ? (
                      <span
                        className="text-sm text-foreground/40 cursor-not-allowed"
                      >
                        {t(`${section.key}.links.${link.key}`)}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className={`text-sm hover:text-foreground hover:underline transition-colors`}
                        target={link.href.startsWith("http") || link.href.startsWith("mailto:") ? "_blank" : "_self"}
                      >
                        {t(`${section.key}.links.${link.key}`)}
                      </Link>
                    ))}

                    {link.new && (
                      <span className="text-xs font-extrabold bg-primary/20 text-primary py-1 px-1 rounded-md uppercase tracking-widest leading-none">
                        NEW
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-foreground/60 text-center md:text-left">
            {/* Tagline traduzida */}
            {t("tagline")}
          </p>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <span className="h-5 w-px bg-foreground/30" />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}