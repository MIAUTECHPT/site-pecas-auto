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
    const formData = await request.formData();
    
    // Imprimir para ver exatamente o que chega no terminal do VS Code
    console.log("--- DADOS RECEBIDOS NO FORM DATA ---");
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    const name = formData.get("name")?.toString();
    const reference = formData.get("reference")?.toString();
    
    // Aceita tanto brandId como brand
    const brandId = formData.get("brandId")?.toString() || formData.get("brand")?.toString();
    // Aceita tanto modelId como model
    const modelId = formData.get("modelId")?.toString() || formData.get("model")?.toString();
    // Aceita tanto categoryId como category
    const categoryId = formData.get("categoryId")?.toString() || formData.get("category")?.toString();
    
    const price = formData.get("price")?.toString();
    const stock = formData.get("stock")?.toString();
    const condition = formData.get("condition")?.toString();
    const description = formData.get("description")?.toString();

    if (!reference || !name || !brandId || !modelId || !price) {
      return NextResponse.json({ 
        message: `Campos obrigatórios em falta. Recebido -> Ref: ${reference}, Nome: ${name}, Marca: ${brandId}, Modelo: ${modelId}, Preço: ${price}` 
      }, { status: 400 });
    }

    const novaPeca = await prisma.part.create({
      data: {
        reference,
        name,
        brandId: Number(brandId),
        modelId: Number(modelId),
        categoryId: categoryId ? Number(categoryId) : null,
        condition: condition || "Usado",
        price: Number(price),
        stock: stock ? Number(stock) : 1,
        description: description || null,
      },
    });

    return NextResponse.json(novaPeca, { status: 201 });
  } catch (error: any) {
    console.error("Erro detalhado ao criar peça:", error);
    return NextResponse.json({ message: error.message || "Erro interno ao criar peça." }, { status: 500 });
  }
}