"use client";

import { useEffect, useMemo, useState } from "react";

type Brand = {
  id: number;
  name: string;
};

type CarModel = {
  id: number;
  name: string;
  brandId: number;
};

type Category = {
  id: number;
  name: string;
};

type PartImage = {
  id: number;
  url: string;
};

type Part = {
  id: number;
  reference: string;
  name: string;
  description: string | null;
  price: number | null;
  stock: number;
  condition: string | null;
  brand: Brand;
  model: CarModel;
  category: Category | null;
  images: PartImage[];
};

export default function PecasPage() {
  const [pecas, setPecas] = useState<Part[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [pesquisa, setPesquisa] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [ordenacao, setOrdenacao] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Função para carregar dados enviando todos os filtros para a API
  async function carregarDados(filtrosAtualizados?: {
    pesquisa?: string;
    brandId?: string;
    modelId?: string;
    categoryId?: string;
  }) {
    try {
      setCarregando(true);
      setErro("");

      const params = new URLSearchParams();
      const pText = filtrosAtualizados?.pesquisa !== undefined ? filtrosAtualizados.pesquisa : pesquisa;
      const bId = filtrosAtualizados?.brandId !== undefined ? filtrosAtualizados.brandId : brandId;
      const mId = filtrosAtualizados?.modelId !== undefined ? filtrosAtualizados.modelId : modelId;
      const cId = filtrosAtualizados?.categoryId !== undefined ? filtrosAtualizados.categoryId : categoryId;

      if (pText.trim()) params.append("search", pText.trim());
      if (bId) params.append("brandId", bId);
      if (mId) params.append("modelId", mId);
      if (cId) params.append("categoryId", cId);

      const [pecasResponse, brandsResponse, modelsResponse, categoriesResponse] =
        await Promise.all([
          fetch(`/api/pecas?${params.toString()}`),
          fetch("/api/marcas"),
          fetch("/api/modelos"),
          fetch("/api/categorias"),
        ]);

      if (
        !pecasResponse.ok ||
        !brandsResponse.ok ||
        !modelsResponse.ok ||
        !categoriesResponse.ok
      ) {
        throw new Error("Não foi possível carregar os dados.");
      }

      const [pecasData, brandsData, modelsData, categoriesData] =
        await Promise.all([
          pecasResponse.json(),
          brandsResponse.json(),
          modelsResponse.json(),
          categoriesResponse.json(),
        ]);

      setPecas(pecasData);
      setBrands(brandsData);
      setModels(modelsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  // Disparar a busca na API com debounce para a pesquisa e alteração imediata nos selects
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarDados({ pesquisa, brandId, modelId, categoryId });
    }, 300);

    return () => clearTimeout(timer);
  }, [pesquisa, brandId, modelId, categoryId]);

  const modelosDisponiveis = useMemo(() => {
    if (!brandId) {
      return models;
    }

    return models.filter(
      (model) => model.brandId === Number(brandId)
    );
  }, [models, brandId]);

  // Apenas ordenação local, uma vez que a filtragem principal é feita na API
  const pecasOrdenadas = useMemo(() => {
    let resultado = [...pecas];

    if (ordenacao === "preco-menor") {
      resultado.sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
      );
    }

    if (ordenacao === "preco-maior") {
      resultado.sort(
        (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity)
      );
    }

    if (ordenacao === "nome") {
      resultado.sort((a, b) =>
        a.name.localeCompare(b.name, "pt")
      );
    }

    return resultado;
  }, [pecas, ordenacao]);

  function limparFiltros() {
    setPesquisa("");
    setBrandId("");
    setModelId("");
    setCategoryId("");
    setOrdenacao("");
  }

  function alterarMarca(value: string) {
    setBrandId(value);
    setModelId("");
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10">
          <a
            href="/"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            ← Voltar ao início
          </a>

          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-red-600">
            Stock
          </p>

          <h1 className="mt-2 text-4xl font-bold text-black">
            Peças auto
          </h1>

          <p className="mt-3 text-zinc-600">
            Encontre rapidamente a peça que procura.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-black">
              Pesquisar peças
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Pesquise por nome, referência, marca ou modelo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Pesquisa
              </label>

              <input
                type="text"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Ex.: Guarda-lamas, TESTE-001..."
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Marca
              </label>

              <select
                value={brandId}
                onChange={(e) => alterarMarca(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="">Todas as marcas</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
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
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="">Todos os modelos</option>

                {modelosDisponiveis.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Categoria
              </label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="">Todas as categorias</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Ordenar
              </label>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="">Mais recentes</option>
                <option value="nome">Nome A-Z</option>
                <option value="preco-menor">
                  Preço mais baixo
                </option>
                <option value="preco-maior">
                  Preço mais alto
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={limparFiltros}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Limpar filtros
              </button>
            </div>

          </div>
        </section>

        {carregando && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            A carregar peças...
          </div>
        )}

        {erro && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {erro}
          </div>
        )}

        {!carregando && !erro && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                <strong>{pecasOrdenadas.length}</strong>{" "}
                {pecasOrdenadas.length === 1
                  ? "peça encontrada"
                  : "peças encontradas"}
              </p>
            </div>

            {pecasOrdenadas.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
                <h2 className="text-xl font-bold text-black">
                  Nenhuma peça encontrada
                </h2>

                <p className="mt-2 text-zinc-500">
                  Tente alterar os filtros ou a pesquisa.
                </p>

                <button
                  type="button"
                  onClick={limparFiltros}
                  className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pecasOrdenadas.map((peca) => {
                  const imagemUrl =
                    peca.images && peca.images.length > 0
                      ? peca.images[0].url
                      : null;

                  return (
                    <article
                      key={peca.id}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* Imagem da Peça */}
                      <div className="relative h-48 w-full bg-zinc-100">
                        {imagemUrl ? (
                          <img
                            src={imagemUrl}
                            alt={peca.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-400">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="p-6">

                        <div className="mb-4 flex items-start justify-between gap-4">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-mono text-zinc-600">
                            {peca.reference}
                          </span>

                          <span
                            className={
                              peca.stock > 0
                                ? "text-sm font-semibold text-green-600"
                                : "text-sm font-semibold text-red-600"
                            }
                          >
                            {peca.stock > 0
                              ? `Stock: ${peca.stock}`
                              : "Sem stock"}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold text-black">
                          {peca.name}
                        </h2>

                        <div className="mt-4 space-y-2 text-sm text-zinc-600">
                          <p>
                            <strong>Marca:</strong>{" "}
                            {peca.brand?.name || "—"}
                          </p>

                          <p>
                            <strong>Modelo:</strong>{" "}
                            {peca.model?.name || "—"}
                          </p>

                          <p>
                            <strong>Categoria:</strong>{" "}
                            {peca.category?.name || "—"}
                          </p>

                          <p>
                            <strong>Estado:</strong>{" "}
                            {peca.condition || "—"}
                          </p>
                        </div>

                        {peca.description && (
                          <p className="mt-4 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
                            {peca.description}
                          </p>
                        )}

                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
                          <span className="text-xl font-bold text-black">
                            {peca.price !== null
                              ? `${peca.price.toFixed(2)} €`
                              : "Preço sob consulta"}
                          </span>

                          <a
                            href={`mailto:?subject=Pedido sobre a peça ${peca.reference}`}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                          >
                            Contactar
                          </a>
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}