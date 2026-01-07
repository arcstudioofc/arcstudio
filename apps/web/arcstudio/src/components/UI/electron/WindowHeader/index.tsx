"use client";

import {
  VscChromeMinimize,
  VscChromeMaximize,
  VscChromeClose,
  VscChromeRestore,
} from "react-icons/vsc";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import LocaleSwitcher from "@/widgets/switcher/locale";
import ThemeSwitcher from "@/widgets/switcher/theme";

export function WindowHeader() {
  const [isMaximized, setIsMaximized] = useState(false);
  const pathname = usePathname();

  const pageName =
    pathname === "/"
      ? "Home"
      : pathname
          .split("/")
          .filter(Boolean)
          .pop()
          ?.replace(/-/g, " ") ?? "";

  useEffect(() => {
    if (typeof window !== "undefined" && window.windowControls) {
      window.windowControls.isMaximized().then(setIsMaximized);

      window.windowControls.onMaximizeChange((_, state) => {
        setIsMaximized(state);
      });
    }
  }, []);

  if (typeof window === "undefined" || !window.windowControls) {
    return null;
  }

  return (
    <header
      className="relative z-[100] flex h-10 w-full select-none items-center justify-between border-b border-foreground/10 bg-background"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* left: icon */}
      <div
        className="flex items-center px-4"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <Image src="/favicon.ico" width={16} height={16} alt="ARC Studio" />
      </div>

      {/* center: title */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-xs text-foreground/80">
        <span className="tracking-wide uppercase font-semibold">
          ARC STUDIO
        </span>

        <span className="opacity-50">/</span>

        <span className="tracking-wide uppercase">
          {pageName}
        </span>
      </div>

      {/* right: switches + window controls */}
      <div
        className="flex h-full items-center"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div className="flex items-center gap-1 px-2">
          <ThemeSwitcher isElectronHeader />
          <LocaleSwitcher isElectronHeader />
        </div>

        <div className="ml-2 flex h-full items-center">
          <button
            onClick={() => window.windowControls.minimize()}
            className="flex h-10 w-12 items-center justify-center transition-colors hover:bg-foreground/10"
            aria-label="Minimize"
          >
            <VscChromeMinimize className="h-4 w-4" />
          </button>

          <button
            onClick={() => window.windowControls.maximize()}
            className="flex h-10 w-12 items-center justify-center transition-colors hover:bg-foreground/10"
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <VscChromeRestore className="h-4 w-4" />
            ) : (
              <VscChromeMaximize className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => window.windowControls.close()}
            className="flex h-10 w-12 items-center justify-center transition-colors hover:bg-red-500 hover:text-white"
            aria-label="Close"
          >
            <VscChromeClose className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
