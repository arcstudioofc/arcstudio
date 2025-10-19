import { notFound } from "next/navigation";

import { getUserByName } from "@/lib/database/mongoose/service";
import ProfileProvider from "./providers";

interface ProfileNamePageProps {
  params: { name: string };
}

export default async function ProfileNamePage({ params }: ProfileNamePageProps) {
  const user = await getUserByName(params.name);

  if (!user) {
    notFound();
  }

  // passa o user para o provider (client component)
  return <ProfileProvider user={user} />;
}
