import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

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

// POST: Criar um novo salvado com imagens
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

    // Criar primeiro o registo do salvado na base de dados
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

// Processar o upload das imagens (se existirem)
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${file.name.replace(/\s/g, "_")}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          
          try {
            await writeFile(path.join(uploadDir, filename), buffer);

            // CORREÇÃO: Usar salvageImage conforme o seu schema.prisma
            await prisma.salvageImage.create({
              data: {
                url: `/uploads/${filename}`,
                salvageId: newSalvage.id,
              },
            });
          } catch (imgError) {
            console.error("Erro ao guardar imagem individual:", imgError);
          }
        }
      }
    }

    return NextResponse.json(newSalvage, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar salvado:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar salvado (verifique se a referência já existe)." },
      { status: 500 }
    );
  }
}