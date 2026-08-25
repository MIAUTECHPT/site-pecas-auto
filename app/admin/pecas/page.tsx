"use client";

import { useEffect, useState } from "react";

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

type Part = {
  id: number;
  reference: string;
  name: string;
  price: number | null;
  stock: number;
  condition: string | null;
  brand: Brand;
  model: CarModel;
  category: Category | null;
};

export default function PecasPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pecas, setPecas] = useState<Part[]>([]);

  const [form, setForm] = useState({
    referencia: "",
    nome: "",
    brandId: "",
    modelId: "",
    categoryId: "",
    preco: "",
    stock: "1",
    condition: "Usado",
    descricao: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [aCarregar, setACarregar] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setACarregar(true);
    setErro("");

    try {
      const respostas = await Promise.all([
        fetch("/api/marcas"),
        fetch("/api/modelos"),
        fetch("/api/categorias"),
        fetch("/api/pecas"),
      ]);

      const [
        brandsResponse,
        modelsResponse,
        categoriesResponse,
        pecasResponse,
      ] = respostas;

      if (!brandsResponse.ok) {
        throw new Error("Erro ao carregar marcas.");
      }

      if (!modelsResponse.ok) {
        throw new Error("Erro ao carregar modelos.");
      }

      if (!categoriesResponse.ok) {
        throw new Error("Erro ao carregar categorias.");
      }

      if (!pecasResponse.ok) {
        throw new Error("Erro ao carregar peças.");
      }

      const brandsData = await brandsResponse.json();
      const modelsData = await modelsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const pecasData = await pecasResponse.json();

      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setModels(Array.isArray(modelsData) ? modelsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setPecas(Array.isArray(pecasData) ? pecasData : []);
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados."
      );
    } finally {
      setACarregar(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((atual) => ({
      ...atual,
      [name]: value,
    }));

    if (name === "brandId") {
      setForm((atual) => ({
        ...atual,
        brandId: value,
        modelId: "",
      }));
    }
  }

  const modelosDisponiveis = models.filter(
    (model) => model.brandId === Number(form.brandId)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMensagem("");
    setErro("");
    setAGuardar(true);

    try {
      const response = await fetch("/api/pecas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao guardar a peça."
        );
      }

      setMensagem("Peça guardada com sucesso.");

      setForm({
        referencia: "",
        nome: "",
        brandId: "",
        modelId: "",
        categoryId: "",
        preco: "",
        stock: "1",
        condition: "Usado",
        descricao: "",
      });

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao guardar a peça."
      );
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <a
            href="/admin"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            ← Voltar ao painel
          </a>

          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-red-600">
            Administração
          </p>

          <h1 className="mt-2 text-4xl font-bold text-black">
            Gestão de peças
          </h1>

          <p className="mt-2 text-zinc-600">
            Adiciona peças ao catálogo e consulta as peças existentes.
          </p>
        </div>

        {mensagem && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-black">
            Nova peça
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Referência *
                </label>

                <input
                  name="referencia"
                  value={form.referencia}
                  onChange={handleChange}
                  required
                  placeholder="Ex.: BMW-001"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Nome da peça *
                </label>

                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex.: Guarda-lamas direito"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Marca *
                </label>

                <select
                  name="brandId"
                  value={form.brandId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Selecionar marca</option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Modelo *
                </label>

                <select
                  name="modelId"
                  value={form.modelId}
                  onChange={handleChange}
                  required
                  disabled={!form.brandId}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none disabled:bg-zinc-100 focus:border-red-500"
                >
                  <option value="">
                    {form.brandId
                      ? "Selecionar modelo"
                      : "Escolha primeiro a marca"}
                  </option>

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
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Sem categoria</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Estado
                </label>

                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Usado">Usado</option>
                  <option value="Novo">Novo</option>
                  <option value="Recondicionado">
                    Recondicionado
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Preço (€)
                </label>

                <input
                  name="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Stock
                </label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Descrição
              </label>

              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows={4}
                placeholder="Descrição da peça..."
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={aGuardar}
              className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aGuardar ? "A guardar..." : "Guardar peça"}
            </button>

          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">
              Peças existentes
            </h2>

            <button
              type="button"
              onClick={carregarDados}
              disabled={aCarregar}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50"
            >
              {aCarregar ? "A carregar..." : "Atualizar"}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

            {aCarregar ? (
              <div className="p-8 text-center text-zinc-500">
                A carregar peças...
              </div>
            ) : pecas.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                Ainda não existem peças.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-zinc-200 bg-zinc-50">
                    <tr>
                      <th className="px-5 py-4 font-bold">
                        Referência
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Peça
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Marca
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Modelo
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Categoria
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Preço
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Stock
                      </th>

                      <th className="px-5 py-4 font-bold">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {pecas.map((peca) => (
                      <tr
                        key={peca.id}
                        className="border-b border-zinc-100 last:border-0"
                      >
                        <td className="px-5 py-4 font-mono">
                          {peca.reference}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {peca.name}
                        </td>

                        <td className="px-5 py-4">
                          {peca.brand?.name || "-"}
                        </td>

                        <td className="px-5 py-4">
                          {peca.model?.name || "-"}
                        </td>

                        <td className="px-5 py-4">
                          {peca.category?.name || "-"}
                        </td>

                        <td className="px-5 py-4">
                          {peca.price !== null
                            ? `${peca.price.toFixed(2)} €`
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          {peca.stock}
                        </td>

                        <td className="px-5 py-4">
                          {peca.condition || "-"}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}