import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getUserByName } from "@/lib/database/mongoose/service";
import ProfileProvider from "./providers";

interface ProfileNamePageProps {
  params: { name: string };
}

// Metadata dinâmico baseado no usuário
export async function generateMetadata({ params }: ProfileNamePageProps): Promise<Metadata> {
  const user = await getUserByName(params.name);

  if (!user) {
    return {
      title: "Perfil não encontrado",
      description: "O perfil que você está tentando acessar não existe.",
    };
  }

  return {
    title: `${user.name}`,
    description: `${user.name} — Veja o perfil completo e seus projetos.`,
    openGraph: {
      title: `${user.name}`,
      description: `Confira o perfil e projetos de ${user.name}.`,
      type: "profile",
      // url: `https://arcstudio.com/app/profile/${user.name}`,
      images: [
        {
          url: user.image || "/default-avatar.png",
          width: 800,
          height: 600,
          alt: `${user.name} avatar`,
        },
      ],
    },
  };
}

export default async function ProfileNamePage({ params }: ProfileNamePageProps) {
  const user = await getUserByName(params.name);

  if (!user) {
    notFound();
  }

  return <ProfileProvider user={user} />
}
