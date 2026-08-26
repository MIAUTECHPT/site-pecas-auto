import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pecas = await prisma.part.findMany({
      include: { brand: true, carModel: true, category: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(pecas);
  } catch (error) {
    console.error("Erro ao buscar peças:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, name, brandId, modelId, categoryId, condition, price, stock, imageUrl } = body;

    if (!reference || !name || !brandId || !modelId || !categoryId || !price) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const slug = (reference + "-" + name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();

    const novaPeca = await prisma.part.create({
      data: {
        reference,
        name,
        slug,
        brandId: Number(brandId),
        carModelId: Number(modelId),
        categoryId: Number(categoryId),
        condition: condition || "Bom",
        price: Number(price),
        stock: Number(stock) || 1,
        imageUrl: imageUrl || "",
      },
    });

    return NextResponse.json(novaPeca, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar peça:", error);
    return NextResponse.json({ error: error.message || "Erro interno ao criar peça." }, { status: 500 });
  }
}