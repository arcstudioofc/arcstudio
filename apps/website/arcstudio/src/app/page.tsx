import { Metadata } from "next";

import Home from "@/components/pages";

export const metadata: Metadata = {
  title: "ARC Studio — Início",
  description:
    "Seu projeto merece o melhor — vamos torná-lo realidade com inovação e dedicação.",
};

export default function HomePage() {
  return <Home />
}
