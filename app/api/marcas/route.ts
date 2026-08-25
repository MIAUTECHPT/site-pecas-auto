import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET existente para listar as marcas
export async function GET() {
  try {
    const marcas = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(marcas);
  } catch (error) {
    console.error("Erro ao obter marcas:", error);
    return NextResponse.json({ error: "Erro ao obter marcas." }, { status: 500 });
  }
}

// POST novo para criar uma marca
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "O nome da marca é obrigatório." }, { status: 400 });
    }

    // Criar o slug automaticamente (ex: "Mercedes Benz" -> "mercedes-benz")
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const novaMarca = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: slug,
        active: true,
      },
    });

    return NextResponse.json(novaMarca, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar marca:", error);
    return NextResponse.json({ error: "Erro ao criar marca (poderá já existir)." }, { status: 500 });
  }
}