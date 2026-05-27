import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useViewTransition } from '../hooks/useViewTransition';
import type { Product } from '../data/products';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Función para determinar si un color hexadecimal es claro u oscuro
const getContrastYIQ = (hexcolor: string) => {
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substr(0,2), 16);
  const g = parseInt(hex.substr(2,2), 16);
  const b = parseInt(hex.substr(4,2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'dark-text' : 'light-text';
};

interface ScrollShowcaseProps {
  products: Product[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const ScrollShowcase: React.FC<ScrollShowcaseProps> = ({ products, activeIndex, setActiveIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const { navigate } = useViewTransition();

  // Crear referencias para cada elemento para animarlos por separado
  const iceCreamsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgTextsRef = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current || !pinRef.current) return;

    // Calcular duración total basado en cantidad de productos
    const transitionDuration = 1.5;
    const totalScrollDistance = products.length * 800; // 800px por producto

    // Crear Timeline de GSAP coordinado con el scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        id: "showcaseTrigger",
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalScrollDistance}`,
        scrub: 1,
        pin: pinRef.current,
        pinSpacing: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalDuration = (products.length - 1) * 1.5;
          const time = progress * totalDuration;
          const index = Math.round(time / 1.5);
          setActiveIndex(index);
        }
      }
    });

    // Configurar estados iniciales
    products.forEach((_, index) => {
      if (index === 0) {
        // El primer producto es visible al inicio
        gsap.set(iceCreamsRef.current[index], { scale: 1, opacity: 1, rotateY: 0, z: 0 });
        gsap.set(bgTextsRef.current[index], { y: 0, opacity: 0.08 });
        gsap.set(detailsRef.current[index], { y: 0, opacity: 1 });
      } else {
        // Los demás están ocultos y escalados
        gsap.set(iceCreamsRef.current[index], { scale: 0.6, opacity: 0, rotateY: 25, z: -200 });
        gsap.set(bgTextsRef.current[index], { y: 150, opacity: 0 });
        gsap.set(detailsRef.current[index], { y: 50, opacity: 0 });
      }
    });

    // Construir la animación paso a paso con "holds" de estabilidad
    for (let i = 0; i < products.length - 1; i++) {
      const current = i;
      const next = i + 1;

      const startOfTransition = i * transitionDuration + 0.3;
      const duration = 0.9;

      // Transición hacia el siguiente sabor de fondo
      tl.to(pinRef.current, {
        backgroundColor: products[next].theme,
        duration: duration,
        ease: "power2.inOut"
      }, startOfTransition)
      
      // Salida del producto actual
      .to(iceCreamsRef.current[current], {
        scale: 0.5,
        opacity: 0,
        rotateY: -30,
        z: -300,
        duration: duration * 0.8,
        ease: "power2.in"
      }, startOfTransition)
      .to(bgTextsRef.current[current], {
        y: -200,
        opacity: 0,
        duration: duration * 0.8,
        ease: "power2.in"
      }, startOfTransition)
      .to(detailsRef.current[current], {
        y: -80,
        opacity: 0,
        duration: duration * 0.7,
        ease: "power2.in"
      }, startOfTransition)

      // Entrada del siguiente producto
      .to(iceCreamsRef.current[next], {
        scale: 1,
        opacity: 1,
        rotateY: 0,
        z: 0,
        duration: duration,
        ease: "power2.out"
      }, startOfTransition + 0.1)
      .to(bgTextsRef.current[next], {
        y: 0,
        opacity: 0.08,
        duration: duration,
        ease: "power2.out"
      }, startOfTransition + 0.1)
      .to(detailsRef.current[next], {
        y: 0,
        opacity: 1,
        duration: duration * 0.9,
        ease: "power2.out"
      }, startOfTransition + 0.2);
    }

  }, { scope: containerRef });

  return (
    <div ref={containerRef} id="showcase" className="relative w-full select-none">
      {/* Contenedor Pinedo de 100vh */}
      <div 
        ref={pinRef} 
        className="relative w-full h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ease-out"
        style={{ 
          backgroundColor: products[0].theme,
          perspective: "1000px" // Efecto de profundidad 3D
        }}
      >
        {/* Renderizado de todos los productos encima de forma absoluta */}
        {products.map((product, index) => {
          const isLightBg = getContrastYIQ(product.theme) === 'dark-text';

          return (
          <div
            key={product.id}
            className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-center px-6 md:px-24 ${index !== activeIndex ? 'pointer-events-none' : ''}`}
          >
            {/* Texto gigante de fondo con parallax */}
            <div 
              ref={el => { bgTextsRef.current[index] = el; }}
              className={`absolute text-[22vw] font-black tracking-widest leading-none pointer-events-none uppercase select-none font-sans ${isLightBg ? 'text-black' : 'text-white'}`}
              style={{ willChange: 'transform, opacity' }}
            >
              {product.bgText}
            </div>

            {/* Estructura de Paleta de Helado 3D */}
            <div 
              ref={el => { iceCreamsRef.current[index] = el; }}
              className="z-20 flex flex-col items-center pointer-events-none"
              style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
            >
              {/* Cuerpo del Helado (Popsicle) */}
              <div 
                className={`w-[180px] md:w-[220px] h-[280px] md:h-[320px] rounded-t-[100px] rounded-b-[30px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center border ${isLightBg ? 'border-black/10' : 'border-white/20'}`}
                style={{ 
                  backgroundColor: product.theme,
                  boxShadow: isLightBg 
                    ? `0 25px 50px -12px rgba(0,0,0,0.3), inset 0 20px 40px rgba(255,255,255,0.6), inset -10px -20px 40px rgba(0,0,0,0.1)`
                    : `0 25px 50px -12px rgba(0,0,0,0.5), inset 0 20px 40px rgba(255,255,255,0.3), inset -10px -20px 40px rgba(0,0,0,0.4)`
                }}
              >
                {/* Reflejo brillante de la capa exterior */}
                <div className={`absolute top-0 left-4 w-8 h-full bg-gradient-to-r skew-x-12 pointer-events-none ${isLightBg ? 'from-white/60 via-white/20 to-transparent' : 'from-white/40 via-white/10 to-transparent'}`} />
                
                {/* Detalles de textura suave */}
                <div className="w-full h-full absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Etiqueta Minimalista de la marca */}
                <div className={`z-10 mt-16 backdrop-blur-md px-6 py-3 rounded-full border shadow-lg ${isLightBg ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'}`}>
                  <span className={`text-[10px] tracking-[0.4em] uppercase font-bold drop-shadow-md ${isLightBg ? 'text-black/80' : 'text-white'}`}>CREAMY</span>
                </div>
              </div>

              {/* Palito de madera */}
              <div 
                className="w-10 md:w-12 h-20 md:h-28 rounded-b-full relative -mt-4 z-[-1]"
                style={{ 
                  backgroundColor: '#d4a373', // Color base madera
                  backgroundImage: 'linear-gradient(90deg, #c2915c 0%, #d4a373 30%, #e6b78a 50%, #d4a373 70%, #c2915c 100%)',
                  boxShadow: `inset 0 10px 15px rgba(0,0,0,0.5), 0 15px 25px -5px rgba(0,0,0,0.4)`
                }}
              />
            </div>

            {/* Detalles del producto */}
            <div 
              ref={el => { detailsRef.current[index] = el; }}
              className="absolute bottom-16 md:bottom-24 left-6 md:left-24 z-30 max-w-sm text-left px-4 md:px-0"
              style={{ willChange: 'transform, opacity' }}
            >
              <span className={`text-xs md:text-sm font-semibold tracking-widest uppercase block mb-2 ${isLightBg ? 'text-black/60' : 'text-white/40'}`}>
                {product.tagline}
              </span>
              <h2 className={`text-3xl md:text-5xl font-black tracking-wider uppercase mb-3 leading-none drop-shadow-lg ${isLightBg ? 'text-black' : 'text-white'}`}>
                {product.name}
              </h2>
              <p className={`text-xs md:text-sm font-light leading-relaxed mb-6 drop-shadow-md ${isLightBg ? 'text-black/80' : 'text-white/80'}`}>
                {product.description}
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl md:text-4xl font-black drop-shadow-md ${isLightBg ? 'text-black' : 'text-white'}`}>{product.price}</span>
                  {product.size && (
                    <span className={`text-xs ${isLightBg ? 'text-black/60' : 'text-white/60'}`}>/ {product.size}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className={`backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer ${
                      isLightBg 
                        ? 'bg-black/5 text-black border border-black/20 hover:bg-black hover:text-white' 
                        : 'bg-white/10 text-white border border-white/30 hover:bg-white hover:text-black'
                    }`}
                  >
                    VER 3D
                  </button>
                  <button
                    onClick={() => navigate(`/checkout?flavor=${product.id}`)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer ${
                      isLightBg
                        ? 'bg-black text-white hover:bg-transparent hover:text-black border border-transparent hover:border-black/30'
                        : 'bg-white text-black hover:bg-transparent hover:text-white border border-transparent hover:border-white/30'
                    }`}
                  >
                    ORDENAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};
