import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/database/mongoose";
import { Changelog } from "@/models/Changelog";

export async function GET() {
  try {
    await connectMongo();

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentChangelog = await Changelog.findOne({
      date: { $gte: threeDaysAgo }
    }).lean();

    return NextResponse.json({ hasRecent: !!recentChangelog });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ hasRecent: false }, { status: 500 });
  }
}
