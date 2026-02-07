import OfficialProjectsClient from "@/app/_components/pages/official-projects";

async function getProjects() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/official-projects`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function OfficialProjectsPage() {
  const projects = await getProjects();
  return <OfficialProjectsClient projects={projects} />;
}
