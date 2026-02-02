import OfficialProjectsClient from "@/app/_components/pages/official-projects";
import { connectMongo } from "@/lib/database/mongoose";
import { OfficialProject } from "@/models/OfficialProject";

async function getProjects() {
  await connectMongo();
  const projects = await OfficialProject.find().sort({ createdAt: -1 }).lean();
  return projects.map((p) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  }));
}

export default async function OfficialProjectsPage() {
  const projects = await getProjects();
  return <OfficialProjectsClient projects={projects} />;
}
