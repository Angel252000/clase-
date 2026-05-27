import React from 'react';
import type { Product } from '../data/products';

interface FlavorNavProps {
  products: Product[];
  activeIndex: number;
  onFlavorClick: (index: number) => void;
}

export const FlavorNav: React.FC<FlavorNavProps> = ({ products, activeIndex, onFlavorClick }) => {
  // Calcular el contraste basado en el color de fondo activo
  const activeTheme = products[activeIndex]?.theme || '#000000';
  const hex = activeTheme.replace("#", "");
  const r = parseInt(hex.substr(0,2), 16);
  const g = parseInt(hex.substr(2,2), 16);
  const b = parseInt(hex.substr(4,2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const isLightBg = yiq >= 128;

  return (
    <div className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6">
      {products.map((product, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={product.id}
            onClick={() => onFlavorClick(index)}
            className="group flex items-center gap-4 focus:outline-none"
            aria-label={`Ir al producto ${product.name}`}
          >
            {/* Línea indicadora vertical/horizontal */}
            <div 
              className={`h-1 rounded-full transition-all duration-500 ease-out ${
                isActive 
                  ? (isLightBg ? 'w-10 bg-black' : 'w-10 bg-white') 
                  : (isLightBg ? 'w-4 bg-black/20 group-hover:w-8 group-hover:bg-black/50' : 'w-4 bg-white/20 group-hover:w-8 group-hover:bg-white/50')
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
