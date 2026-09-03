import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logótipo / Imagem */}
        <div className="flex items-center">
          {/* Se usares imagem, mantém o teu código do logo aqui */}
          <span className="font-bold text-xl text-red-600">BRPEÇAS</span>
        </div>

        {/* Menu para Computador */}
        <nav className="hidden md:flex items-center space-x-6 font-medium text-gray-700">
          <a href="#pecas" className="hover:text-red-600 transition">Peças</a>
          <a href="#viaturas" className="hover:text-red-600 transition">Viaturas</a>
          <a href="#sobre" className="hover:text-red-600 transition">Sobre</a>
          <a href="#contactos" className="hover:text-red-600 transition">Contactos</a>
        </nav>

        {/* Botão do Menu Hambúrguer (Forçado para mobile com p-2 e fundo visível para teste) */}
        <div className="flex md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              // Ícone X (Fechar)
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Ícone Hambúrguer (3 Riscas)
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Móvel Expansível (Garante fundo branco sólido e largura total) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl py-4 px-6 space-y-4 z-50">
          <a 
            href="#pecas" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-lg font-medium text-gray-800 hover:text-red-600 border-b pb-2"
          >
            Peças
          </a>
          <a 
            href="#viaturas" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-lg font-medium text-gray-800 hover:text-red-600 border-b pb-2"
          >
            Viaturas
          </a>
          <a 
            href="#sobre" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-lg font-medium text-gray-800 hover:text-red-600 border-b pb-2"
          >
            Sobre
          </a>
          <a 
            href="#contactos" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block text-lg font-medium text-gray-800 hover:text-red-600"
          >
            Contactos
          </a>
        </div>
      )}
    </header>
  );
}