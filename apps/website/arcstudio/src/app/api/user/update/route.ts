import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

interface UserUpdateBody {
  email: string;
  imageBase64?: string;
  bannerBase64?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: UserUpdateBody = await req.json();
    const { email, imageBase64, bannerBase64, description } = body;

    if (!email) {
      return NextResponse.json({ error: "Email do usuário é obrigatório" }, { status: 400 });
    }

    await connectToDatabase();

    const update: Record<string, string> = {};
    if (description !== undefined) update["account.description"] = description;
    if (imageBase64) update["image"] = imageBase64;
    if (bannerBase64) update["account.bannerUrl"] = bannerBase64;

    const user = await User.findByIdAndUpdate(
      email,
      { $set: update },
      { new: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno" }, { status: 500 });
  }
}
