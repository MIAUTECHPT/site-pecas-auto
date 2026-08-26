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

type Brand = {
  id: number;
  name: string;
};

type Model = {
  id: number;
  name: string;
  brandId: number;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

const configCategorias: Record<string, { icon: string; descricao: string }> = {
  "motores": { icon: "⚙️", descricao: "Motores usados e completos" },
  "caixas de velocidades": { icon: "🔧", descricao: "Manuais e automáticas" },
  "carroçaria": { icon: "🚗", descricao: "Portas, capôs e para-choques" },
  "iluminação": { icon: "💡", descricao: "Faróis e farolins" },
  "elétrica": { icon: "🔌", descricao: "Centralinas e componentes" },
  "interior": { icon: "🪑", descricao: "Bancos, tabliers e interiores" },
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

  // Lista filtrada de salvados com base na pesquisa
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
        const resMarcas = await fetch("/api/marcas");
        if (resMarcas.ok) {
          const dataMarcas = await resMarcas.json();
          setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
        }

        const resCategorias = await fetch("/api/categorias");
        if (resCategorias.ok) {
          const dataCategorias = await resCategorias.json();
          setCategoriasApi(Array.isArray(dataCategorias) ? dataCategorias : []);
        }

        const resSalvados = await fetch("/api/salvados");
        if (resSalvados.ok) {
          const dataSalvados = await resSalvados.json();
          setSalvados(Array.isArray(dataSalvados) ? dataSalvados : []);
        }

        const resPecas = await fetch("/api/pecas");
        if (resPecas.ok) {
          const dataPecas = await resPecas.json();
          setPecas(Array.isArray(dataPecas) ? dataPecas : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
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
        const response = await fetch(
          `/api/modelos?brandId=${encodeURIComponent(brandId)}`
        );
        if (!response.ok) throw new Error("Erro ao carregar modelos");
        const data = await response.json();
        setModelos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
        setModelos([]);
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

      if (termoBusca.trim()) {
        params.set("search", termoBusca.trim());
      }

      if (marcaAtiva) {
        params.set("brandId", marcaAtiva);
      }

      if (modeloAtivo) {
        params.set("modelId", modeloAtivo);
      }

      if (catAtiva) {
        params.set("categoryId", catAtiva);
      }

      const url = `/api/pecas?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao pesquisar peças");
      }

      const data = await response.json();
      setPecas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao pesquisar peças:", error);
      setPecas([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelecionarCategoria(catId: number) {
    const stringId = String(catId);
    setCategoryId(stringId);
    pesquisarPecas(undefined, undefined, undefined, stringId);

    const elemento = document.getElementById("resultados-pecas");
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function limparPesquisa() {
    setSearch("");
    setBrandId("");
    setModelId("");
    setCategoryId("");
    setModelos([]);
    setSearched(false);
    setLoading(true);

    try {
      const response = await fetch("/api/pecas");
      if (response.ok) {
        const data = await response.json();
        setPecas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao limpar pesquisa:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="h-22 w-auto overflow-hidden">
              <img
                src="/logo.png"
                alt="BRPEÇAS"
                className="h-full w-full object-contain"
              />
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#pecas" className="text-lg font-medium transition hover:text-red-600">Peças</a>
            <a href="#salvados" className="text-lg font-medium transition hover:text-red-600">Viaturas</a>
            <a href="#sobre" className="text-lg font-medium transition hover:text-red-600">Sobre nós</a>
            <a href="#contactos" className="text-lg font-medium transition hover:text-red-600">Contactos</a>
          </nav>

          <a 
            href="#contactos" 
            className="rounded-lg bg-black px-5 py-3 text-lg font-semibold text-white transition hover:bg-zinc-800"
          >
            Falar connosco / Contactos
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(220,38,38,0.28),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Stock atualizado diariamente
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
              Encontre a peça certa para o seu automóvel.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Peças auto, viaturas e componentes testados.
              Pesquise por peça, marca, modelo ou referência.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#pesquisa"
                className="rounded-full bg-red-600 px-7 py-4 text-center font-bold text-white transition hover:bg-red-500"
              >
                Procurar uma peça
              </a>
              <a
                href="#salvados"
                className="rounded-full border border-white/20 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10"
              >
                Ver salvados
              </a>
            </div>
          </div>

          {/* PESQUISA */}
          <div
            id="pesquisa"
            className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wider text-red-600">
                Pesquisa rápida
              </p>
              <h2 className="mt-2 text-2xl font-black">
                O que procura?
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Peça ou referência
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      pesquisarPecas();
                    }
                  }}
                  placeholder="Ex.: farolim BMW Série 3"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">
                    Marca
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => {
                      setBrandId(e.target.value);
                      setModelId("");
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
                  >
                    <option value="">Todas as marcas</option>
                    {marcas.map((marca) => (
                      <option key={marca.id} value={marca.id}>
                        {marca.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">
                    Modelo
                  </label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    disabled={!brandId}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecionar modelo</option>
                    {modelos.map((modelo) => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none"
                >
                  <option value="">Todas as categorias</option>
                  {categoriasApi.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => pesquisarPecas()}
                disabled={loading}
                className="w-full rounded-xl bg-zinc-950 px-5 py-4 font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "A pesquisar..." : "🔎 Pesquisar peças"}
              </button>

              {searched && (
                <button
                  type="button"
                  onClick={limparPesquisa}
                  className="w-full text-sm font-semibold text-zinc-500 hover:text-red-600"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-red-600">
              Encontre rapidamente
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Categorias de peças
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCategoryId("");
              pesquisarPecas("");
              document.getElementById("resultados-pecas")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              categoryId === "" 
                ? "border-red-600 bg-red-600 text-white" 
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
            }`}
          >
            <span>🔄</span>
            <span>Ver tudo</span>
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
                  isSelected 
                    ? "border-red-600 bg-red-600 text-white shadow-md" 
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                <span>{config.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* RESULTADOS DAS PEÇAS (CARROSSEL) */}
      <section id="resultados-pecas" className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-red-600">
                {searched ? "Resultados da pesquisa" : "Stock disponível"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {searched
                  ? `Peças encontradas (${pecas.length})`
                  : `Peças em destaque (${pecas.length})`}
              </h2>
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
              <p className="font-semibold text-zinc-600">A carregar peças...</p>
            </div>
          )}

          {!loading && pecas.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
              <div className="text-5xl">🔍</div>
              <h3 className="mt-4 text-xl font-black">Nenhuma peça encontrada</h3>
              <p className="mt-2 text-zinc-500">
                Tente alterar a pesquisa, marca, modelo ou categoria.
              </p>
            </div>
          )}

          {!loading && pecas.length > 0 && (
            <Carousel>
              {pecas.map((peca) => (
                <div key={peca.id} className="min-w-[280px] max-w-[280px]">
                  <article className="h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-52 w-full bg-zinc-100">
                      {peca.images && peca.images.length > 0 ? (
                        <img
                          src={peca.images[0].url}
                          alt={peca.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-400">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="text-xs font-semibold text-zinc-400">
                        {peca.reference}
                      </div>
                      <h3 className="mt-2 font-bold">{peca.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {peca.brand?.name ?? ""} {peca.model?.name ? `· ${peca.model.name}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {peca.category?.name ?? ""}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                        <span className="text-xl font-black">
                          {peca.price.toLocaleString("pt-PT", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                        <a
                          href={`/pecas/${peca.id}`}
                          className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold transition hover:bg-red-600 hover:text-white"
                        >
                          Ver peça
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </section>

      {/* SALVADOS REAIS DA BD COM FILTRO (CARROSSEL) */}
      <section id="salvados" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-red-600">
                Salvados disponíveis
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Viaturas
              </h2>
            </div>

            <div className="w-full sm:w-80">
              <input
                type="text"
                value={searchSalvados}
                onChange={(e) => setSearchSalvados(e.target.value)}
                placeholder="Pesquisar viaturas por marca ou modelo..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 shadow-sm"
              />
            </div>
          </div>
        </div>

        {salvados.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
            De momento não existem salvados disponíveis.
          </div>
        ) : salvadosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
            Nenhum salvado corresponde à sua pesquisa.
          </div>
        ) : (
          <Carousel>
            {salvadosFiltrados.map((salvado) => (
              <div key={salvado.id} className="min-w-[340px] max-w-[340px]">
                <article className="h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-60 w-full bg-zinc-900">
                    {salvado.images && salvado.images.length > 0 ? (
                      <img
                        src={salvado.images[0].url}
                        alt={salvado.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl">
                        🚘
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black">
                          {salvado.brand?.name} {salvado.model?.name || salvado.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {salvado.year ? `${salvado.year}` : ""} {salvado.kilometers ? `· ${salvado.kilometers.toLocaleString()} km` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        Disponível
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-zinc-400">Preço</div>
                        <div className="text-2xl font-black">
                          {salvado.price !== null
                            ? salvado.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
                            : "Sob consulta"}
                        </div>
                      </div>
                      <a
                        href={`/salvados/${salvado.id}`}
                        className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                      >
                        Ver viatura
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </Carousel>
        )}
      </section>

      {/* FOOTER */}
      <footer id="contactos" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
          
          <div className="md:col-span-2">
            <div className="h-14 w-auto">
              <img src="/logo.png" alt="BRPEÇAS" className="h-full object-contain" />
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Venda de peças auto e viaturas. Encontre a peça
              certa para o seu veículo de forma simples e rápida.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Navegação</h3>
            <div className="mt-4 space-y-2 text-sm text-zinc-500">
              <a href="#pesquisa" className="block hover:text-red-600">Peças</a>
              <a href="#salvados" className="block hover:text-red-600">Viaturas</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Contactos</h3>
            <div className="mt-4 space-y-3 text-sm text-zinc-500">
              <p>📞 912 563 416</p>
              <p>✉ geral@empresa.pt</p>
              
              <div>
                <a
                  href="https://wa.me/351912563416?text=Olá,%20gostaria%20de%20obter%20mais%20informações."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Falar por WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-zinc-100">
          <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-zinc-400">
            © 2026 BRPEÇAS. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}