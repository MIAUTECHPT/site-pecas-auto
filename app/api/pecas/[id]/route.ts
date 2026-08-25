import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// GET: Obter os detalhes de uma peça específica pelo ID
export async function GET(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const partId = Number(id);

    if (isNaN(partId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const part = await prisma.part.findUnique({
      where: { id: partId },
      include: {
        brand: true,
        model: true,
        category: true,
        images: true,
      },
    });

    if (!part) {
      return NextResponse.json({ error: "Peça não encontrada" }, { status: 404 });
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error("Erro ao buscar peça:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar peça" },
      { status: 500 }
    );
  }
}

// DELETE: Apagar uma peça específica pelo ID (caso utilize esta funcionalidade)
export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const partId = Number(id);

    if (isNaN(partId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.part.delete({
      where: { id: partId },
    });

    return NextResponse.json({ message: "Peça eliminada com sucesso" });
  } catch (error) {
    console.error("Erro ao eliminar peça:", error);
    return NextResponse.json(
      { error: "Erro interno ao eliminar peça" },
      { status: 500 }
    );
  }
}