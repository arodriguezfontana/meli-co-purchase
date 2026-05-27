import React from 'react';

interface NavbarProps {
  roomID?: string;
  isCheckout?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ roomID, isCheckout }) => {
  return (
    <header className="bg-[#FFF159] px-5 py-3 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] flex justify-between items-center font-sans">
      <div className="text-xl font-bold text-[#333]">
        Mercado <span className={isCheckout ? "text-[#2D3277]" : "text-[#2D3277]"}>{isCheckout ? 'Pago' : 'Libre'}</span>
        {!isCheckout && <span className="text-xs font-light bg-[#2D3277] text-white px-1.5 py-0.5 rounded ml-1.5">Co-Compra</span>}
      </div>
      {roomID && (
        <div className="text-sm text-[#333] bg-black/5 px-3 py-1 rounded font-semibold">
          {isCheckout ? `Sala: ${roomID}` : `Sala activa: ${roomID}`}
        </div>
      )}
    </header>
  );
};