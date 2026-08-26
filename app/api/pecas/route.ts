import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pecas = await prisma.part.findMany({
      include: { brand: true, model: true, category: true },
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
    console.log("Dados recebidos no POST:", body); // Para veres o que está a chegar

    const { reference, name, brandId, modelId, categoryId, condition, price, stock } = body;

    if (!reference || !name || !brandId || !modelId || !categoryId || !price) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const novaPeca = await prisma.part.create({
      data: {
        reference,
        name,
        brandId: Number(brandId),
        modelId: Number(modelId),
        categoryId: Number(categoryId),
        condition: condition || "Bom",
        price: Number(price),
        stock: Number(stock) || 1,
      },
    });

    return NextResponse.json(novaPeca, { status: 201 });
  } catch (error: any) {
    console.error("Erro detalhado do Prisma ao criar peça:", error);
    // Devolve a mensagem de erro exata do Prisma para o browser em vez de um erro genérico
    return NextResponse.json({ error: error.message || "Erro interno ao criar peça." }, { status: 500 });
  }
}