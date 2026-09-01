import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PecaClientGallery from "@/components/GaleriaInterativa";

export const dynamic = 'force-dynamic';

async function getPeca(id: string) {
  const pecaId = Number(id);
  if (isNaN(pecaId)) return null;

  try {
    const peca = await prisma.part.findUnique({
      where: { id: pecaId },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        brand: true,
        model: true,
        category: true,
      },
    });
    return peca;
  } catch (error) {
    console.error("Erro ao procurar peça:", error);
    return null;
  }
}

export default async function PecaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peca = await getPeca(id);

  if (!peca) {
    notFound();
  }

  const preco =
    peca.price !== null
      ? Number(peca.price).toLocaleString("pt-PT", {
          style: "currency",
          currency: "EUR",
        })
      : "Preço sob consulta";

  const mensagem = `Olá! Gostaria de obter informações sobre esta peça.

Peça: ${peca.name}
Referência: ${peca.reference}
Marca: ${peca.brand.name}
Modelo: ${peca.model.name}
Preço: ${preco}

Gostaria de saber se a peça está disponível e quais são as condições de envio.`;

  const whatsappUrl = `https://wa.me/351916055975?text=${encodeURIComponent(
    mensagem
  )}`;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-16 w-auto overflow-hidden">
              <img
                src="/logo.png"
                alt="BRPEÇAS"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      {/* CONTEÚDO */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* TÍTULO */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">
            Detalhes da peça
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {peca.name}
          </h1>

          <p className="mt-2 text-zinc-500">
            Referência: {peca.reference}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* GALERIA INTERATIVA DE FOTOS */}
          <PecaClientGallery images={peca.images} name={peca.name} />

          {/* INFORMAÇÃO DA PEÇA */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            {/* PREÇO / STOCK */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-zinc-500">Preço</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-4xl font-black">{preco}</p>
                  {peca.price !== null && (
                    <span className="text-sm font-semibold text-zinc-500">+ IVA</span>
                  )}
                </div>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  peca.stock > 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {peca.stock > 0 ? "Disponível" : "Esgotado"}
              </span>
            </div>

            <div className="my-8 border-t border-zinc-100" />

            {/* DADOS */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">Marca</p>
                <p className="mt-1 font-bold">{peca.brand.name}</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">Modelo</p>
                <p className="mt-1 font-bold">{peca.model.name}</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">Categoria</p>
                <p className="mt-1 font-bold">
                  {peca.category?.name || "Sem categoria"}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">Estado</p>
                <p className="mt-1 font-bold">
                  {peca.condition || "Não indicado"}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">Stock</p>
                <p className="mt-1 font-bold">{peca.stock} unidade(s)</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-4">
                <p className="text-xs text-zinc-400">Referência</p>
                <p className="mt-1 font-bold">{peca.reference}</p>
              </div>
            </div>

            {/* DESCRIÇÃO */}
            <div className="mt-8">
              <p className="text-sm font-bold">Descrição</p>
              <p className="mt-2 leading-7 text-zinc-500">
                {peca.description || "Sem descrição disponível."}
              </p>
            </div>

            {/* WHATSAPP */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block w-full rounded-xl bg-red-600 px-6 py-4 text-center font-bold text-white transition hover:bg-red-500"
            >
              Pedir informações sobre esta peça
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}