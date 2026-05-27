import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#0a0a0a]">
      {/* Círculos luminosos de fondo animados */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-500/15 to-orange-400/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute right-10 bottom-10 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="z-10 text-center px-4 max-w-3xl">
        <h2 className="text-white/40 text-xs md:text-sm font-semibold tracking-[0.5em] uppercase mb-4 animate-pulse">
          Helados Artesanales Premium
        </h2>
        <h1 className="text-white text-5xl md:text-8xl font-black tracking-widest uppercase mb-6 leading-none">
          CREAMY
        </h1>
        <p className="text-white/60 text-base md:text-lg max-w-md mx-auto mb-10 font-light leading-relaxed">
          Descubre la experiencia de helados más exclusiva. Ingredientes 100% naturales, sabores únicos y la cremosidad perfecta en cada bocado.
        </p>
        <a
          href="#showcase"
          className="inline-block text-white border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 rounded-full uppercase tracking-widest text-xs font-semibold"
        >
          Explorar Sabores
        </a>
      </div>

      {/* Flecha indicadora de scroll */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase">Deslizar</span>
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};
