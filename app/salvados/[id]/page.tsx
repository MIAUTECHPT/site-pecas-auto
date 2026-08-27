import { prisma } from "@/lib/prisma";
import GaleriaInterativa from "@/components/GaleriaInterativa";

async function getSalvado(id: number) {
  try {
    if (isNaN(id)) return null;
    
    const salvado = await prisma.salvage.findUnique({
      where: { id },
      include: {
        brand: true,
        model: true,
        images: true,
      },
    });
    
    if (!salvado) return null;

    // Normaliza as imagens para garantir que o componente recebe sempre o formato { id, url } correto
    const imagensNormalizadas = (salvado.images || []).map((img: any, index: number) => {
      const urlFinal = typeof img === 'string' ? img : (img.url || img.path || img.imageUrl);
      return {
        id: img.id || index,
        url: urlFinal || ""
      };
    }).filter(img => img.url !== "");

    return {
      ...salvado,
      images: imagensNormalizadas
    };
  } catch (error) {
    console.error("Erro ao buscar salvado:", error);
    return null;
  }
}

export default async function SalvadoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const idNumber = Number(resolvedParams.id);
  const salvado = await getSalvado(idNumber);

  if (!salvado) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-2xl font-black">Salvado não encontrado</h1>
          <p className="mt-2 text-zinc-400">O veículo não existe ou foi removido da base de dados.</p>
          <a href="/" className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200">
            Voltar ao início
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <a href="/#salvados" className="text-sm font-semibold text-zinc-500 hover:text-red-600">
          ← Voltar aos salvados
        </a>

        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          {/* Galeria Interativa */}
          <GaleriaInterativa images={salvado.images} name={salvado.title} />

          {/* Informações */}
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              Disponível
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {salvado.brand?.name} {salvado.model?.name || salvado.title}
            </h1>
            
            <p className="mt-2 text-lg text-zinc-500">
              {salvado.year ? `Ano: ${salvado.year}` : ""} {salvado.kilometers ? `· ${salvado.kilometers.toLocaleString()} km` : ""}
            </p>

            <div className="mt-6 border-t border-zinc-200 pt-6">
              <div className="text-sm text-zinc-400">Preço</div>
              <div className="text-3xl font-black text-zinc-900">
                {salvado.price !== null && salvado.price !== undefined
                  ? Number(salvado.price).toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
                  : "Sob consulta"}
              </div>
            </div>

            {salvado.description && (
              <div className="mt-6 border-t border-zinc-200 pt-6">
                <h3 className="font-bold">Descrição</h3>
                <p className="mt-2 text-zinc-600 leading-relaxed">{salvado.description}</p>
              </div>
            )}

            <div className="mt-8">
              <a
                href={`https://wa.me/351916055975?text=${encodeURIComponent(
                  `Olá! Estou interessado no salvado: ${salvado.brand?.name} ${salvado.model?.name || salvado.title} (Ref: ${salvado.reference})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-full bg-green-600 py-4 text-center font-bold text-white transition hover:bg-green-500"
              >
                Demonstrar interesse via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}