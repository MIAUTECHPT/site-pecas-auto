import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.category.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao obter categorias." },
      { status: 500 }
    );
  }
}