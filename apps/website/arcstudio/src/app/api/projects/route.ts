import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

/**
 * POST  -> criar novo projeto
 * DELETE -> deletar projeto pelo hash
 */
export async function POST(req: NextRequest) {
  try {
    const { name, bannerUrl, description, githubUrl } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Nome e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ name }).exec();
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const postNumber = (user.posts?.length || 0) + 1;
    const hash = `${user.name}_${postNumber}`;

    const newPost = {
      hash,
      content: description,
      bannerUrl: bannerUrl || null,
      githubUrl: githubUrl || null,
      edited: {
        isEdited: false,
        editedAt: undefined,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.posts.push(newPost);
    await user.save({ validateBeforeSave: true });

    console.log(`[projects/create] novo post salvo para ${user.name}:`, hash);

    return NextResponse.json({ success: true, hash, createdPost: newPost });
  } catch (err) {
    console.error("[projects/create] erro:", err);
    return NextResponse.json({ error: "Erro interno ao criar projeto" }, { status: 500 });
  }
}

// export async function DELETE(req: NextRequest) {
//   try {
//     const { name, hash } = await req.json();

//     if (!name || !hash) {
//       return NextResponse.json(
//         { error: "Nome e hash do projeto são obrigatórios" },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     const user = await User.findOne({ name }).exec();
//     if (!user) {
//       return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
//     }

//     const index = user.posts.findIndex((p) => p.hash === hash);
//     if (index === -1) {
//       return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
//     }

//     user.posts.splice(index, 1);
//     await user.save({ validateBeforeSave: true });

//     console.log(`[projects/delete] post deletado para ${user.name}:`, hash);

//     return NextResponse.json({ success: true, deletedHash: hash });
//   } catch (err) {
//     console.error("[projects/delete] erro:", err);
//     return NextResponse.json({ error: "Erro interno ao deletar projeto" }, { status: 500 });
//   }
// }
