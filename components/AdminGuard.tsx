"use client";
import { useState, useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const logged = sessionStorage.getItem("admin_logged");
    if (logged === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "brpecas2026") {
      sessionStorage.setItem("admin_logged", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // Enquanto verifica o armazenamento, não mostra nada para evitar flash da página
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-800">
          <h2 className="text-xl font-bold mb-2 text-center">Área Reservada</h2>
          <p className="text-xs text-gray-400 mb-6 text-center">Introduza a palavra-passe para gerir o site.</p>
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 mb-4 text-white focus:outline-none focus:border-red-500"
          />
          {error && <p className="text-red-400 text-xs mb-4 text-center">Palavra-passe incorreta.</p>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-medium transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}