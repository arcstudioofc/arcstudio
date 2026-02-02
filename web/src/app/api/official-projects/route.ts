import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/database/mongoose";
import { OfficialProject } from "@/models/OfficialProject";

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
  await connectMongo();
  const projects = await OfficialProject.find().sort({ createdAt: -1 }).lean();
  const serialized = projects.map((p) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  }));
  return NextResponse.json(serialized, { headers: getCorsHeaders(null) });
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const data = await req.json();

    const project = new OfficialProject(data);
    await project.save();

    return NextResponse.json({ 
      success: true, 
      project: {
        ...project.toObject(),
        _id: project._id.toString()
      } 
    }, { headers: getCorsHeaders(null) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Erro ao criar projeto" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectMongo();
    const data = await req.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    const project = await OfficialProject.findByIdAndUpdate(_id, updateData, { new: true }).lean();

    if (!project) {
      return NextResponse.json({ success: false, error: "Projeto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      project: {
        ...project,
        _id: project._id.toString()
      } 
    }, { headers: getCorsHeaders(null) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Erro ao atualizar projeto" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    await OfficialProject.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { headers: getCorsHeaders(null) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Erro ao deletar projeto" }, { status: 500 });
  }
}
