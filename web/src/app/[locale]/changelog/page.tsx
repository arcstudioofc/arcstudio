import ChangelogClient from "@/app/_components/pages/changelog";

async function getChangelogs() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/changelogs`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ChangelogPage() {
  const changelogs = await getChangelogs();
  return <ChangelogClient changelogs={changelogs} />;
}
