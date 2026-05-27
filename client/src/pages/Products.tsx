import React from 'react';
import { Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CategoryGrid } from '../components/CategoryGrid';

export const Products: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-4 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-8">
          <Link to="/" className="hover:text-white/60 transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-white/60">Catálogo</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none mb-4">
          Todos los <br />
          <span className="text-white/30">Sabores</span>
        </h1>
        <p className="text-white/50 text-base md:text-lg font-light max-w-xl">
          8 helados artesanales. Ingredientes premium. Cada uno, una obra maestra.
        </p>
      </div>

      {/* Grid completo */}
      <CategoryGrid />

      <Footer />
    </div>
  );
};
