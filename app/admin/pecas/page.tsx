"use client";

import { useEffect, useState, useRef } from "react";

type Brand = { id: number; name: string };
type CarModel = { id: number; name: string; brandId: number };
type Category = { id: number; name: string };

type Part = {
  id: number;
  reference: string;
  name: string;
  price: number | null;
  stock: number;
  condition: string | null;
  description?: string | null;
  brand: Brand;
  model: CarModel;
  category: Category | null;
  images: { id: number; url: string }[];
};

export default function AdminPecasPage() {
  const [pecas, setPecas] = useState<Part[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [condition, setCondition] = useState("Usado");
  const [description, setDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarTudo() {
    try {
      const [pRes, bRes, mRes, cRes] = await Promise.all([
        fetch("/api/pecas"),
        fetch("/api/marcas"),
        fetch("/api/modelos"),
        fetch("/api/categorias"),
      ]);
      if (pRes.ok) setPecas(await pRes.json());
      if (bRes.ok) setBrands(await bRes.json());
      if (mRes.ok) setModels(await mRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function iniciarEdicao(p: Part) {
    setEditingId(p.id);
    setReference(p.reference || "");
    setName(p.name || "");
    setBrandId(p.brand?.id ? String(p.brand.id) : "");
    setModelId(p.model?.id ? String(p.model.id) : "");
    setCategoryId(p.category?.id ? String(p.category.id) : "");
    setPrice(p.price !== null ? String(p.price) : "");
    setStock(String(p.stock ?? 1));
    setCondition(p.condition || "Usado");
    setDescription(p.description || "");
    setErro("");
    setSucesso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditingId(null);
    setReference("");
    setName("");
    setBrandId("");
    setModelId("");
    setCategoryId("");
    setPrice("");
    setStock("1");
    setCondition("Usado");
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErro("");
    setSucesso("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    setSucesso("");

    try {
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("name", name);
      formData.append("brandId", brandId);
      formData.append("modelId", modelId);
      if (categoryId) formData.append("categoryId", categoryId);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("condition", condition);
      if (description) formData.append("description", description);

      if (fileInputRef.current && fileInputRef.current.files) {
        const files = fileInputRef.current.files;
        for (let i = 0; i < files.length; i++) {
          formData.append("images", files[i]);
        }
      }

      const url = editingId ? `/api/pecas/${editingId}` : "/api/pecas";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || (editingId ? "Erro ao atualizar peça." : "Erro ao criar peça."));
      }

      setSucesso(editingId ? "Peça atualizada com sucesso!" : "Peça criada com sucesso!");
      cancelarEdicao();
      carregarTudo();
    } catch (err: any) {
      setErro(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem a certeza de que pretende eliminar esta peça?")) return;

    try {
      const res = await fetch(`/api/pecas/${id}`, {
        method: "DELETE",
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "Erro ao eliminar a peça.");
      }

      carregarTudo();
    } catch (err: any) {
      alert(err.message || "Não foi possível eliminar a peça.");
    }
  }

  const modelosFiltrados = brandId
    ? models.filter((m) => m.brandId === Number(brandId))
    : models;

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <a href="/admin" className="text-sm font-medium text-red-600 hover:underline">
            ← Voltar ao painel
          </a>
          <h1 className="mt-2 text-3xl font-bold text-black">Gerir Peças</h1>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">
              {editingId ? "Editar Peça" : "Adicionar Nova Peça"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-700"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          {erro && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</div>}
          {sucesso && <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{sucesso}</div>}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Referência</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Nome da Peça</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Marca</label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setModelId("");
                }}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500 text-black"
              >
                <option value="">Selecione a marca</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Modelo</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500 text-black"
              >
                <option value="">Selecione o modelo</option>
                {modelosFiltrados.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500 text-black"
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Preço (€)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Estado</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500 text-black"
              >
                <option value="Usado">Usado</option>
                <option value="Muito bom">Muito bom</option>
                <option value="Bom">Bom</option>
                <option value="Para reparar">Para reparar</option>
                <option value="Novo">Novo</option>
                <option value="Recondicionado">Recondicionado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500 text-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Imagens</label>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 text-black"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={carregando}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {carregando ? "A guardar..." : editingId ? "Atualizar Peça" : "Criar Peça"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="rounded-xl border border-zinc-300 bg-white px-5 py-3 font-bold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-4">Peças Existentes ({pecas.length})</h2>
          <div className="divide-y divide-zinc-100">
            {pecas.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-black">{p.name} <span className="text-xs font-mono text-zinc-500">({p.reference})</span></p>
                  <p className="text-xs text-zinc-500">{p.brand?.name} - {p.model?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-black">{p.price !== null ? `${p.price} €` : "Sob consulta"}</p>
                    <p className="text-xs text-zinc-500">Imagens: {p.images?.length || 0}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => iniciarEdicao(p)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}