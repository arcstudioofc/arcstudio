import ChangelogClient from "@/app/_components/pages/changelog";
import { connectMongo } from "@/lib/database/mongoose";
import { Changelog } from "@/models/Changelog";

async function getChangelogs() {
  await connectMongo();
  return Changelog.find().sort({ date: -1 }).lean();
}

export default async function ChangelogPage() {
  const changelogs = await getChangelogs();

  const serialized = changelogs.map(cl => ({
    ...cl,
    _id: cl._id.toString(),
    date: cl.date?.toISOString(),
    createdAt: cl.createdAt?.toISOString(),
    updatedAt: cl.updatedAt?.toISOString(),
  }));

  return <ChangelogClient changelogs={serialized} />;
}
