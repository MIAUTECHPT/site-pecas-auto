import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET: Obter todos os salvados
export async function GET() {
  try {
    const salvages = await prisma.salvage.findMany({
      include: {
        brand: true,
        model: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(salvages);
  } catch (error) {
    console.error("Erro ao buscar salvados:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar salvados" },
      { status: 500 }
    );
  }
}

// POST: Criar um novo salvado com imagens no Supabase
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const reference = formData.get("reference") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const brandId = formData.get("brandId") as string;
    const modelId = formData.get("modelId") as string;
    const year = formData.get("year") as string;
    const kilometers = formData.get("kilometers") as string;

    if (!reference || !title || !brandId || !modelId) {
      return NextResponse.json(
        { message: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // Criar o registo do salvado na base de dados
    const newSalvage = await prisma.salvage.create({
      data: {
        reference,
        title,
        description: description || null,
        price: price ? parseFloat(price) : null,
        brandId: Number(brandId),
        modelId: Number(modelId),
        year: year ? Number(year) : null,
        kilometers: kilometers ? Number(kilometers) : null,
      },
    });

    // Processar o upload das imagens para o Supabase (mesma lógica das peças)
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];

        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const fileName = `salvage-${Date.now()}-${i}-${imageFile.name.replace(/\s/g, '_')}`;

          const { error } = await supabase.storage
            .from('images')
            .upload(fileName, buffer, {
              contentType: imageFile.type,
              upsert: false
            });

          if (error) {
            console.error(`Erro no upload da imagem de salvado ${i}:`, error);
          } else {
            const publicUrlResult = supabase.storage
              .from('images')
              .getPublicUrl(fileName);

            await prisma.salvageImage.create({
              data: {
                url: publicUrlResult.data.publicUrl,
                salvageId: newSalvage.id,
              },
            });
          }
        }
      }
    }

    const salvageCompleto = await prisma.salvage.findUnique({
      where: { id: newSalvage.id },
      include: {
        brand: true,
        model: true,
        images: true,
      },
    });

    return NextResponse.json(salvageCompleto, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar salvado:", error);
    return NextResponse.json(
      { message: error.message || "Erro interno ao criar salvado." },
      { status: 500 }
    );
  }
}