import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    const modelos = await prisma.carModel.findMany({
      where: brandId ? { brandId: Number(brandId) } : undefined,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(modelos);
  } catch (error) {
    console.error("Erro detalhado ao obter modelos:", error);
    return NextResponse.json([], { status: 500 });
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
    console.error("Erro detalhado ao eliminar o modelo:", error);
    return NextResponse.json(
      { error: "Erro ao eliminar o modelo." },
      { status: 500 }
    );
  }
}