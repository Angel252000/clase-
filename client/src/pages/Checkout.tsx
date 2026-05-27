import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { products } from '../data/products';

// ── Stripe init (una sola vez, fuera del render) ─────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Helper: luminosidad del color ─────────────────────────────
const isLightColor = (hex: string) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
};

const formatCRC = (n: number) =>
  `₡${n.toLocaleString('es-CR')}`;

// ─────────────────────────────────────────────────────────────
// Formulario interno — usa hooks de Stripe
// Solo se monta cuando Elements ya tiene clientSecret
// ─────────────────────────────────────────────────────────────
interface PayFormProps {
  formData:    { name: string; email: string; address: string; city: string; zip: string };
  total:       number;
  theme:       string;
  productName: string;
  productSlug: string;
  quantity:    number;
  paymentIntentId: string;
  onSuccess:   (orderId: string) => void;
}

const PayForm: React.FC<PayFormProps> = ({
  formData, total, theme, productName, productSlug, quantity, paymentIntentId, onSuccess,
}) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const lightBg = isLightColor(theme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1 — Validar el PaymentElement (tarjeta completa, etc.)
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setError(submitErr.message ?? 'Datos de tarjeta inválidos');
        return;
      }

      // 2 — Confirmar el pago con Stripe
      const { error: confirmErr } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?success=true`,
          payment_method_data: {
            billing_details: {
              name:  formData.name,
              email: formData.email,
              address: {
                line1:       formData.address,
                city:        formData.city,
                postal_code: formData.zip,
                country:     'CR',
              },
            },
          },
        },
        redirect: 'if_required', // permanece en la misma página
      });

      if (confirmErr) {
        setError(confirmErr.message ?? 'Pago rechazado. Verifica los datos.');
        return;
      }

      // 3 — Pago confirmado por Stripe → guardar orden en MongoDB
      const res = await fetch(`${API_URL}/api/payments/confirm-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          customerInfo: {
            name:  formData.name,
            email: formData.email,
          },
          shippingAddress: {
            street: formData.address,
            city:   formData.city,
            zip:    formData.zip,
          },
          items: [{
            slug:     productSlug,
            name:     productName,
            price:    total / quantity,
            quantity,
            image:    '',
          }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando la orden');

      onSuccess(data.order._id);
    } catch (err: any) {
      setError(err.message ?? 'Error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Stripe PaymentElement — renderiza el formulario de tarjeta */}
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: { name: formData.name, email: formData.email },
          },
          // Desactivar Apple Pay / Google Pay — requieren HTTPS y dominio registrado
          wallets: {
            applePay:  'never',
            googlePay: 'never',
          },
        }}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-200 hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${theme}, ${theme}bb)`,
          color: loading ? '#fff' : (lightBg ? '#000' : '#fff'),
          boxShadow: loading ? 'none' : `0 8px 30px ${theme}40`,
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Procesando pago...
          </span>
        ) : (
          `Pagar ${formatCRC(total)}`
        )}
      </button>

      <p className="text-center text-[10px] text-white/25">
        🔒 Tu pago es procesado de forma segura por Stripe. No almacenamos datos de tarjeta.
      </p>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// Checkout principal
// ─────────────────────────────────────────────────────────────
export const Checkout: React.FC = () => {
  const [searchParams]  = useSearchParams();
  const flavorParam     = searchParams.get('flavor') || products[0].id;
  const initial         = products.find(p => p.id === flavorParam) || products[0];

  const [selected,   setSelected]   = useState(initial);
  const [quantity,   setQuantity]   = useState(1);
  const [orderId,    setOrderId]    = useState<string | null>(null);

  // Estado del PaymentIntent
  const [clientSecret,    setClientSecret]    = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [intentLoading,   setIntentLoading]   = useState(false);
  const [intentError,     setIntentError]     = useState<string | null>(null);

  // Datos del formulario
  const [form, setForm] = useState({
    name: '', email: '', address: '', city: '', zip: '',
  });

  const total   = selected.priceNumber * quantity;
  const lightBg = isLightColor(selected.theme);

  // ── Crear PaymentIntent cuando cambia producto o cantidad ──
  const createIntent = useCallback(async (product: typeof selected, qty: number) => {
    setClientSecret(null);
    setIntentLoading(true);
    setIntentError(null);

    // AbortController: cancela la petición si tarda más de 8 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${API_URL}/api/payments/create-intent`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  controller.signal,
        body: JSON.stringify({
          amount:      product.priceNumber * qty,
          currency:    'usd',
          productName: `${product.name} ×${qty}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error del servidor');

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIntentError('El servidor tardó demasiado. ¿Está corriendo el backend en puerto 4000?');
      } else {
        setIntentError(err.message || 'No se pudo conectar al servidor');
      }
    } finally {
      clearTimeout(timeout);
      setIntentLoading(false);
    }
  }, []); // sin dependencias — amount y productName son parámetros

  // Crear intent al montar y cuando cambia producto o cantidad
  useEffect(() => {
    createIntent(selected, quantity);
  }, [selected.id, quantity, createIntent]);

  const handleProductChange = (p: typeof selected) => {
    setSelected(p);
    setClientSecret(null);
  };

  const handleQuantityChange = (delta: number) => {
    const next = Math.min(20, Math.max(1, quantity + delta));
    setQuantity(next);
    setClientSecret(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const inputClass = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5
    text-sm font-medium text-white placeholder:text-white/20
    outline-none focus:border-white/30 focus:bg-white/[0.07] transition-colors
  `;

  // ── Pantalla de éxito ─────────────────────────────────────
  if (orderId) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="py-5 px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
        <Link to="/" className="text-xl font-black tracking-[0.3em]">CREAMY</Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[32px] p-10 text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{ background: `${selected.theme}20`, border: `2px solid ${selected.theme}50` }}
          >
            <svg className="w-9 h-9" fill="none" stroke={selected.theme} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black mb-2">¡Pago Exitoso!</h1>
          <p className="text-white/50 text-sm mb-1">
            Gracias, <span className="text-white font-semibold">{form.name}</span>.
          </p>
          <p className="text-white/50 text-sm mb-2">
            Tu <span className="font-bold" style={{ color: selected.theme }}>{selected.name}</span> ×{quantity} está confirmado.
          </p>
          <p className="text-white/25 text-xs mb-1">
            Confirmación enviada a <span className="text-white/40">{form.email}</span>
          </p>
          <p className="text-white/20 text-[10px] font-mono mb-6">
            Orden: {orderId}
          </p>

          <div
            className="rounded-2xl py-3 px-5 mb-6 text-sm font-bold"
            style={{ background: `${selected.theme}15`, border: `1px solid ${selected.theme}30`, color: selected.theme }}
          >
            ❄️ Total pagado: {formatCRC(total)}
          </div>

          <Link
            to="/"
            className="block w-full py-3.5 rounded-2xl text-sm font-black tracking-widest uppercase bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>
    </div>
  );

  // ── Checkout principal ────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Glow dinámico */}
      <div
        className="fixed w-[700px] h-[700px] rounded-full blur-[200px] opacity-[0.06] pointer-events-none -top-60 -left-40 transition-all duration-700"
        style={{ backgroundColor: selected.theme }}
      />

      {/* Header */}
      <header className="py-5 px-6 md:px-12 flex items-center justify-between border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
        <Link to="/" className="text-xl font-black tracking-[0.3em] hover:opacity-75 transition-opacity">CREAMY</Link>
        <div className="flex items-center gap-6">
          <span className="text-xs text-white/25 hidden md:block">🔒 Checkout Seguro</span>
          <Link to="/" className="text-xs font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors">← Volver</Link>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-10 py-10 z-10">
        <div className="max-w-5xl mx-auto">

          {/* Título */}
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-1">Checkout</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Elige y Paga</h1>
          </div>

          {/* ── Selector de sabor ── */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
            {products.map(p => {
              const active = selected.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProductChange(p)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all duration-200 ${
                    active ? 'border-white/40 scale-105' : 'border-white/10 hover:border-white/25'
                  }`}
                  style={active ? { boxShadow: `0 0 18px ${p.theme}45` } : {}}
                >
                  <div
                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-base"
                    style={{ background: `radial-gradient(circle at 35% 35%, ${p.theme}, ${p.theme}70)` }}
                  >🍦</div>
                  <span className="text-[8px] font-bold tracking-widest uppercase text-white/60 leading-none text-center">
                    {p.name.split(' ')[0]}
                  </span>
                  <span className="text-[8px] font-black" style={{ color: active ? p.theme : 'rgba(255,255,255,0.25)' }}>
                    {p.price.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Resumen del producto seleccionado ── */}
          <div
            className="rounded-3xl p-5 mb-8 flex flex-wrap items-center gap-5 border border-white/10"
            style={{ background: `linear-gradient(135deg, ${selected.theme}18 0%, ${selected.theme}06 100%)` }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/10"
              style={{ background: `radial-gradient(circle at 35% 35%, ${selected.theme}, ${selected.theme}50)` }}
            >🍦</div>

            <div className="flex-1 min-w-0">
              <h3 className="font-black tracking-wider uppercase">{selected.name}</h3>
              <p className="text-white/40 text-xs tracking-widest uppercase">{selected.tagline}</p>
            </div>

            {/* Cantidad */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 shrink-0">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition-colors"
              >−</button>
              <span className="text-base font-black w-5 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(+1)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition-colors"
              >+</button>
            </div>

            <p className="text-2xl font-black shrink-0" style={{ color: selected.theme }}>
              {formatCRC(total)}
            </p>
          </div>

          {/* ── Formulario + Resumen lateral ── */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Columna del formulario */}
            <div className="flex-1 flex flex-col gap-6">

              {/* Sección 2 — Datos de entrega */}
              <div>
                <h2 className="text-lg font-black tracking-wide flex items-center gap-2 mb-5">
                  <span
                    className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0"
                    style={{ backgroundColor: selected.theme, color: lightBg ? '#000' : '#fff' }}
                  >2</span>
                  Datos de Entrega
                </h2>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase font-semibold text-white/40 block mb-2">Nombre Completo</label>
                      <input name="name" type="text" value={form.name} onChange={handleChange}
                        className={inputClass} placeholder="Juan Pérez" autoComplete="name" />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-widest uppercase font-semibold text-white/40 block mb-2">Email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className={inputClass} placeholder="juan@ejemplo.com" autoComplete="email" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] tracking-widest uppercase font-semibold text-white/40 block mb-2">Dirección</label>
                    <input name="address" type="text" value={form.address} onChange={handleChange}
                      className={inputClass} placeholder="Av. Central, San Pedro" autoComplete="street-address" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase font-semibold text-white/40 block mb-2">Ciudad</label>
                      <input name="city" type="text" value={form.city} onChange={handleChange}
                        className={inputClass} placeholder="San José" autoComplete="address-level2" />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-widest uppercase font-semibold text-white/40 block mb-2">Código Postal</label>
                      <input name="zip" type="text" value={form.zip} onChange={handleChange}
                        className={inputClass} placeholder="11501" autoComplete="postal-code" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3 — Pago con Stripe */}
              <div>
                <h2 className="text-lg font-black tracking-wide flex items-center gap-2 mb-5">
                  <span
                    className="w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0"
                    style={{ backgroundColor: selected.theme, color: lightBg ? '#000' : '#fff' }}
                  >3</span>
                  Pago Seguro
                </h2>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  {/* Estado del PaymentIntent */}
                  {intentLoading && (
                    <div className="flex items-center gap-3 py-6 justify-center text-white/40 text-sm">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                      </svg>
                      Preparando pago seguro...
                    </div>
                  )}

                  {intentError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-4">
                      ⚠️ {intentError}
                      <button
                        onClick={() => createIntent(selected, quantity)}
                        className="ml-2 underline text-red-300 hover:text-red-200"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {/* Stripe Elements — se monta cuando hay clientSecret */}
                  {clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'night',
                          variables: {
                            colorPrimary:    selected.theme,
                            colorBackground: '#0f0f0f',
                            colorText:       '#ffffff',
                            colorTextSecondary: 'rgba(255,255,255,0.5)',
                            borderRadius:    '12px',
                            fontFamily:      'system-ui, sans-serif',
                          },
                          rules: {
                            '.Input': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border:          '1px solid rgba(255,255,255,0.1)',
                              color:           '#ffffff',
                            },
                            '.Input:focus': {
                              border: '1px solid rgba(255,255,255,0.3)',
                            },
                            '.Label': {
                              color: 'rgba(255,255,255,0.5)',
                              fontSize: '10px',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              fontWeight: '600',
                            },
                          },
                        },
                      }}
                    >
                      <PayForm
                        formData={form}
                        total={total}
                        theme={selected.theme}
                        productName={selected.name}
                        productSlug={selected.id}
                        quantity={quantity}
                        paymentIntentId={paymentIntentId}
                        onSuccess={(id) => setOrderId(id)}
                      />
                    </Elements>
                  )}
                </div>

                <p className="text-[10px] text-white/25 mt-2 text-center">
                  Tarjeta de prueba: <span className="font-mono text-white/35">4242 4242 4242 4242</span> · Exp: <span className="font-mono text-white/35">12/26</span> · CVC: <span className="font-mono text-white/35">123</span>
                </p>
              </div>
            </div>

            {/* ── Resumen lateral ── */}
            <div className="w-full lg:w-[270px] shrink-0">
              <h2 className="text-lg font-black tracking-wide mb-5">Resumen</h2>
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-xl shrink-0"
                    style={{ background: `radial-gradient(circle at 35% 35%, ${selected.theme}, ${selected.theme}50)` }}
                  >🍦</div>
                  <div className="min-w-0">
                    <p className="font-black text-sm tracking-wider uppercase truncate">{selected.name}</p>
                    <p className="text-white/40 text-[10px] tracking-widest uppercase truncate">{selected.tagline}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col gap-3 text-sm mb-4">
                  <div className="flex justify-between text-white/60">
                    <span>{quantity}× Helado Premium</span>
                    <span>{formatCRC(total)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Envío Express</span>
                    <span className="text-emerald-400 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>IVA incluido</span>
                    <span>✓</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center mb-5">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black" style={{ color: selected.theme }}>
                    {formatCRC(total)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-white/30"><span>🔒</span> Pago procesado por Stripe</div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30"><span>🚚</span> Entrega en 24–48 horas</div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30"><span>❄️</span> Cadena de frío garantizada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-[10px] tracking-widest uppercase text-white/20 border-t border-white/5 z-10">
        © 2026 CREAMY Ice Cream. Todos los derechos reservados.
      </footer>
    </div>
  );
};
