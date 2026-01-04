import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/database/mongoose";
import { Changelog } from "@/models/Changelog";

const allowedOrigins = [
  "http://localhost:3000",
  "https://arcstudio.online",
  "https://app.arcstudio.online"
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
};

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET() {
  try {
    await connectMongo();

    const changelogs = await Changelog.find()
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(
      changelogs.map((c) => ({
        ...c,
        _id: c._id.toString(),
        date: c.date.toISOString(),
      })),
      { headers: getCorsHeaders(null) }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar changelogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();

    const body = await req.json();
    const { title, content, type } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const changelog = await Changelog.create({
      title,
      content,
      type,
      date: new Date(),
    });

    return NextResponse.json(
      { success: true, data: changelog },
      { status: 201, headers: getCorsHeaders(null) }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar changelog" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const { id, title, content, type } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const updated = await Changelog.findByIdAndUpdate(
      id,
      { title, content, type },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Changelog não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...updated,
        _id: updated._id.toString(),
        date: updated.date.toISOString()
      } 
    }, { headers: getCorsHeaders(null) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar changelog" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await Changelog.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { headers: getCorsHeaders(null) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao deletar changelog" }, { status: 500 });
  }
}
