import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // No Next.js mais recente, convém aguardar os params se necessário, ou usar direto params.id
    const modelId = Number(id);

    await prisma.carModel.delete({
      where: { id: modelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro detalhado ao eliminar o modelo:", error);
    return NextResponse.json(
      { error: "Erro ao eliminar o modelo." },
      { status: 500 }
    );
  }
}