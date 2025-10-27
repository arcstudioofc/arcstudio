import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const hash = searchParams.get("hash");

    if (!name || !hash)
      return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ name }).lean<{ posts: IPost[] }>();

    if (!user)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const possibleHashes = [hash, `${name}_${hash}`];
    const post = user.posts.find((p: IPost) => typeof p.hash === "string" && possibleHashes.includes(p.hash));

    if (!post)
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });

    return NextResponse.json(post);
  } catch (err) {
    console.error("[projects/get] erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
