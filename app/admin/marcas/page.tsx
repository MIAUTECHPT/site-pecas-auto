"use client";

import { useEffect, useState } from "react";

type Brand = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
};

export default function AdminMarcasPage() {
  const [marcas, setMarcas] = useState<Brand[]>([]);
  const [nomeMarca, setNomeMarca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarMarcas() {
    try {
      const res = await fetch("/api/marcas");
      if (res.ok) {
        const data = await res.json();
        setMarcas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar marcas:", error);
    }
  }

  useEffect(() => {
    carregarMarcas();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeMarca.trim()) return;

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nomeMarca }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar marca");
      }

      setNomeMarca("");
      carregarMarcas();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Gestão de Marcas</h1>
            <p className="text-sm text-zinc-500">Adicione e consulte as marcas disponíveis no sistema.</p>
          </div>
          <a href="/admin/salvados" className="text-sm font-semibold text-red-600 hover:underline">
            ← Voltar aos Salvados
          </a>
        </div>

        {/* Formulário para adicionar */}
        <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Adicionar nova marca</h2>
          
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={nomeMarca}
              onChange={(e) => setNomeMarca(e.target.value)}
              placeholder="Nome da marca (ex: BMW, Audi...)"
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "A adicionar..." : "Adicionar Marca"}
            </button>
          </form>

          {erro && <p className="mt-3 text-sm font-semibold text-red-600">{erro}</p>}
        </div>

        {/* Listagem de marcas */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="font-bold">Marcas registadas ({marcas.length})</h2>
          </div>

          <div className="divide-y divide-zinc-100">
            {marcas.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">Ainda não existem marcas registadas.</p>
            ) : (
              marcas.map((marca) => (
                <div key={marca.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <span className="font-bold">{marca.name}</span>
                    <span className="ml-3 text-xs text-zinc-400">slug: {marca.slug}</span>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    Ativa
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}