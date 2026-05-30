import React from 'react';
import logoML from '../assets/logoml.png';
import logoMLTX from '../assets/logomltx.png';
import logoMP from '../assets/logomp.png';

interface NavbarProps {
  roomID?: string;
  isCheckout?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ roomID, isCheckout }) => {
  return (
    <header 
      className={`px-5 py-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] flex justify-between items-center font-sans transition-colors duration-300 ${
        isCheckout ? 'bg-[#009EE3]' : 'bg-[#FFF159]'
      }`}
    >
      <div className="flex items-center">
        {isCheckout ? (
          <img
            src={logoMP}
            alt="Mercado Pago"
            className="h-9 w-auto object-contain" 
          />
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={logoML}
              alt="Mercado Libre"
              className="h-9 w-auto object-contain"
            />
            <img
              src={logoMLTX}
              alt="Mercado Pago"
              className="h-9 w-auto object-contain"
            />
            <span className="text-xs ml-3 font-semibold bg-[#2D3277] text-white px-2 py-0.5 rounded shadow-sm">
              Co-Compra
            </span>
          </div>
        )}
      </div>
    </header>
  );
};