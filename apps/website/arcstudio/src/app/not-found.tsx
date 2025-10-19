"use client";

import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="select-none flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-5xl font-bold mb-4 glitch-text relative">
        <span className="text-[#c3caef]">404</span>
      </h1>
      <p className="text-xl text-[#9697ad] mb-2">
        Ops! A página{" "}
        <span className="bg-[#24328b89] text-[#404ea6] rounded-md px-2 py-0.5 ml-1 inline-block">
          {pathname}
        </span>{" "}
        não foi encontrada.
      </p>
    </div>
  );
}
