// Rota POST para atualizar avatar/banner/descrição do usuário
// Ajuste imports conforme sua estrutura (path para connectToDatabase e User)

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

// Opcional: validação com next-auth (descomente e ajuste se tiver authOptions exportado)
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, imageBase64, bannerBase64, description } = body;

    if (!email) {
      return NextResponse.json({ error: "Email do usuário é obrigatório" }, { status: 400 });
    }

    // Se desejar validar sessão com next-auth, descomente e ajuste:
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.email !== email) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    // }

    await connectToDatabase();

    const update: any = {};
    if (description !== undefined) update["account.description"] = description;
    if (imageBase64) update["image"] = imageBase64;
    if (bannerBase64) update["account.bannerUrl"] = bannerBase64;

    // Se você quiser garantir que apenas o dono atualize, valide a sessão acima.
    const user = await User.findByIdAndUpdate(
      email,
      { $set: update },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
