import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ScrollShowcase } from './components/ScrollShowcase';
import { FlavorNav } from './components/FlavorNav';
import { Footer } from './components/Footer';
import { products } from './data/products';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JuiceClinic } from './pages/JuiceClinic';
import { Checkout } from './pages/Checkout';
import { ProductDetail } from './pages/ProductDetail';
import { Products } from './pages/Products';

function MainLayout() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Manejador para el scroll suave desde el sidebar
  const handleFlavorClick = (index: number) => {
    const trigger = ScrollTrigger.getById("showcaseTrigger");
    if (trigger) {
      const start = trigger.start;
      const end = trigger.end;
      const totalScroll = end - start;
      const scrollPos = start + (index / (products.length - 1)) * totalScroll;
      
      window.scrollTo({
        top: scrollPos,
        behavior: 'smooth'
      });
    } else {
      // Fallback si no está cargado el Trigger
      const element = document.getElementById("showcase");
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const start = rect.top + scrollTop;
        const totalHeight = rect.height - window.innerHeight;
        const scrollPos = start + (index / (products.length - 1)) * totalHeight;
        
        window.scrollTo({
          top: scrollPos,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white">
      {/* Barra de navegación global */}
      <Navbar />

      {/* Hero de bienvenida inicial */}
      <HeroSection />

      {/* Sidebar interactivo de sabores */}
      <FlavorNav
        products={products}
        activeIndex={activeIndex}
        onFlavorClick={handleFlavorClick}
      />

      {/* Showcase de scroll principal */}
      <ScrollShowcase
        products={products}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />

      {/* Footer minimalista */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/clinic" element={<JuiceClinic />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

