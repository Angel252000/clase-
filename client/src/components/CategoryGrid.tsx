import React, { useRef } from 'react';
import { Link } from 'react-router';
import { products } from '../data/products';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Detecta si el color es claro
const isLight = (hex: string) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

// Paleta CSS premium
const Popsicle: React.FC<{ color: string; size?: 'sm' | 'md' }> = ({ color, size = 'md' }) => {
  const light = isLight(color);
  const w = size === 'md' ? 'w-20 h-32' : 'w-14 h-22';
  const stickW = size === 'md' ? 'w-4 h-11' : 'w-3 h-8';

  return (
    <div className="flex flex-col items-center pointer-events-none select-none">
      <div
        className={`relative ${w} rounded-t-[50px] rounded-b-[12px] overflow-hidden`}
        style={{
          backgroundColor: color,
          boxShadow: light
            ? `0 24px 60px -12px rgba(0,0,0,0.2), inset 0 16px 35px rgba(255,255,255,0.6), inset -8px -16px 30px rgba(0,0,0,0.07)`
            : `0 24px 60px -12px ${color}90, inset 0 16px 35px rgba(255,255,255,0.22), inset -8px -16px 30px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Reflejo */}
        <div
          className="absolute top-0 left-3 w-3 h-full skew-x-3"
          style={{
            background: light
              ? 'linear-gradient(to right, rgba(255,255,255,0.7), rgba(255,255,255,0.2) 60%, transparent)'
              : 'linear-gradient(to right, rgba(255,255,255,0.5), rgba(255,255,255,0.1) 60%, transparent)',
          }}
        />
        {/* Sombra inferior interior */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Label CREAMY */}
        <div
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full"
          style={{
            background: light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
            border: light ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span
            className="text-[6px] font-black tracking-[0.3em] uppercase"
            style={{ color: light ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.9)' }}
          >CREAMY</span>
        </div>
      </div>
      {/* Palo */}
      <div
        className={`${stickW} -mt-1.5 rounded-b-full`}
        style={{
          background: 'linear-gradient(90deg, #b8835a 0%, #d4a373 35%, #e6b78a 55%, #d4a373 75%, #b8835a 100%)',
          boxShadow: 'inset 0 6px 10px rgba(0,0,0,0.45), 0 8px 18px -4px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  );
};

export const CategoryGrid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const cards = containerRef.current.querySelectorAll('[data-card]');
      gsap.fromTo(cards, 
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top center+=100',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 md:py-32 px-6 md:px-12 bg-[#0a0a0a]"
    >
      {/* Section Title */}
      <div className="max-w-7xl mx-auto mb-16">
        <span className="text-xs tracking-[0.5em] uppercase text-white/40 font-bold block mb-3">
          🍦 Catálogo Completo
        </span>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none mb-4">
          Nuestros <br />
          <span className="text-white/40">8 Sabores</span> Exclusivos
        </h2>
        <p className="text-white/60 text-base md:text-lg font-light max-w-2xl">
          Cada helado es una obra de arte, cuidadosamente formulado con ingredientes premium de origen único para deleitar tus sentidos.
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              data-card
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2"
              style={{
                background: `linear-gradient(135deg, ${product.theme}40 0%, ${product.theme}10 60%, #0a0a0a 100%)`,
              }}
            >
              {/* Badges */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                {product.isBestSeller && (
                  <span className="px-2 py-1 bg-amber-500/30 backdrop-blur-md border border-amber-500/40 text-amber-200 text-[9px] tracking-widest uppercase font-bold rounded-full">
                    ⭐ Best Seller
                  </span>
                )}
                {product.isNew && (
                  <span className="px-2 py-1 bg-emerald-500/30 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-[9px] tracking-widest uppercase font-bold rounded-full">
                    ✨ Nuevo
                  </span>
                )}
              </div>

              {/* Rating en esquina superior derecha */}
              {product.rating && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                  <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[10px] font-bold text-white">{product.rating}</span>
                </div>
              )}

              {/* Paleta CSS en el centro */}
              <div className="absolute inset-0 flex items-center justify-center pb-16">
                <div className="group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-44 object-contain"
                      style={{ filter: `drop-shadow(0 16px 40px ${product.theme}70)` }}
                    />
                  ) : (
                    <Popsicle color={product.theme} size="md" />
                  )}
                </div>
              </div>

              {/* Info inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-black tracking-wider uppercase text-lg md:text-xl leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-white/50 text-[10px] tracking-widest uppercase mt-1">
                      {product.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div>
                    <span className="text-[9px] tracking-widest uppercase text-white/40 block">Desde</span>
                    <span
                      className="text-2xl font-black"
                      style={{ color: product.theme }}
                    >
                      {product.price}
                    </span>
                  </div>

                  {/* CTA button */}
                  <div
                    className="px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-bold transition-all duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: product.theme,
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}
                  >
                    Ver →
                  </div>
                </div>
              </div>

              {/* Decorative gradient border on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${product.theme}30 0%, transparent 100%)`,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
