import React, { useState, useEffect } from 'react';
import { useViewTransition } from '../hooks/useViewTransition';

export const Navbar: React.FC = () => {
  const { navigate } = useViewTransition();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (to: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith('/')) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b py-4 px-6 md:px-12 ${
        isScrolled
          ? 'bg-black/60 border-white/10'
          : 'bg-transparent border-white/5'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Enlaces izquierdos */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase text-white/70">
          <a href="#showcase" className="hover:text-white transition-colors duration-200">Sabores</a>
          <a href="/products" onClick={handleNavigation('/products')} className="hover:text-white transition-colors duration-200">Catálogo</a>
          <a href="/clinic" onClick={handleNavigation('/clinic')} className="hover:text-white transition-colors duration-200">IceLab</a>
        </div>

        {/* Logo al centro */}
        <div className="flex-1 md:flex-none text-center">
          <a
            href="/"
            onClick={handleNavigation('/')}
            className="text-2xl md:text-3xl font-black tracking-[0.3em] text-white hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          >
            CREAMY
          </a>
        </div>

        {/* Enlaces y CTA derechos */}
        <div className="flex items-center gap-4 md:gap-8 text-sm font-medium tracking-widest uppercase text-white/70">
          <a href="#nosotros" className="hidden md:inline hover:text-white transition-colors duration-200">Nosotros</a>
          <a
            href="/checkout"
            onClick={handleNavigation('/checkout')}
            className="bg-white text-black font-bold px-6 py-2 rounded-full border border-transparent hover:bg-transparent hover:text-white hover:border-white transition-all duration-300 text-xs md:text-sm cursor-pointer"
          >
            ORDENAR
          </a>
        </div>
      </nav>
    </header>
  );
};
