import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name");
    const email = req.nextUrl.searchParams.get("email");

    await connectToDatabase();

    const user = await User.findOne(name ? { name } : { _id: email }).lean();

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Erro info:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
