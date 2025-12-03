import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ARC() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/"
      className="flex items-center flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src="/favicon.ico"
        alt="Logo ARC Studio"
        width={28}
        height={28}
        className="rounded-md"
      />

      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isHovered ? "auto" : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden whitespace-nowrap ml-2 text-xl font-bold text-foreground tracking-tight"
      >
        ARC Studio
      </motion.span>
    </Link>
  );
}
