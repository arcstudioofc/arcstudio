import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, hash, bannerUrl, description, githubUrl } = await req.json();

    if (!name || !hash || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ name });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const possibleHashes = [hash, `${name}_${hash}`];
    const post = user.posts.find((p: IPost) => possibleHashes.includes(p.hash));

    if (!post) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Atualiza os campos apenas se forem passados
    if (bannerUrl !== undefined) post.bannerUrl = bannerUrl;
    post.content = description;
    if (githubUrl !== undefined) post.githubUrl = githubUrl;

    // Marca como editado
    post.edited = {
      isEdited: true,
      editedAt: new Date(),
    };

    await user.save();

    console.log(`[projects/update] Projeto atualizado: ${post.hash}`);
    return NextResponse.json({ success: true, hash: post.hash });
  } catch (err) {
    console.error("[projects/update] erro:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
