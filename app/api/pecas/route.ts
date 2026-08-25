import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const brandId = searchParams.get("brandId");
    const modelId = searchParams.get("modelId");
    const categoryId = searchParams.get("categoryId");

    const where: any = {};

    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      // No SQLite, usamos 'contains' diretamente. Para garantir que funciona, 
      // podemos omitir o 'mode: insensitive' (que o SQLite nativo por vezes rejeita) 
      // ou filtrar diretamente. Vamos usar o contains simples:
      where.OR = [
        { name: { contains: searchTerm } },
        { reference: { contains: searchTerm } },
      ];
    }

    if (brandId) {
      where.brandId = Number(brandId);
    }

    if (modelId) {
      where.modelId = Number(modelId);
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const pecas = await prisma.part.findMany({
      where,
      include: {
        brand: true,
        model: true,
        category: true,
        images: true, // <-- Inclui as imagens na resposta da API
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(pecas);
  } catch (error) {
    console.error("Erro ao buscar peças:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar peças" },
      { status: 500 }
    );
  }
}