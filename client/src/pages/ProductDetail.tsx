import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { products } from '../data/products';
import { ProductModel3D } from '../components/ProductModel3D';

// ── Mini paleta CSS (para las tarjetas de productos relacionados) ──
const MiniPopsicle: React.FC<{ color: string }> = ({ color }) => {
  const light = (() => {
    const h = color.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
  })();

  return (
    <div className="flex flex-col items-center select-none pointer-events-none">
      {/* Cuerpo de la paleta */}
      <div
        className="relative w-16 h-24 rounded-t-[40px] rounded-b-[10px] overflow-hidden"
        style={{
          backgroundColor: color,
          boxShadow: light
            ? `0 20px 50px -10px rgba(0,0,0,0.25), inset 0 12px 30px rgba(255,255,255,0.55), inset -6px -12px 25px rgba(0,0,0,0.08)`
            : `0 20px 50px -10px ${color}80, inset 0 12px 30px rgba(255,255,255,0.25), inset -6px -12px 25px rgba(0,0,0,0.35)`,
        }}
      >
        {/* Reflejo brillante lateral */}
        <div
          className="absolute top-0 left-2.5 w-2.5 h-full skew-x-3"
          style={{
            background: light
              ? 'linear-gradient(to right, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 60%, transparent 100%)'
              : 'linear-gradient(to right, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)',
          }}
        />
        {/* Textura oscura en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/15 to-transparent" />
        {/* Badge "CREAMY" */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full"
          style={{
            background: light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
            border: light ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span
            className="text-[5px] font-black tracking-[0.25em] uppercase"
            style={{ color: light ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }}
          >CREAMY</span>
        </div>
      </div>
      {/* Palo de madera */}
      <div
        className="w-3.5 h-9 -mt-1 rounded-b-full"
        style={{
          background: 'linear-gradient(90deg, #b8835a 0%, #d4a373 35%, #e6b78a 55%, #d4a373 75%, #b8835a 100%)',
          boxShadow: 'inset 0 6px 10px rgba(0,0,0,0.45), 0 8px 16px -4px rgba(0,0,0,0.35)',
        }}
      />
    </div>
  );
};

// Detecta si el color es claro (necesita texto oscuro)
const isLightColor = (hex: string) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

// ── Componente imagen con efecto 3D por mouse ──
const ProductImageViewer: React.FC<{ src: string; productName: string; theme: string }> = ({
  src, productName, theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imgRef.current.style.transform = `perspective(800px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale(1.04)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (imgRef.current) {
      imgRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow behind image */}
      <div
        className="absolute w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none"
        style={{ backgroundColor: theme }}
      />

      <img
        ref={imgRef}
        src={src}
        alt={productName}
        className="relative z-10 w-full h-full object-contain max-h-[500px] drop-shadow-2xl"
        style={{
          transition: 'transform 0.15s ease-out',
          filter: `drop-shadow(0 30px 60px ${theme}80)`,
        }}
        draggable={false}
      />

      {/* Control axis labels */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Top center — Control Y */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
          <span className="text-[9px] tracking-widest uppercase font-bold text-white">Control Y ↑</span>
        </div>
        {/* Left center — Control Y */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">
          <span className="text-[9px] tracking-widest uppercase font-bold text-white writing-mode-vertical">← Control Y</span>
        </div>
        {/* Right center — Control X */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
          <span className="text-[9px] tracking-widest uppercase font-bold text-white">Control X →</span>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 text-center whitespace-nowrap">
          ← Arrastra para rotar en 3D y verticalmente ↓
        </p>
        <p className="text-[8px] tracking-widest uppercase text-white/25 text-center">
          Con inercia y auto-resume
        </p>
      </div>
    </div>
  );
};


export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  // Slide interaction: when user clicks/drags the 3D, model shifts left
  // and a quick-purchase panel slides in from the right
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);

  const product = products.find((p) => p.id === id);
  const relatedProducts = products.filter((p) => p.id !== id).slice(0, 4);

  // ── Auto-scroll to top whenever the product changes ──────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setQuickBuyOpen(false); // reset panel when switching products
    setQuantity(1);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🍦</div>
          <h1 className="text-4xl font-black tracking-widest uppercase mb-4">Sabor No Encontrado</h1>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            El helado que buscas no está en nuestro catálogo.
          </p>
          <Link to="/" className="inline-block bg-white text-black hover:bg-transparent hover:text-white border border-transparent hover:border-white px-8 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-300">
            Ver Todos los Sabores
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = product.priceNumber * quantity;
  const lightBg = isLightColor(product.theme);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ── Background glows ── */}
      <div
        className="fixed w-[800px] h-[800px] rounded-full blur-[200px] opacity-15 pointer-events-none -top-40 -right-40 transition-all duration-700"
        style={{ backgroundColor: product.theme }}
      />
      <div
        className="fixed w-[500px] h-[500px] rounded-full blur-[160px] opacity-8 pointer-events-none bottom-0 left-0 transition-all duration-700"
        style={{ backgroundColor: product.theme }}
      />

      {/* ── Header ── */}
      <header className="relative z-20 w-full py-5 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="text-xl font-black tracking-[0.3em] hover:opacity-70 transition-opacity">
          CREAMY
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </header>

      {/* ── Main 2-col layout ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ═══ LEFT — 3D Viewer con interacción slide ═══ */}
          <div className="lg:sticky lg:top-8">

            {/* Contenedor con overflow hidden para el slide */}
            <div className="relative w-full aspect-square rounded-[28px] overflow-hidden border border-white/10"
              style={{ background: `radial-gradient(ellipse at center, ${product.theme}18 0%, #0d0d0d 70%)` }}
            >
              {/* ── Modelo 3D / Imagen — se desplaza a la izquierda al abrir ── */}
              <div
                className={`absolute inset-0 transition-transform duration-500 ease-out ${quickBuyOpen ? '-translate-x-[42%] scale-90' : 'translate-x-0 scale-100'}`}
              >
                {product.image ? (
                  <ProductImageViewer src={product.image} productName={product.name} theme={product.theme} />
                ) : (
                  <ProductModel3D product={product} autoRotate={!quickBuyOpen} />
                )}

                {/* Hint de rotación (solo visible cuando panel está cerrado) */}
                {!quickBuyOpen && (
                  <div className="absolute inset-0 pointer-events-none select-none">
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 opacity-20">
                      <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-white">Control Y ↑</span>
                    </div>
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20">
                      <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-white [writing-mode:vertical-rl] rotate-180">Y</span>
                    </div>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20">
                      <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-white [writing-mode:vertical-rl]">X</span>
                    </div>
                    <div className="absolute inset-8 rounded-full border border-white/5" />
                    <div className="absolute inset-16 rounded-full border border-white/[0.03]" />
                  </div>
                )}
              </div>

              {/* ── Botón "Ordenar" flotante — aparece al hacer click en el 3D ── */}
              {!quickBuyOpen && (
                <button
                  onClick={() => setQuickBuyOpen(true)}
                  className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-100"
                  style={{
                    background: `${product.theme}30`,
                    border: `1px solid ${product.theme}50`,
                    color: product.theme,
                    boxShadow: `0 8px 24px ${product.theme}30`,
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ordenar ahora
                </button>
              )}

              {/* ── Panel de compra rápida — slide desde la derecha ── */}
              <div
                className={`absolute inset-y-0 right-0 w-[58%] flex flex-col justify-between p-5 transition-all duration-500 ease-out ${quickBuyOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.97) 0%, rgba(18,18,18,0.98) 100%)', backdropFilter: 'blur(20px)', borderLeft: `1px solid ${product.theme}30` }}
              >
                {/* Cerrar */}
                <button
                  onClick={() => setQuickBuyOpen(false)}
                  className="self-end w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all text-sm font-bold"
                >×</button>

                {/* Info del producto */}
                <div className="flex-1 flex flex-col justify-center gap-4 py-2">
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase font-bold mb-0.5" style={{ color: product.theme }}>
                      {product.tagline}
                    </p>
                    <h3 className="text-xl font-black tracking-wide uppercase text-white leading-tight">
                      {product.name}
                    </h3>
                  </div>

                  {/* Precio */}
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-white/35 font-bold mb-0.5">Precio</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black" style={{ color: product.theme }}>₡{product.priceNumber}</span>
                      <span className="text-xs text-white/40 font-semibold">CRC</span>
                    </div>
                    {product.size && <p className="text-[10px] text-white/30 mt-0.5">Por {product.size}</p>}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-white/35 font-bold mb-2">Cantidad</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition-colors text-sm"
                      >−</button>
                      <span className="text-lg font-black w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(20, q + 1))}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition-colors text-sm"
                      >+</button>
                    </div>
                    {quantity > 1 && (
                      <p className="text-[10px] text-white/40 mt-1">
                        Total: <span className="font-black" style={{ color: product.theme }}>₡{product.priceNumber * quantity}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={`/checkout?flavor=${product.id}`}
                  className="w-full py-3 rounded-xl text-xs font-black tracking-widest uppercase text-center transition-all duration-300 hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
                  style={{
                    background: product.theme,
                    color: isLightColor(product.theme) ? '#000' : '#fff',
                    boxShadow: `0 8px 24px ${product.theme}50`,
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ordenar — ₡{product.priceNumber * quantity}
                </Link>
              </div>

              {/* Dots de posición + hint cuando cerrado */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full z-10" style={{ backgroundColor: product.theme, boxShadow: `0 0 10px ${product.theme}` }} />
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full z-10" style={{ backgroundColor: product.theme, boxShadow: `0 0 10px ${product.theme}` }} />

              {/* Hint "toca para ordenar" cuando cerrado */}
              {!quickBuyOpen && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                  <p className="text-[9px] tracking-widest uppercase text-white/30 text-center font-bold">← Arrastra para rotar →</p>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {product.isBestSeller && (
                <span className="px-4 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] tracking-widest uppercase font-bold rounded-full">⭐ Best Seller</span>
              )}
              {product.isNewProduct && (
                <span className="px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] tracking-widest uppercase font-bold rounded-full">✨ Nuevo</span>
              )}
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/50 text-[10px] tracking-widest uppercase font-bold rounded-full">100% Natural</span>
            </div>
          </div>

          {/* ═══ RIGHT — Product Info ═══ */}
          <div className="flex flex-col pt-2 lg:pt-8 space-y-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-white/30 font-bold">
              <Link to="/" className="hover:text-white/60 transition-colors">Inicio</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-white/60 transition-colors">Sabores</Link>
              <span>/</span>
              <span style={{ color: product.theme }}>{product.name}</span>
            </div>

            {/* Tagline + Name + Rating */}
            <div className="space-y-2">
              <span
                className="text-xs font-bold tracking-[0.3em] uppercase block"
                style={{ color: product.theme }}
              >
                {product.tagline}
              </span>

              <h1 className="text-6xl md:text-7xl font-black tracking-tight uppercase leading-[0.9] text-white">
                {product.name}
              </h1>

              {product.rating && (
                <div className="flex items-center gap-2.5 pt-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(product.rating!) ? 'text-amber-400' : 'text-white/15'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">{product.rating}</span>
                  <span className="text-sm text-white/40">({product.reviewsCount} reseñas)</span>
                </div>
              )}
            </div>

            {/* ── Price card ── */}
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: `${product.theme}12`,
                borderColor: `${product.theme}30`,
              }}
            >
              <div className="flex items-end justify-between gap-4 flex-wrap">
                {/* Price */}
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold block mb-1">
                    Precio Unitario
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-5xl md:text-6xl font-black leading-none"
                      style={{ color: product.theme }}
                    >
                      ₡{product.priceNumber}
                    </span>
                    <span className="text-lg font-semibold text-white/50">CR</span>
                  </div>
                  {product.size && (
                    <span className="text-xs text-white/40 mt-0.5 block">Por {product.size}</span>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold">Cantidad</span>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-base font-bold transition-colors"
                    >−</button>
                    <span className="w-8 text-center font-black text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(20, quantity + 1))}
                      className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center text-base font-bold transition-colors"
                    >+</button>
                  </div>
                  {quantity > 1 && (
                    <span className="text-xs text-white/40">{quantity} uds = <span className="font-bold" style={{ color: product.theme }}>₡{totalPrice} CR</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/65 text-sm md:text-base font-light leading-relaxed">
              {product.description}
            </p>

            {/* Origin + Size chips */}
            <div className="grid grid-cols-2 gap-3">
              {product.origin && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-[9px] tracking-widest uppercase text-white/35 font-bold block mb-0.5">Origen</span>
                  <span className="text-sm font-semibold text-white">{product.origin}</span>
                </div>
              )}
              {product.size && (
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-[9px] tracking-widest uppercase text-white/35 font-bold block mb-0.5">Tamaño</span>
                  <span className="text-sm font-semibold text-white">{product.size}</span>
                </div>
              )}
            </div>

            {/* ── CTA row ── */}
            <div className="flex items-center gap-3 pt-1">
              {/* Main CTA */}
              <Link
                to={`/checkout?flavor=${product.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-100"
                style={{
                  backgroundColor: product.theme,
                  color: lightBg ? '#000' : '#fff',
                  boxShadow: `0 12px 40px ${product.theme}50`,
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ordenar — ₡{totalPrice}
              </Link>

              {/* Asesoría */}
              <Link
                to="/clinic"
                className="flex items-center gap-2 px-5 py-4 rounded-2xl text-xs font-bold tracking-widest uppercase border border-white/15 hover:border-white/30 text-white/70 hover:text-white transition-all duration-300"
              >
                <span>✦</span>
                Asesoría
              </Link>

              {/* Sparkle decoration */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border text-xl flex-shrink-0"
                style={{
                  borderColor: `${product.theme}40`,
                  background: `${product.theme}10`,
                  color: product.theme,
                }}
              >
                ✦
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] text-white/30 font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1.5"><span>🔒</span> Pago seguro</span>
              <span className="text-white/15">|</span>
              <span className="flex items-center gap-1.5"><span>🚚</span> Envío gratis</span>
              <span className="text-white/15">|</span>
              <span className="flex items-center gap-1.5"><span>❄️</span> Cadena de frío</span>
            </div>

            {/* ── Info panels (ingredients, benefits, nutrition) ── */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">

              {/* Ingredients */}
              {product.ingredients && (
                <details className="group bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: `${product.theme}25` }}
                      >🌿</span>
                      <span className="text-sm font-bold tracking-widest uppercase">Ingredientes</span>
                    </div>
                    <svg className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 pt-1">
                    <ul className="space-y-1.5">
                      {product.ingredients.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: product.theme }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}

              {/* Benefits */}
              {product.benefits && (
                <details className="group bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: `${product.theme}25` }}
                      >💚</span>
                      <span className="text-sm font-bold tracking-widest uppercase">Beneficios</span>
                    </div>
                    <svg className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 pt-1">
                    <ul className="space-y-1.5">
                      {product.benefits.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: product.theme }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}

              {/* Nutrition */}
              {product.nutrition && (
                <details className="group bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: `${product.theme}25` }}
                      >📊</span>
                      <span className="text-sm font-bold tracking-widest uppercase">Información Nutricional</span>
                    </div>
                    <svg className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 pt-1 grid grid-cols-4 gap-3">
                    {[
                      { label: 'Calorías', value: product.nutrition.calories, unit: 'kcal' },
                      { label: 'Proteína', value: product.nutrition.protein, unit: 'g' },
                      { label: 'Grasas', value: product.nutrition.fat, unit: 'g' },
                      { label: 'Carbos', value: product.nutrition.carbs, unit: 'g' },
                    ].map(({ label, value, unit }) => (
                      <div key={label} className="text-center">
                        <span className="text-2xl font-black" style={{ color: product.theme }}>{value}</span>
                        <span className="text-[9px] text-white/40 ml-0.5">{unit}</span>
                        <p className="text-[9px] uppercase tracking-widest text-white/30 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        <div className="mt-24 pt-16 border-t border-white/5">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-[10px] tracking-widest uppercase text-white/30 block mb-2">También te puede gustar</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Otros Sabores</h2>
            </div>
            <Link to="/products" className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors flex items-center gap-1.5">
              Ver Todos <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                to={`/products/${rel.id}`}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                style={{
                  background: `radial-gradient(ellipse at 50% 40%, ${rel.theme}22 0%, #0d0d0d 70%)`,
                }}
              >
                {/* Badge */}
                {(rel.isBestSeller || rel.isNewProduct) && (
                  <div className="absolute top-3 left-3 z-10">
                    {rel.isBestSeller && (
                      <span className="px-2 py-1 bg-amber-500/25 border border-amber-500/35 text-amber-200 text-[8px] tracking-widest uppercase font-bold rounded-full">⭐ Top</span>
                    )}
                    {rel.isNewProduct && (
                      <span className="px-2 py-1 bg-emerald-500/25 border border-emerald-500/35 text-emerald-200 text-[8px] tracking-widest uppercase font-bold rounded-full">✨ New</span>
                    )}
                  </div>
                )}

                {/* Popsicle o foto */}
                <div className="flex-1 flex items-center justify-center pt-8 pb-2">
                  {rel.image ? (
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-3/4 h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      style={{ filter: `drop-shadow(0 12px 30px ${rel.theme}70)` }}
                    />
                  ) : (
                    <div className="group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500">
                      <MiniPopsicle color={rel.theme} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] tracking-widest uppercase text-white/35 font-bold mb-0.5">{rel.tagline?.split(' ').slice(0, 2).join(' ')}</p>
                      <h3 className="text-white font-black tracking-wider uppercase text-sm leading-tight">{rel.name}</h3>
                      <span className="text-sm font-black mt-0.5 block" style={{ color: rel.theme }}>{rel.price}</span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2 flex-shrink-0"
                      style={{ backgroundColor: rel.theme, color: isLightColor(rel.theme) ? '#000' : '#fff' }}
                    >→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 px-6 md:px-12 border-t border-white/5 text-center">
        <p className="text-[10px] tracking-widest uppercase text-white/25">
          © 2026 CREAMY Ice Cream. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};
