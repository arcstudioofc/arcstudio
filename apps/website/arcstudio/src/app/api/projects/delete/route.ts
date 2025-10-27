import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, hash } = await req.json();

    if (!name || !hash) {
      return NextResponse.json(
        { error: "Nome do usuário e hash do post são obrigatórios" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Busca o usuário pelo name
    const user = await User.findOne({ name });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Remove o post pelo hash
    const beforeCount = user.posts.length;
    user.posts = user.posts.filter((p: IPost) => p.hash !== hash);

    if (beforeCount === user.posts.length) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    await user.save();

    return NextResponse.json({ success: true, remainingPosts: user.posts.length });
  } catch (err) {
    console.error("[DELETE PROJECT] erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
