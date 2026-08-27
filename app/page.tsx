"use client";

import { useEffect, useState } from "react";
import { Carousel } from "@/components/Carousel";

type Peça = {
  id: number;
  reference: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  condition: string;
  status: string;
  brand?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  model?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  images?: {
    id: number;
    url: string;
  }[];
};

type Salvage = {
  id: number;
  reference: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string;
  year: number | null;
  kilometers: number | null;
  brand?: {
    id: number;
    name: string;
  } | null;
  model?: {
    id: number;
    name: string;
  } | null;
  images?: {
    id: number;
    url: string;
  }[];
};

type Brand = { id: number; name: string };
type Model = { id: number; name: string; brandId: number };
type Category = { id: number; name: string; slug: string };

const configCategorias: Record<string, { icon: string }> = {
  "motores": { icon: "⚙️" },
  "caixas de velocidades": { icon: "🔧" },
  "carroçaria": { icon: "🚗" },
  "iluminação": { icon: "💡" },
  "elétrica": { icon: "🔌" },
  "interior": { icon: "🪑" },
};

export default function Home() {
  const [searchSalvados, setSearchSalvados] = useState("");
  const [pecas, setPecas] = useState<Peça[]>([]);
  const [salvados, setSalvados] = useState<Salvage[]>([]);
  const [marcas, setMarcas] = useState<Brand[]>([]);
  const [modelos, setModelos] = useState<Model[]>([]);
  const [categoriasApi, setCategoriasApi] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const salvadosFiltrados = salvados.filter((salvado) => {
    const texto = searchSalvados.toLowerCase();
    const titulo = salvado.title.toLowerCase();
    const marca = salvado.brand?.name?.toLowerCase() || "";
    const modelo = salvado.model?.name?.toLowerCase() || "";
    return titulo.includes(texto) || marca.includes(texto) || modelo.includes(texto);
  });

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [resMarcas, resCategorias, resSalvados, resPecas] = await Promise.all([
          fetch("/api/marcas"),
          fetch("/api/categorias"),
          fetch("/api/salvados"),
          fetch("/api/pecas")
        ]);

        if (resMarcas.ok) setMarcas(await resMarcas.json());
        if (resCategorias.ok) setCategoriasApi(await resCategorias.json());
        if (resSalvados.ok) setSalvados(await resSalvados.json());
        if (resPecas.ok) setPecas(await resPecas.json());
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    async function carregarModelos() {
      if (!brandId) {
        setModelos([]);
        setModelId("");
        return;
      }
      try {
        const response = await fetch(`/api/modelos?brandId=${encodeURIComponent(brandId)}`);
        if (response.ok) {
          const data = await response.json();
          setModelos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
      }
    }
    carregarModelos();
  }, [brandId]);

  async function pesquisarPecas(
    overrideSearch?: string,
    overrideBrandId?: string,
    overrideModelId?: string,
    overrideCategoryId?: string
  ) {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      const termoBusca = overrideSearch !== undefined ? overrideSearch : search;
      const marcaAtiva = overrideBrandId !== undefined ? overrideBrandId : brandId;
      const modeloAtivo = overrideModelId !== undefined ? overrideModelId : modelId;
      const catAtiva = overrideCategoryId !== undefined ? overrideCategoryId : categoryId;

      if (termoBusca.trim()) params.set("search", termoBusca.trim());
      if (marcaAtiva) params.set("brandId", marcaAtiva);
      if (modeloAtivo) params.set("modelId", modeloAtivo);
      if (catAtiva) params.set("categoryId", catAtiva);

      const response = await fetch(`/api/pecas?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPecas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelecionarCategoria(catId: number) {
    const stringId = String(catId);
    setCategoryId(stringId);
    pesquisarPecas(undefined, undefined, undefined, stringId);
    document.getElementById("resultados-pecas")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="h-12 w-auto overflow-hidden">
              <img src="/logo.png" alt="BRPEÇAS Logo" className="h-full w-full object-contain" />
            </div>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#pecas" className="text-base font-medium transition hover:text-red-600">Peças</a>
            <a href="#salvados" className="text-base font-medium transition hover:text-red-600">Viaturas</a>
            <a href="#contactos" className="text-base font-medium transition hover:text-red-600">Contactos</a>
          </nav>
          <a href="#contactos" className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Falar connosco
          </a>
        </div>
      </header>

      {/* HERO & PESQUISA */}
      <section className="relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(220,38,38,0.28),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Stock atualizado diariamente
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Encontre a peça certa para o seu automóvel.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Peças auto, viaturas e componentes testados. Pesquise por peça, marca, modelo ou referência.
            </p>
          </div>

          <div id="pesquisa" className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider text-red-600">Pesquisa rápida</p>
              <h2 className="mt-2 text-2xl font-black">O que procura?</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Peça ou referência</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && pesquisarPecas()}
                  placeholder="Ex.: farolim BMW Série 3"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Marca</label>
                  <select
                    value={brandId}
                    onChange={(e) => { setBrandId(e.target.value); setModelId(""); }}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none"
                  >
                    <option value="">Todas as marcas</option>
                    {marcas.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Modelo</label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    disabled={!brandId}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none disabled:opacity-50"
                  >
                    <option value="">Selecionar modelo</option>
                    {modelos.map((mo) => (<option key={mo.id} value={mo.id}>{mo.name}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none"
                >
                  <option value="">Todas as categorias</option>
                  {categoriasApi.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => pesquisarPecas()}
                disabled={loading}
                className="w-full rounded-xl bg-zinc-950 px-5 py-4 font-bold text-white transition hover:bg-red-600"
              >
                {loading ? "A pesquisar..." : "🔎 Pesquisar peças"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">Encontre rapidamente</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Categorias de peças</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => { setCategoryId(""); pesquisarPecas(""); }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              categoryId === "" ? "border-red-600 bg-red-600 text-white" : "border-zinc-200 bg-white text-zinc-700"
            }`}
          >
            <span>🔄</span> Ver tudo
          </button>
          {categoriasApi.map((cat) => {
            const config = configCategorias[cat.name.toLowerCase()] || { icon: "📦" };
            const isSelected = categoryId === String(cat.id);
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleSelecionarCategoria(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
                  isSelected ? "border-red-600 bg-red-600 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span>{config.icon}</span> {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* RESULTADOS DAS PEÇAS COM IMAGENS GARANTIDAS */}
      <section id="resultados-pecas" className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">Stock disponível</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {searched ? `Peças encontradas (${pecas.length})` : `Peças em destaque (${pecas.length})`}
            </h2>
          </div>

          {loading && <div className="text-center py-10 font-semibold text-zinc-600">A carregar peças...</div>}

          {!loading && pecas.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
              <h3 className="text-xl font-black">Nenhuma peça encontrada</h3>
            </div>
          )}

          {!loading && pecas.length > 0 && (
            <Carousel>
              {pecas.map((peca) => {
                // Seleciona a primeira imagem válida se existir
                const primeiraImagem = peca.images && peca.images.length > 0 ? peca.images[0].url : null;

                return (
                  <div key={peca.id} className="min-w-[280px] max-w-[280px]">
                    <article className="h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl flex flex-col">
                      {/* CONTAINER DA IMAGEM COM ALTURA FIXA PARA NUNCA OCULTAR */}
                      <div className="relative h-52 w-full bg-zinc-200 overflow-hidden flex items-center justify-center">
                        {primeiraImagem ? (
                          <img 
                            src={primeiraImagem} 
                            alt={peca.name} 
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              // Fallback visual se o link da imagem quebrar
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400 text-xs font-semibold">
                            <span className="text-2xl mb-1">📷</span>
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <div className="text-xs font-bold text-red-600">{peca.reference}</div>
                          <h3 className="mt-1 font-bold text-base line-clamp-1">{peca.name}</h3>
                          <p className="mt-1 text-xs text-zinc-500">
                            {peca.brand?.name ?? ""} {peca.model?.name ? `· ${peca.model.name}` : ""}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                          <div>
                            <span className="text-lg font-black">
                              {peca.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                            </span>
                            <p className="text-[10px] text-zinc-400">+ IVA</p>
                          </div>
                          <a href={`/pecas/${peca.id}`} className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600">
                            Ver peça
                          </a>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </Carousel>
          )}
        </div>
      </section>

      {/* SALVADOS COM IMAGENS GARANTIDAS */}
      <section id="salvados" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">Salvados disponíveis</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Viaturas</h2>
          </div>
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchSalvados}
              onChange={(e) => setSearchSalvados(e.target.value)}
              placeholder="Pesquisar viaturas..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
        </div>

        {salvadosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
            Nenhum salvado encontrado.
          </div>
        ) : (
          <Carousel>
            {salvadosFiltrados.map((salvado) => {
              const primeiraImagemSalvado = salvado.images && salvado.images.length > 0 ? salvado.images[0].url : null;

              return (
                <div key={salvado.id} className="min-w-[340px] max-w-[340px]">
                  <article className="h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl flex flex-col">
                    {/* CONTAINER DA IMAGEM DO SALVADO */}
                    <div className="relative h-60 w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                      {primeiraImagemSalvado ? (
                        <img 
                          src={primeiraImagemSalvado} 
                          alt={salvado.title} 
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-500 text-sm">
                          <span className="text-4xl mb-1">🚘</span>
                          <span>Sem fotografia</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="text-xl font-black">
                          {salvado.brand?.name} {salvado.model?.name || salvado.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {salvado.year ? `${salvado.year}` : ""} {salvado.kilometers ? `· ${salvado.kilometers.toLocaleString()} km` : ""}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                        <div>
                          <div className="text-xs text-zinc-400">Preço</div>
                          <div className="text-xl font-black">
                            {salvado.price !== null ? salvado.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" }) : "Sob consulta"}
                          </div>
                        </div>
                        <a href={`/salvados/${salvado.id}`} className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600">
                          Ver viatura
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </Carousel>
        )}
      </section>

      {/* FOOTER */}
      <footer id="contactos" className="border-t border-zinc-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="h-12 w-auto">
              <img src="/logo.png" alt="BRPEÇAS Logo" className="h-full object-contain" />
            </div>
            <p className="mt-3 max-w-md text-sm text-zinc-500">
              Venda de peças auto e viaturas. Encontre a peça certa para o seu veículo de forma simples e rápida.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Contactos</h3>
            <div className="mt-4 space-y-2 text-sm text-zinc-500">
              <p>📞 916 055 975</p>
              <p>✉️ brpecasauto2022@gmail.com</p>
              <p>📍 Vila de Cucujães, Portugal</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}