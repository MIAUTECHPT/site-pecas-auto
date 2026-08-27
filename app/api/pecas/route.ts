import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const brandId = searchParams.get("brandId");
    const modelId = searchParams.get("modelId");
    const categoryId = searchParams.get("categoryId");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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
        images: true,
        brand: true,
        model: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pecas, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao listar peças:", error);
    return NextResponse.json({ message: error.message || "Erro interno." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name")?.toString();
    const reference = formData.get("reference")?.toString();
    const brandId = formData.get("brandId")?.toString();
    const modelId = formData.get("modelId")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const price = formData.get("price")?.toString();
    const stock = formData.get("stock")?.toString();
    const condition = formData.get("condition")?.toString();
    const description = formData.get("description")?.toString();
    
    const imageFiles = formData.getAll("images") as File[];

    if (!reference || !name || !brandId || !modelId || !price) {
      return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 });
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

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];

        if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const fileName = `${Date.now()}-${i}-${imageFile.name.replace(/\s/g, '_')}`;

          const { error } = await supabase.storage
            .from('images')
            .upload(fileName, buffer, {
              contentType: imageFile.type,
              upsert: false
            });

          if (error) {
            console.error(`Erro no upload da imagem ${i}:`, error);
          } else {
            const publicUrlResult = supabase.storage
              .from('images')
              .getPublicUrl(fileName);

            console.log("URL gerado pelo Supabase:", publicUrlResult.data.publicUrl);

            await prisma.partImage.create({
              data: {
                url: publicUrlResult.data.publicUrl,
                partId: novaPeca.id,
                position: i,
              },
            });
          }
        }
      }
    }

    return NextResponse.json(novaPeca, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar peça:", error);
    return NextResponse.json({ message: error.message || "Erro interno." }, { status: 500 });
  }
}