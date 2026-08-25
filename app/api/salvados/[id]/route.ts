import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const salvado = await prisma.salvage.findUnique({
      where: { id },
      include: {
        brand: true,
        model: true,
        images: true,
      },
    });

    if (!salvado) {
      return NextResponse.json(
        { error: "Salvado não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(salvado, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar salvado:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o pedido" },
      { status: 500 }
    );
  }
}