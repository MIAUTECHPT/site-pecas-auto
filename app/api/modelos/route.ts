import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    const modelos = await prisma.carModel.findMany({
      where: brandId ? { brandId: Number(brandId) } : undefined,
      orderBy: { name: "asc" },
      include: { brand: true },
    });

    return NextResponse.json(modelos);
  } catch (error) {
    console.error("Erro ao obter modelos:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brandId } = body;

    if (!name || !brandId) {
      return NextResponse.json({ error: "Nome e marca são obrigatórios." }, { status: 400 });
    }

    // Criar um slug simples baseado no nome (ex: "Série 3" -> "serie-3")
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const novoModelo = await prisma.carModel.create({
      data: {
        name,
        slug: slug + "-" + Date.now(), // Garante unicidade
        brandId: Number(brandId),
      },
      include: { brand: true },
    });

    return NextResponse.json(novoModelo, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar modelo:", error);
    return NextResponse.json({ error: error.message || "Erro interno ao criar o modelo." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido." }, { status: 400 });
    }

    await prisma.carModel.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao eliminar o modelo:", error);
    return NextResponse.json({ error: "Erro ao eliminar o modelo." }, { status: 500 });
  }
}