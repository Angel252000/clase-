import React, { useState } from 'react';
import { Link } from 'react-router';
import { products } from '../data/products';

export const JuiceClinic: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<typeof products[0] | null>(null);

  const questions = [
    {
      id: "moment",
      question: "¿Cuándo disfrutarás tu helado hoy?",
      options: [
        { label: "Postre después de comida", value: "chocolate" },
        { label: "Snack refrescante de tarde", value: "mango" },
        { label: "Capricho dulce nocturno", value: "cookies" },
        { label: "Para compartir con alguien especial", value: "fresa" }
      ]
    },
    {
      id: "taste",
      question: "¿Qué perfil de sabor te apetece?",
      options: [
        { label: "Frutal y refrescante", value: "mango" },
        { label: "Cremoso y clásico", value: "vainilla" },
        { label: "Intenso y chocolatoso", value: "chocolate" },
        { label: "Nuts y sofisticado", value: "pistacho" }
      ]
    },
    {
      id: "intensity",
      question: "¿Qué nivel de dulzura prefieres?",
      options: [
        { label: "Suave y delicado", value: "coco" },
        { label: "Balanceado", value: "vainilla" },
        { label: "Dulce intenso", value: "cookies" },
        { label: "Agridulce sofisticado", value: "mora-azul" }
      ]
    }
  ];

  const handleOptionSelect = (value: string) => {
    const updatedAnswers = [...answers, value];
    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calcular el sabor más recomendado basado en respuestas
      const counts: Record<string, number> = {};
      updatedAnswers.forEach(answer => {
        counts[answer] = (counts[answer] || 0) + 1;
      });

      // Encontrar el sabor con más coincidencias
      let maxCount = 0;
      let recommendedId = value;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          recommendedId = id;
        }
      });

      const recommendedProduct = products.find(p => p.id === recommendedId) || products[0];
      setRecommendation(recommendedProduct);
      setStep(step + 1);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setRecommendation(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col justify-between overflow-hidden">
      {/* Background glow effects */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none -top-40 -right-40 transition-all duration-1000"
        style={{
          backgroundColor: recommendation ? recommendation.theme : '#ffffff',
        }}
      />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 blur-[120px] pointer-events-none -bottom-20 -left-20" />

      {/* Navigation header */}
      <header className="w-full py-6 px-6 md:px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-md z-10">
        <Link to="/" className="text-2xl font-black tracking-[0.3em] hover:opacity-80 transition-opacity">
          CREAMY
        </Link>
        <Link to="/" className="text-xs font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors">
          ← Volver
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative">

          {step < questions.length ? (
            <div>
              {/* Encabezado */}
              <div className="text-center mb-8">
                <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-white/40">
                  🍦 IceLab CREAMY
                </span>
                <h1 className="text-xl md:text-2xl font-black tracking-wide mt-2">
                  Encuentra tu Helado Ideal
                </h1>
              </div>

              {/* Progreso del quiz */}
              <div className="flex gap-2 mb-8">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-white' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Pregunta */}
              <h2 className="text-2xl md:text-3xl font-black tracking-wide mb-8 leading-snug">
                {questions[step].question}
              </h2>

              {/* Opciones */}
              <div className="flex flex-col gap-4">
                {questions[step].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option.value)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-5 rounded-2xl text-sm md:text-base font-semibold tracking-wide transition-all duration-300 hover:translate-x-1 focus:outline-none"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Indicador de paso */}
              <p className="text-center mt-6 text-[10px] tracking-widest uppercase text-white/30">
                Pregunta {step + 1} de {questions.length}
              </p>
            </div>
          ) : (
            recommendation && (
              <div className="text-center flex flex-col items-center">
                <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-white/50 mb-2">
                  Diagnóstico Completado
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-wide mb-6">
                  Tu Helado Ideal
                </h2>

                {/* Visualización del Helado */}
                <div className="my-8 flex flex-col items-center relative group">
                  <div
                    className="w-[140px] h-[220px] rounded-[30px] shadow-2xl relative overflow-hidden flex flex-col justify-between py-6 border border-white/20 transition-transform duration-500 hover:scale-105"
                    style={{
                      backgroundColor: recommendation.theme,
                      boxShadow: `0 20px 40px -10px ${recommendation.theme}80, inset 0 10px 20px rgba(255,255,255,0.2), inset -5px -10px 20px rgba(0,0,0,0.3)`
                    }}
                  >
                    <div className="absolute top-0 left-2 w-4 h-full bg-gradient-to-r from-white/20 via-white/5 to-transparent skew-x-12 pointer-events-none" />

                    <div className="w-full bg-white/10 backdrop-blur-sm border-y border-white/10 py-4 flex flex-col items-center">
                      <span className="text-[7px] tracking-[0.4em] uppercase text-white/80 font-bold mb-0.5">CREAMY</span>
                      <h3 className="text-sm font-black tracking-wider uppercase text-white leading-none">{recommendation.name}</h3>
                    </div>
                  </div>
                  <div
                    className="w-24 h-3 rounded-full blur-md mt-4 opacity-50 transition-all duration-500"
                    style={{ backgroundColor: recommendation.theme }}
                  />
                </div>

                <h3 className="text-2xl font-black tracking-wider uppercase" style={{ color: recommendation.theme }}>
                  {recommendation.name}
                </h3>
                <p className="text-white/40 text-xs tracking-widest uppercase mt-1 mb-4 font-semibold">
                  {recommendation.tagline}
                </p>
                <p className="text-white/70 text-sm font-light leading-relaxed mb-4 max-w-sm mx-auto">
                  {recommendation.description}
                </p>

                {/* Precio destacado */}
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 mb-6">
                  <span className="text-3xl font-black text-white">{recommendation.price}</span>
                  {recommendation.size && (
                    <span className="text-white/40 text-sm ml-2">/ {recommendation.size}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Link
                    to={`/products/${recommendation.id}`}
                    className="border border-white/20 hover:border-white text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-300"
                  >
                    Ver Detalles
                  </Link>
                  <Link
                    to={`/checkout?flavor=${recommendation.id}`}
                    className="bg-white text-black hover:bg-transparent hover:text-white border border-transparent hover:border-white/30 px-8 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-300"
                  >
                    Ordenar Ahora
                  </Link>
                </div>

                <button
                  onClick={resetQuiz}
                  className="mt-4 text-white/40 hover:text-white text-[10px] tracking-widest uppercase font-semibold transition-colors"
                >
                  ↻ Repetir Quiz
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-[10px] tracking-widest uppercase text-white/30 border-t border-white/5">
        © 2026 CREAMY Ice Cream. Todos los derechos reservados.
      </footer>
    </div>
  );
};
