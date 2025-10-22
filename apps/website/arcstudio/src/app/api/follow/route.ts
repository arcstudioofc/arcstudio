import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose/connection";
import { User } from "@/lib/database/mongoose/models/User";

export async function POST(req: NextRequest) {
  try {
    const { followerName, targetName } = await req.json();

    if (!followerName || !targetName)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    await connectToDatabase();

    const follower = await User.findOne({ name: followerName });
    const target = await User.findOne({ name: targetName });

    if (!follower || !target)
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    // Garante que `account` existe
    follower.account ??= { followers: [], following: [] };
    target.account ??= { followers: [], following: [] };

    const isFollowing = follower.account.following.includes(targetName);

    if (isFollowing) {
      // Deixar de seguir
      follower.account.following = follower.account.following.filter((n) => n !== targetName);
      target.account.followers = target.account.followers.filter((n) => n !== followerName);
    } else {
      // Seguir
      follower.account.following.push(targetName);
      target.account.followers.push(followerName);
    }

    await follower.save();
    await target.save();

    return NextResponse.json({
      success: true,
      following: !isFollowing,
      followers: target.account.followers,
    });
  } catch (err) {
    console.error("Erro follow:", err);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
