import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white/40 py-12 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-white text-lg font-black tracking-widest uppercase mb-2">CREAMY</h2>
          <p className="text-xs font-light tracking-widest uppercase">Creador: Angel</p>
        </div>
      </div>
    </footer>
  );
};
