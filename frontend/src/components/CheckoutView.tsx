import React from 'react';

interface Product {
  title: string;
  price: number;
  thumbnail: string;
}

interface CheckoutViewProps {
  participants: string[];
  product: Product;
  userID: string;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ participants, product, userID }) => {
  const montoPorPersona = product.price / participants.length;

  return (
    <main className="max-w-[600px] mx-auto mt-10 px-5 font-sans text-[#333]">
      <div className="bg-white p-8 rounded-md shadow-[0_1px_3px_0_rgba(0,0,0,0.15)]">
        <div className="text-center mb-6">
          <span className="bg-[#00A650] text-white px-3 py-1.5 rounded-full text-xs font-bold">✓ ¡PRODUCTO ELEGIDO POR MAYORÍA!</span>
          <h2 className="text-2xl font-semibold mt-4 text-[#333]">Checkout: Pago Dividido</h2>
          <p className="text-[#666] text-sm mt-1">Todos los participantes deben confirmar para procesar el despacho.</p>
        </div>

        <div className="border border-[#EDEDED] rounded-md p-4 mb-6 flex items-center">
          <img src={product.thumbnail} alt={product.title} className="w-14 h-14 object-contain mr-4" />
          <div>
            <div className="font-semibold text-[#333] text-sm sm:text-base">{product.title}</div>
            <div className="text-[#00A650] text-lg font-semibold">${product.price.toLocaleString('es-AR')}</div>
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-3 text-[#333]">Billeteras del Grupo:</h3>
        <div className="flex flex-col gap-3 mb-8">
          {participants.map((p) => {
            const estaPagado = p === userID || p === "user_claudia"; 
            return (
              <div key={p} className={`flex justify-between items-center p-3 bg-[#F7F7F7] rounded border-l-4 ${estaPagado ? 'border-[#00A650]' : 'border-[#FF5A5F]'}`}>
                <div>
                  <span className={p === userID ? 'font-bold' : 'navigator'}>{p} {p === userID && '(Vos)'}</span>
                  <div className="text-xs text-[#666] mt-0.5">Le toca poner: <strong>${montoPorPersona.toLocaleString('es-AR')}</strong></div>
                </div>
                <span className={`text-xs font-bold ${estaPagado ? 'text-[#00A650]' : 'text-[#FF5A5F]'}`}>
                  {estaPagado ? '● PAGADO' : '○ PENDIENTE'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#F5F5F5] p-4 rounded-md text-center text-[#666] text-sm">
          Esperando que pague <strong className="text-gray-800">user_tiara</strong> para liberar el envío de Mercado Libre Full. 🚚
        </div>
      </div>
    </main>
  );
};