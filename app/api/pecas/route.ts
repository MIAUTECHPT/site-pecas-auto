import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET: Obter todas as peças
export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      include: {
        brand: true,
        model: true,
        category: true,
        images: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("Erro ao buscar peças:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar peças" },
      { status: 500 }
    );
  }
}

// POST: Criar uma nova peça com imagens no Supabase
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const reference = formData.get("reference") as string;
    const name = formData.get("name") as string;
    const brandId = formData.get("brandId") as string;
    const modelId = formData.get("modelId") as string;
    const categoryId = formData.get("categoryId") as string;
    const price = formData.get("price") as string;
    const stock = formData.get("stock") as string;
    const condition = formData.get("condition") as string;
    const description = formData.get("description") as string;

    if (!reference || !name || !brandId || !modelId || !price) {
      return NextResponse.json(
        { message: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // Criar o registo da peça na base de dados
    const newPart = await prisma.part.create({
      data: {
        reference,
        name,
        brandId: Number(brandId),
        modelId: Number(modelId),
        categoryId: categoryId ? Number(categoryId) : null,
        price: price ? parseFloat(price) : null,
        stock: stock ? Number(stock) : 1,
        condition: condition || "Usado",
        description: description || null,
      },
    });

    // Processar o upload das imagens para o Supabase (igual aos salvados)
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];

        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const fileName = `part-${Date.now()}-${i}-${imageFile.name.replace(/\s/g, '_')}`;

          const { error } = await supabase.storage
            .from('images')
            .upload(fileName, buffer, {
              contentType: imageFile.type,
              upsert: false
            });

          if (error) {
            console.error(`Erro no upload da imagem da peça ${i}:`, error);
          } else {
            const publicUrlResult = supabase.storage
              .from('images')
              .getPublicUrl(fileName);

            await prisma.partImage.create({
              data: {
                url: publicUrlResult.data.publicUrl,
                partId: newPart.id,
              },
            });
          }
        }
      }
    }

    const partCompleta = await prisma.part.findUnique({
      where: { id: newPart.id },
      include: {
        brand: true,
        model: true,
        category: true,
        images: true,
      },
    });

    return NextResponse.json(partCompleta, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar peça:", error);
    return NextResponse.json(
      { message: error.message || "Erro interno ao criar peça." },
      { status: 500 }
    );
  }
}