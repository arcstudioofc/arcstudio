import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, post } = await req.json();

    if (!name || !post || !post.hash) {
      return NextResponse.json(
        { error: "Dados insuficientes para restauração" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Busca o usuário
    const user = await User.findOne({ name });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o post já existe (evita duplicatas)
    const exists = user.posts.some((p: any) => p.hash === post.hash);
    if (exists) {
      return NextResponse.json(
        { error: "Post já existe, restauração cancelada" },
        { status: 409 }
      );
    }

    // Reinsere o post no topo da lista
    user.posts.unshift(post);
    await user.save();

    console.log(`[RESTORE PROJECT] Projeto restaurado: ${post.hash}`);
    return NextResponse.json({ success: true, restored: post.hash });
  } catch (err) {
    console.error("[RESTORE PROJECT] erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
