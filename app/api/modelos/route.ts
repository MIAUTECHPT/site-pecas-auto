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