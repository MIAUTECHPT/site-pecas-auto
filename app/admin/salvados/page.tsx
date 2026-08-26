"use client";

import { useEffect, useState } from "react";

type Brand = { id: number; name: string };
type CarModel = { id: number; name: string; brandId: number };

type Salvage = {
  id: number;
  reference: string;
  title: string;
  year: number | null;
  kilometers: number | null;
  price: number | null;
  status: string;
  brand: Brand;
  model: CarModel;
};

export default function SalvadosAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [salvados, setSalvados] = useState<Salvage[]>([]);

  const [form, setForm] = useState({
    reference: "",
    title: "",
    brandId: "",
    modelId: "",
    year: "",
    kilometers: "",
    price: "",
    description: "",
  });

  const [imagens, setImagens] = useState<FileList | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [brandsRes, modelsRes, salvagesRes] = await Promise.all([
        fetch("/api/marcas"),
        fetch("/api/modelos"),
        fetch("/api/salvados"),
      ]);

      if (brandsRes.ok) setBrands(await brandsRes.json());
      if (modelsRes.ok) setModels(await modelsRes.json());
      if (salvagesRes.ok) {
        const data = await salvagesRes.json();
        setSalvados(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os dados.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const modelosDisponiveis = models.filter((m) => m.brandId === Number(form.brandId));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    setAGuardar(true);

    try {
      const formData = new FormData();
      formData.append("reference", form.reference);
      formData.append("title", form.title);
      formData.append("brandId", form.brandId);
      formData.append("modelId", form.modelId);
      formData.append("year", form.year);
      formData.append("kilometers", form.kilometers);
      formData.append("price", form.price);
      formData.append("description", form.description);

      if (imagens) {
        for (let i = 0; i < imagens.length; i++) {
          formData.append("images", imagens[i]);
        }
      }

      const response = await fetch("/api/salvados", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao guardar o salvado.");
      }

      setMensagem("Salvado guardado com sucesso.");
      setForm({
        reference: "",
        title: "",
        brandId: "",
        modelId: "",
        year: "",
        kilometers: "",
        price: "",
        description: "",
      });
      setImagens(null);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao guardar.");
    } finally {
      setAGuardar(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem a certeza de que pretende eliminar este salvado?")) return;

    try {
      const response = await fetch(`/api/salvados/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao eliminar.");
      await carregarDados();
    } catch (error) {
      alert("Não foi possível eliminar o salvado.");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <a href="/admin" className="text-sm font-medium text-red-600 hover:underline">← Voltar ao painel</a>
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-red-600">Administração</p>
          <h1 className="mt-2 text-4xl font-bold text-black">Gerir Salvados</h1>
          <p className="mt-2 text-zinc-600">Adicione e gere os veículos salvados disponíveis.</p>
        </div>

        {mensagem && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-700">{mensagem}</div>}
        {erro && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">{erro}</div>}

        <form onSubmit={handleSubmit} className="mb-12 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-black text-zinc-900">Novo salvado</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Referência *</label>
              <input name="reference" value={form.reference} onChange={handleChange} placeholder="Ex.: SALV-001" required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Título / Descrição Curta *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Ex.: BMW 320d Para Peças" required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Marca *</label>
              <select name="brandId" value={form.brandId} onChange={handleChange} required className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950">
                <option value="" className="text-zinc-500">Selecionar marca</option>
                {brands.map((b) => <option key={b.id} value={b.id} className="text-zinc-900">{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Modelo *</label>
              <select name="modelId" value={form.modelId} onChange={handleChange} required disabled={!form.brandId} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400">
                <option value="" className="text-zinc-500">{form.brandId ? "Selecionar modelo" : "Escolher primeiro a marca"}</option>
                {modelosDisponiveis.map((m) => <option key={m.id} value={m.id} className="text-zinc-900">{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Ano</label>
              <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="Ex.: 2020" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Quilómetros</label>
              <input name="kilometers" type="number" value={form.kilometers} onChange={handleChange} placeholder="Ex.: 145000" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="mb-2 block font-semibold text-zinc-900">Preço (€)</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="Ex.: 4500.00" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none focus:border-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold text-zinc-900">Fotografias do veículo</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImagens(e.target.files)} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 file:mr-4 file:rounded-lg file:border-0 file:bg-red-50 file:px-4 file:py-2 file:font-semibold file:text-red-700 hover:file:bg-red-100" />
            </div>
          </div>
          <button type="submit" disabled={aGuardar} className="mt-8 rounded-xl bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-50">
            {aGuardar ? "A guardar..." : "Guardar salvado"}
          </button>
        </form>

        <section>
          <h2 className="mb-5 text-2xl font-black text-zinc-900">Salvados existentes</h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {salvados.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Ainda não existem salvados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-100 font-bold text-zinc-900">
                    <tr>
                      <th className="px-5 py-4">Ref.</th>
                      <th className="px-5 py-4">Título</th>
                      <th className="px-5 py-4">Marca / Modelo</th>
                      <th className="px-5 py-4">Ano / KM</th>
                      <th className="px-5 py-4">Preço</th>
                      <th className="px-5 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-zinc-900">
                    {salvados.map((s) => (
                      <tr key={s.id} className="border-b border-zinc-200 hover:bg-zinc-50 last:border-0">
                        <td className="px-5 py-4 font-mono text-zinc-700">{s.reference}</td>
                        <td className="px-5 py-4 font-bold text-black">{s.title}</td>
                        <td className="px-5 py-4">{s.brand?.name} {s.model?.name}</td>
                        <td className="px-5 py-4">{s.year || "—"} / {s.kilometers ? `${s.kilometers} km` : "—"}</td>
                        <td className="px-5 py-4 font-semibold">{s.price !== null ? `${s.price.toFixed(2)} €` : "—"}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => handleDelete(s.id)} className="font-bold text-red-600 hover:text-red-800 transition">
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