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

  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [condition, setCondition] = useState("Usado");
  const [description, setDescription] = useState("");

  // Usar uma Ref direta para o input de ficheiro
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

  async function criarPeca(e: React.FormEvent) {
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

      // Ler diretamente do DOM no momento do submit (Garante que apanha múltiplos ficheiros)
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append("images", fileInput.files[i]);
        }
      }

      const res = await fetch("/api/pecas", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar peça.");
      }

      setSucesso("Peça criada com sucesso!");
      setReference("");
      setName("");
      setPrice("");
      setDescription("");
      setBrandId("");
      setModelId("");
      setCategoryId("");
      
      // Limpar o input de ficheiro visualmente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      carregarTudo();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
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
          <h2 className="text-xl font-bold text-black mb-4">Adicionar Nova Peça</h2>

          {erro && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</div>}
          {sucesso && <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{sucesso}</div>}

          <form onSubmit={criarPeca} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Referência</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Nome da Peça</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500"
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
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500"
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
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500"
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
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500"
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
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Estado</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-red-500"
              >
                <option value="Usado">Usado</option>
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
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Imagens</label>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {carregando ? "A guardar..." : "Criar Peça"}
              </button>
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
                <div className="text-right">
                  <p className="font-bold text-black">{p.price !== null ? `${p.price} €` : "Sob consulta"}</p>
                  <p className="text-xs text-zinc-500">Imagens: {p.images?.length || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}