"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaBars } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { signOut, useSession } from "next-auth/react";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  User,
} from "@heroui/react";

import ARCStudioTitle from "@/components/config/title";
import { items } from "@/lib/settings/navItems";
import {
  LuLayoutDashboard,
  LuLogOut,
  LuSettings,
  LuUser,
} from "react-icons/lu";
import { GoProjectRoadmap } from "react-icons/go";

export default function Navbar() {
  const { data: session } = useSession();

  const PlusIcon = (props) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        >
          <path d="M6 12h12" />
          <path d="M12 18V6" />
        </g>
      </svg>
    );
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showDropdowns, setShowDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isCompact = isScrolled || isMobile;

  useEffect(() => {
    const handleResizeScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight / 4);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("scroll", handleResizeScroll);
    window.addEventListener("resize", handleResizeScroll);
    handleResizeScroll();
    return () => {
      window.removeEventListener("scroll", handleResizeScroll);
      window.removeEventListener("resize", handleResizeScroll);
    };
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
      Object.entries(dropdownRefs.current).forEach(([key, el]) => {
        if (
          showDropdowns[key] &&
          el &&
          !el.contains(e.target as Node) &&
          buttonRefs.current[key] &&
          !buttonRefs.current[key]!.contains(e.target as Node)
        ) {
          setShowDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, showDropdowns]);

  useEffect(() => {
    if (menuOpen) {
      const btn = buttonRef.current;
      const menu = menuRef.current;
      if (btn && menu) {
        const rect = btn.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 16,
          left: rect.right - menu.offsetWidth,
        });
      }
      window.addEventListener("resize", updatePosition);
    }
    function updatePosition() {
      if (buttonRef.current && menuRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 16,
          left: rect.right - menuRef.current.offsetWidth,
        });
      }
    }
    return () => window.removeEventListener("resize", updatePosition);
  }, [menuOpen]);

  useEffect(() => {
    if (!isCompact && menuOpen) {
      setMenuOpen(false);
    }
  }, [isCompact, menuOpen]);

  const toggleDropdown = (key: string) =>
    setShowDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderNavItems = (pos: "left" | "right") =>
    Object.entries(items.notCompact)
      .filter(([, item]) =>
        pos === "left" ? item.position === "left" : item.position !== "left"
      )
      .map(([key, item]) => (
        <div key={key} className="relative">
          {item.children ? (
            <>
              <button
                ref={(el) => {
                  buttonRefs.current[key] = el;
                }}
                onClick={() => toggleDropdown(key)}
                className="cursor-pointer relative flex items-center gap-1 px-2 py-0.5 rounded hover:text-[#5b9eff] transition"
              >
                {item.icon} <span>{item.label}</span>
                <IoIosArrowDown
                  className={`ml-1 text-xs transition-transform ${
                    showDropdowns[key] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDropdowns[key] && (
                <div
                  ref={(el) => {
                    dropdownRefs.current[key] = el;
                  }}
                  className="text-foreground/70 absolute left-0 top-[calc(100%+24px)] 
             bg-[rgba(10,18,29,0.6)] backdrop-blur-md 
             rounded-lg shadow-lg border border-grid-line z-50"
                >
                  <ul className="p-2 text-sm min-w-[160px]">
                    {Object.entries(item.children).map(([subKey, subItem]) => (
                      <li key={subKey}>
                        <Link
                          href={subItem.href || "#"}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-[#141e2e75] transition"
                        >
                          {subItem.icon} <span>{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:text-[#5b9eff] transition"
            >
              {item.icon} <span>{item.label}</span>
            </Link>
          ) : null}
        </div>
      ));

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 flex justify-between items-center backdrop-blur-sm border border-grid-line shadow-lg z-50 transition-all duration-500 ease-in-out ${
          isCompact
            ? "max-w-[420px] w-[90%] h-12 px-4 rounded-full bg-[#0a121de0]"
            : "w-[95%] px-8 py-3 rounded-2xl bg-[#0a121d61]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="flex-shrink-0">
            <ARCStudioTitle />
          </Link>
          {!isCompact && (
            <nav className="flex gap-1 text-sm">{renderNavItems("left")}</nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isCompact && (
            <nav className="flex gap-1 text-sm">{renderNavItems("right")}</nav>
          )}
          {isCompact && (
            <button
              ref={buttonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="cursor-pointer p-2 rounded hover:bg-[#141e2e75] transition"
            >
              <FaBars size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Compact dropdown */}
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: 192,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen
            ? "translateY(0) scale(1)"
            : "translateY(-10px) scale(0.95)",
          transition: "opacity 0.3s, transform 0.3s",
        }}
        className="select-none bg-[#0a121db5] backdrop-blur-sm rounded-lg shadow-lg border border-grid-line z-50"
      >
        <ul className="flex flex-col w-full p-3 gap-2">
          {Object.entries(items.isCompact).map(([key, item]) =>
            item.label ? (
              <li key={key} className="w-full">
                {item.children ? (
                  <div className="w-full">
                    <button
                      onClick={() => toggleDropdown(key)}
                      className="cursor-pointer flex justify-between items-center w-full px-3 py-2 rounded hover:bg-[#141e2e75] transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <IoIosArrowDown
                        className={`text-xs transition-transform ${
                          showDropdowns[key] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showDropdowns[key] && (
                      <ul className="mt-2 w-full pl-6 pr-2 flex flex-col gap-1">
                        {Object.entries(item.children).map(
                          ([subKey, subItem]) => (
                            <li key={subKey} className="w-full">
                              <Link
                                href={subItem.href || "#"}
                                className="block w-full px-3 py-2 text-left rounded hover:bg-[#141e2e75] transition"
                                onClick={() => setMenuOpen(false)}
                              >
                                <div className="flex items-center gap-2">
                                  {subItem.icon}
                                  <span className="truncate">
                                    {subItem.label}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="block w-full px-3 py-2 rounded hover:bg-[#141e2e75] transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )}
              </li>
            ) : null
          )}
        </ul>

        <div className="border-t border-grid-line mx-3 my-2"></div>

        <ul className="flex p-3 gap-4 justify-center">
          {Object.entries(items.isCompact).map(([key, item]) =>
            !item.label ? (
              <li key={key}>
                <Link
                  href={item.href || "#"}
                  className="p-2 rounded hover:bg-[#141e2e75] transition block"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.icon}
                </Link>
              </li>
            ) : null
          )}
        </ul>
        {session && (
          <div className="border-t border-grid-line mx-3 mt-2 pt-3 pb-2">
            <Dropdown
              showArrow
              classNames={{
                base: "before:bg-[#141e2e75]",
                content:
                  "p-0 border border-grid-line bg-background rounded-lg text-gray-100",
              }}
              radius="sm"
              placement="bottom-end"
            >
              <DropdownTrigger>
                <button className="w-full flex items-center justify-between rounded-lg hover:bg-[#141e2e75] transition p-2">
                  <div className="flex items-center gap-3">
                    <User
                      name={session.user.name ?? "Usuário"}
                      description={`@${session.user.name}`}
                      avatarProps={{
                        src: session.user.image ?? "/default-avatar.png",
                        size: "sm",
                        className: "border border-grid-line",
                      }}
                      classNames={{
                        name: "text-gray-200 text-sm",
                        description: "text-gray-400 text-xs",
                      }}
                    />
                  </div>
                </button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Menu do usuário"
                className="p-3"
                itemClasses={{
                  base: [
                    "rounded-md",
                    "transition-all",
                    "text-gray-200",
                    // "data-[hover=true]:bg-[#141e2e75]",
                    // "data-[hover=true]:text-white",
                  ],
                }}
              >
                <DropdownSection showDivider aria-label="Perfil e ações">
                  <DropdownItem
                    key="profile"
                    startContent={<LuUser size={16} />}
                    as={Link}
                    className="hover:bg-[#141e2e75]"
                    href={`/app/profile/${session.user.name}`}
                  >
                    Perfil
                  </DropdownItem>

                  <DropdownItem
                    key="dashboard"
                    startContent={<LuLayoutDashboard size={16} />}
                    as={Link}
                    className="hover:bg-[#141e2e75]"
                    href="/app"
                  >
                    Dashboard
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection showDivider aria-label="Post">
                  <DropdownItem
                    key="publish_project"
                    href="/app/profile/publish-project"
                    className="hover:bg-[#141e2e75]"
                    endContent={<PlusIcon className="text-large" />}
                  >
                    Publicar Projeto
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Ajuda e Sair">
                  <DropdownItem
                    key="logout"
                    startContent={<LuLogOut size={16} />}
                    color="danger"
                    className="bg-red-400 hover:bg-red-500"
                    onClick={() => signOut()}
                  >
                    Sair
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>
    </>
  );
}
