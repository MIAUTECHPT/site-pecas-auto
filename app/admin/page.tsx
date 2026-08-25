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

  const [imagemFile, setImagemFile] = useState<File | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [brandsResponse, modelsResponse, categoriesResponse, pecasResponse] =
        await Promise.all([
          fetch("/api/marcas"),
          fetch("/api/modelos"),
          fetch("/api/categorias"),
          fetch("/api/pecas"),
        ]);

      if (brandsResponse.ok) setBrands(await brandsResponse.json());
      if (modelsResponse.ok) setModels(await modelsResponse.json());
      if (categoriesResponse.ok) setCategories(await categoriesResponse.json());
      if (pecasResponse.ok) {
        const pecasData = await pecasResponse.json();
        setPecas(Array.isArray(pecasData) ? pecasData : []);
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os dados.");
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImagemFile(e.target.files[0]);
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
      const formData = new FormData();
      formData.append("name", form.nome);
      formData.append("reference", form.referencia);
      formData.append("brandId", form.brandId);
      formData.append("modelId", form.modelId);
      formData.append("categoryId", form.categoryId);
      formData.append("price", form.preco);
      formData.append("stock", form.stock);
      formData.append("condition", form.condition);
      formData.append("description", form.descricao);

      if (imagemFile) {
        formData.append("image", imagemFile);
      }

      const response = await fetch("/api/pecas", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao guardar a peça.");
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
      setImagemFile(null);

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao guardar a peça."
      );
    } finally {
      setAGuardar(false);
    }
  }
  async function handleDelete(id: number) {
    if (!confirm("Tem a certeza de que pretende eliminar esta peça?")) return;

    try {
      const response = await fetch(`/api/pecas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao eliminar a peça.");
      }

      // Atualiza a lista após apagar
      await carregarDados();
    } catch (error) {
      console.error(error);
      alert("Não foi possível eliminar a peça.");
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
            Gerir peças
          </h1>

          <p className="mt-2 text-zinc-600">
            Adiciona e gere as peças usadas disponíveis para venda.
          </p>
        </div>

        {mensagem && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
            {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-6 text-2xl font-black">
            Nova peça
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Referência *
              </label>

              <input
                name="referencia"
                value={form.referencia}
                onChange={handleChange}
                placeholder="Ex.: PEC-00001"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Nome da peça *
              </label>

              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex.: Guarda-lamas direito"
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Marca *
              </label>

              <select
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900"
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
              <label className="mb-2 block font-semibold text-zinc-900">
                Modelo *
              </label>

              <select
                name="modelId"
                value={form.modelId}
                onChange={handleChange}
                required
                disabled={!form.brandId}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 disabled:bg-zinc-100"
              >
                <option value="">
                  {form.brandId
                    ? "Selecionar modelo"
                    : "Escolher primeiro a marca"}
                </option>

                {modelosDisponiveis.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Categoria
              </label>

              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900"
              >
                <option value="">Selecionar categoria</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Estado
              </label>

              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900"
              >
                <option value="Usado">Usado</option>
                <option value="Muito bom">Muito bom</option>
                <option value="Bom">Bom</option>
                <option value="Para reparar">Para reparar</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Preço (€)
              </label>

              <input
                name="preco"
                type="number"
                min="0"
                step="0.01"
                value={form.preco}
                onChange={handleChange}
                placeholder="Ex.: 120.00"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-zinc-900">
                Stock
              </label>

              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold text-zinc-900">
              Imagem da peça
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold text-zinc-900">
              Descrição
            </label>

            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={5}
              placeholder="Informação adicional sobre a peça..."
              className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={aGuardar}
            className="mt-8 rounded-xl bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aGuardar ? "A guardar..." : "Guardar peça"}
          </button>
        </form>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-black">
            Peças existentes
          </h2>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {pecas.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                Ainda não existem peças.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-100 text-zinc-900 font-bold">
                    <tr>
                      <th className="px-5 py-4">Referência</th>
                      <th className="px-5 py-4">Peça</th>
                      <th className="px-5 py-4">Marca</th>
                      <th className="px-5 py-4">Modelo</th>
                      <th className="px-5 py-4">Preço</th>
                      <th className="px-5 py-4">Stock</th>
                      <th className="px-5 py-4 text-right">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="text-zinc-900 font-medium">
                    {pecas.map((peca) => (
                      <tr
                        key={peca.id}
                        className="border-b border-zinc-200 hover:bg-zinc-50 last:border-0"
                      >
                        <td className="px-5 py-4 font-mono text-zinc-700">
                          {peca.reference}
                        </td>

                        <td className="px-5 py-4 font-bold text-black">
                          {peca.name}
                        </td>

                        <td className="px-5 py-4">
                          {peca.brand?.name}
                        </td>

                        <td className="px-5 py-4">
                          {peca.model?.name}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {peca.price !== null
                            ? `${peca.price.toFixed(2)} €`
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          {peca.stock}
                        </td>
                        <td className="px-5 py-4 text-right">
  <button
    type="button"
    onClick={() => handleDelete(peca.id)}
    className="font-bold text-red-600 hover:text-red-800 transition"
  >
    Eliminar
  </button>
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