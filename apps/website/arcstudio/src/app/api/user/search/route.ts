import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";

  if (!name.trim()) {
    return NextResponse.json({ users: [] });
  }

  await connectToDatabase();

  try {
    const users = await User.find({
      name: { $regex: name, $options: "i" },
    })
      .select("name email image account")
      .limit(10)
      .lean()
      .exec();

    // Ajuste: transformar os dados no formato esperado
    const formattedUsers = users.map((user) => ({
      ...user,
      // account: {
      //   follow: user.account?.followers?.length || 0,
      //   posts: Array.isArray(user.posts)
      //     ? user.posts
      //     : [],
      // },
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (err) {
    console.error("Erro na busca de usuários:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
