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
  brand: Brand;
};

export default function AdminModelosPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [nomeModelo, setNomeModelo] = useState("");
  const [brandIdSelecionada, setBrandIdSelecionada] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      const [resBrands, resModels] = await Promise.all([
        fetch("/api/marcas"),
        fetch("/api/modelos"),
      ]);

      if (resBrands.ok) setBrands(await resBrands.json());
      if (resModels.ok) setModels(await resModels.json());
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

 async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeModelo.trim() || !brandIdSelecionada) {
      setErro("Seleciona uma marca e escreve o nome do modelo.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nomeModelo,
          brandId: Number(brandIdSelecionada),
        }),
      });

      // Lê a resposta como texto primeiro para evitar o erro de JSON vazio
      const textResponse = await res.text();
      let data;
      try {
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (e) {
        throw new Error(`Erro do servidor (${res.status}): ${textResponse || "Resposta vazia"}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Erro ao criar modelo (Status ${res.status})`);
      }

      setNomeModelo("");
      setBrandIdSelecionada("");
      await carregarDados();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

      setNomeModelo("");
      setBrandIdSelecionada("");
      await carregarDados();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem a certeza absoluta de que pretende eliminar este modelo?")) return;

    try {
      const response = await fetch("/api/modelos", { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) throw new Error("Erro ao eliminar o modelo.");
      await carregarDados();
    } catch (error) {
      alert("Não foi possível eliminar o modelo.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-zinc-900">Gestão de Modelos</h1>
            <p className="text-sm text-zinc-600">Adicione e consulte os modelos associados às marcas.</p>
          </div>
          <a href="/admin/pecas" className="text-sm font-semibold text-red-600 hover:underline">
            ← Voltar às Peças
          </a>
        </div>

        {/* Formulário para adicionar */}
        <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Adicionar novo modelo</h2>
          
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <select
                value={brandIdSelecionada}
                onChange={(e) => setBrandIdSelecionada(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-red-500"
              >
                <option value="" className="text-zinc-500">Selecionar marca</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="text-zinc-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <input
                type="text"
                value={nomeModelo}
                onChange={(e) => setNomeModelo(e.target.value)}
                placeholder="Nome do modelo (ex: Série 3, A4...)"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 placeholder:text-zinc-500 outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "A adicionar..." : "Adicionar Modelo"}
              </button>
            </div>
          </form>

          {erro && <p className="mt-3 text-sm font-semibold text-red-600">{erro}</p>}
        </div>

        {/* Listagem de modelos */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-4">
            <h2 className="font-bold text-zinc-900">Modelos registados ({models.length})</h2>
          </div>

          <div className="divide-y divide-zinc-200">
            {models.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">Ainda não existem modelos registados.</p>
            ) : (
              models.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900">{m.name}</span>
                    <span className="text-xs rounded-md bg-zinc-100 px-2 py-1 font-semibold text-zinc-700 border border-zinc-200">
                      {m.brand?.name || "Marca desconhecida"}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 transition hover:bg-red-600 hover:text-white"
                  >
                    Eliminar Modelo
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}