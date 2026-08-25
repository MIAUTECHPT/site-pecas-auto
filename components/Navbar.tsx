import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Página principal */}
        <Link href="/" className="font-bold text-xl hover:text-blue-400">
          MiauTech Peças
        </Link>

        {/* Links de navegação e admin */}
        <nav className="flex flex-wrap items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Página Principal
          </Link>
          <Link href="/admin" className="hover:text-blue-400 transition-colors">
            Peças (Admin)
          </Link>
          <Link href="/admin/salvados" className="hover:text-blue-400 transition-colors">
            Viaturas / Salvados
          </Link>
          <Link href="/admin/marcas" className="hover:text-blue-400 transition-colors">
            Marcas
          </Link>
        </nav>
      </div>
    </header>
  );
}