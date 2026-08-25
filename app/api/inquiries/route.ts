import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      message,
      partId,
    } = body;

    if (!name || !email || !message || !partId) {
      return NextResponse.json(
        {
          error: "Nome, email, mensagem e peça são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const part = await prisma.part.findUnique({
      where: {
        id: Number(partId),
      },
    });

    if (!part) {
      return NextResponse.json(
        {
          error: "Peça não encontrada.",
        },
        { status: 404 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        message: String(message).trim(),
        partId: Number(partId),
      },
    });

    return NextResponse.json(
      {
        success: true,
        inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return NextResponse.json(
      {
        error: "Não foi possível enviar o pedido.",
      },
      { status: 500 }
    );
  }
}