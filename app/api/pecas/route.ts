import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET: Listar todas as peças (com as respetivas imagens e dados relacionados)
export async function GET() {
  try {
    const pecas = await prisma.part.findMany({
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
    
    const imageFile = formData.get("image") as File | null;

    if (!reference || !name || !brandId || !modelId || !price) {
      return NextResponse.json({ message: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    // 1. Criar a peça na base de dados
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

    // 2. Se houver imagem, enviar para o Bucket 'images' do Supabase
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;

      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: false
        });

      if (error) {
        console.error("Erro no upload para o Supabase:", error);
      } else {
        // Obter o URL público da imagem
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        // Guardar o link na tabela de imagens da peça
        await prisma.partImage.create({
          data: {
            url: publicUrlData.publicUrl,
            partId: novaPeca.id,
            position: 0,
          },
        });
      }
    }

    return NextResponse.json(novaPeca, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar peça:", error);
    return NextResponse.json({ message: error.message || "Erro interno." }, { status: 500 });
  }
}