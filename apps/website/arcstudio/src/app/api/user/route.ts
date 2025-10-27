import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ user: null }, { status: 400 });
    }

    await connectToDatabase();

    // Busca pelo _id, que é o email
    const user = await User.findById(email).lean();

    return NextResponse.json({ user: user || null });
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return NextResponse.json({ user: null, error: "Erro ao buscar usuário" }, { status: 500 });
  }
}
