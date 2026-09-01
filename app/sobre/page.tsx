import Link from 'next/link';

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
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
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      {/* CONTEÚDO SOBRE NÓS */}
      <section className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl mb-8">
          Sobre Nós
        </h1>

        <div className="space-y-6 text-zinc-700 leading-relaxed text-lg">
          <p className="font-semibold text-zinc-900">
            Somos uma microempresa especializada na venda de peças auto, com um compromisso firme: servir bem e garantir a total satisfação dos nossos clientes.
          </p>
          <p>
            Fazemos o que gostamos e dedicamo-nos de corpo e alma a este serviço todos os dias. 
          </p>
          <p>
            Pode confiar inteiramente na nossa equipa e na nossa seriedade. Estamos sediados em Vila de Cucujães, com morada na{' '}
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Rua+Prof.+Lidio+Correia+Bloco+Sul+684+Picoto+3720-798+Vila+de+Cucujaes+Portugal" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline underline-offset-4 text-zinc-900 hover:text-red-600 font-medium"
            >
              Rua Prof. Lídio Correia, Bloco Sul, 684, Picoto, 3720-798 Vila de Cucujães
            </a>
            , prontos para o ajudar a encontrar exatamente o que o seu automóvel precisa.
          </p>
        </div>
      </section>
    </main>
  );
}