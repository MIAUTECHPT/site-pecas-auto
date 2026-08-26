import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brandId } = body;

    if (!name || !brandId) {
      return NextResponse.json({ error: "Nome e marca são obrigatórios." }, { status: 400 });
    }

    const novoModelo = await prisma.carModel.create({
      data: {
        name,
        brandId: Number(brandId),
      },
    });

    return NextResponse.json(novoModelo, { status: 201 });
  } catch (error) {
    console.error("Erro detalhado ao criar modelo:", error);
    return NextResponse.json({ error: "Erro interno ao criar o modelo." }, { status: 500 });
  }
}