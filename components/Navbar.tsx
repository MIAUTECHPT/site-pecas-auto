import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logótipo */}
        <div className="font-bold text-xl text-red-600">BRPEÇAS</div>

        {/* Menu para Computador (Oculto em telemóveis) */}
        <nav className="hidden md:flex items-center space-x-6 font-medium text-gray-700">
          <a href="#pecas" className="hover:text-red-600 transition">Peças</a>
          <a href="#viaturas" className="hover:text-red-600 transition">Viaturas</a>
          <a href="#sobre" className="hover:text-red-600 transition">Sobre</a>
          <a href="#contactos" className="hover:text-red-600 transition">Contactos</a>
        </nav>

        {/* Botão do Menu Hambúrguer (Visível apenas em telemóveis) */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 focus:outline-none p-2"
            aria-label="Abrir Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Móvel Expansível */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          <a 
            href="#pecas" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block py-2 text-gray-700 hover:text-red-600 font-medium border-b border-gray-50"
          >
            Peças
          </a>
          <a 
            href="#viaturas" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block py-2 text-gray-700 hover:text-red-600 font-medium border-b border-gray-50"
          >
            Viaturas
          </a>
          <a 
            href="#sobre" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block py-2 text-gray-700 hover:text-red-600 font-medium border-b border-gray-50"
          >
            Sobre
          </a>
          <a 
            href="#contactos" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block py-2 text-gray-700 hover:text-red-600 font-medium"
          >
            Contactos
          </a>
        </nav>
      )}
    </header>
  );
}