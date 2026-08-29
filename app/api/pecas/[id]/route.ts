import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// GET: Obter os detalhes de uma peça específica pelo ID
export async function GET(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const partId = Number(id);

    if (isNaN(partId)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const part = await prisma.part.findUnique({
      where: { id: partId },
      include: {
        brand: true,
        model: true,
        category: true,
        images: true,
      },
    });

    if (!part) {
      return NextResponse.json({ message: "Peça não encontrada" }, { status: 404 });
    }

    return NextResponse.json(part, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar peça:", error);
    return NextResponse.json(
      { message: error.message || "Erro interno ao buscar peça" },
      { status: 500 }
    );
  }
}

// PUT: Atualizar uma peça existente pelo ID
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const partId = Number(id);

    if (isNaN(partId)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

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

    // 1. Atualizar os dados principais da peça
    const pecaAtualizada = await prisma.part.update({
      where: { id: partId },
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

    // 2. Se o utilizador enviou novas imagens, faz o upload para o Supabase e regista-as
    if (imageFiles && imageFiles.length > 0) {
      const imagensExistentes = await prisma.partImage.findMany({
        where: { partId: pecaAtualizada.id },
      });
      let posicaoInicial = imagensExistentes.length;

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
            console.error(`Erro no upload da nova imagem ${i}:`, error);
          } else {
            const publicUrlResult = supabase.storage
              .from('images')
              .getPublicUrl(fileName);

            await prisma.partImage.create({
              data: {
                url: publicUrlResult.data.publicUrl,
                partId: pecaAtualizada.id,
                position: posicaoInicial + i,
              },
            });
          }
        }
      }
    }

    // 3. Retornar a peça completa com todas as relações e imagens atualizadas
    const pecaCompleta = await prisma.part.findUnique({
      where: { id: pecaAtualizada.id },
      include: {
        images: true,
        brand: true,
        model: true,
        category: true,
      },
    });

    return NextResponse.json(pecaCompleta, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar peça:", error);
    return NextResponse.json({ message: error.message || "Erro interno ao atualizar peça." }, { status: 500 });
  }
}

// DELETE: Apagar uma peça específica pelo ID e as respetivas imagens
export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const partId = Number(id);

    if (isNaN(partId)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    // 1. Buscar a peça e as imagens associadas antes de apagar
    const part = await prisma.part.findUnique({
      where: { id: partId },
      include: { images: true },
    });

    if (!part) {
      return NextResponse.json({ message: "Peça não encontrada" }, { status: 404 });
    }

    // 2. Se houver imagens no Supabase, extrair os nomes dos ficheiros e apagá-los do bucket
    if (part.images && part.images.length > 0) {
      const filePaths = part.images.map((img) => {
        const parts = img.url.split("/images/");
        return parts[1];
      }).filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("images")
          .remove(filePaths);

        if (storageError) {
          console.error("Erro ao apagar imagens do Supabase Storage:", storageError);
        }
      }
    }

    // 3. Apagar a peça na base de dados
    await prisma.part.delete({
      where: { id: partId },
    });

    return NextResponse.json({ message: "Peça e imagens eliminadas com sucesso" }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao eliminar peça:", error);
    return NextResponse.json(
      { message: error.message || "Erro interno ao eliminar peça" },
      { status: 500 }
    );
  }
}