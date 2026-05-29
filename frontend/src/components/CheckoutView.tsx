import React from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  votes: string[];
  approved: boolean;
}

interface CheckoutViewProps {
  participants: string[];
  products: { [key: string]: Product };
  userID: string;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ participants, products, userID }) => {
  
  const aprobados = Object.values(products || {}).filter((p) => p.approved);
  const montoTotalCarrito = aprobados.reduce((acumulado, prod) => acumulado + prod.price, 0);
  const cantidadParticipantes = participants.length > 0 ? participants.length : 1;
  const montoPorPersona = montoTotalCarrito / cantidadParticipantes;

  return (
    <main className="max-w-[600px] mx-auto mt-10 px-5 font-sans text-[#333]">
      <div className="bg-white p-8 rounded-md shadow-[0_1px_3px_0_rgba(0,0,0,0.15)]">
        
        <div className="text-center mb-6">
          <span className="bg-[#00A650] text-white px-3 py-1.5 rounded-full text-xs font-bold">
            ✓ ¡PRODUCTOS ELEGIDOS POR MAYORÍA!
          </span>
          <h2 className="text-2xl font-semibold mt-4 text-[#333]">Checkout: Pago Dividido</h2>
          <p className="text-[#666] text-sm mt-1">
            Todos los participantes deben confirmar para procesar el despacho grupal.
          </p>
        </div>

        <div className="border border-[#EDEDED] rounded-md p-4 mb-6 bg-[#FAFAFA]">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen del Carrito Grupal</h4>
          <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
            {aprobados.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center min-w-0 flex-1 mr-3">
                  <img src={product.thumbnail} alt={product.title} className="w-8 h-8 object-contain mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-700 truncate">{product.title}</span>
                </div>
                <span className="font-semibold text-gray-900 flex-shrink-0">
                  ${product.price.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
            {aprobados.length === 0 && (
              <div className="text-xs text-amber-600 font-medium py-1">No hay productos seleccionados para la compra.</div>
            )}
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center text-sm font-bold text-gray-800">
            <span>Total Acumulado:</span>
            <span className="text-[#00A650]">${montoTotalCarrito.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-3 text-[#333]">Billeteras del Grupo:</h3>
        <div className="flex flex-col gap-3 mb-8">
          {participants.map((p) => {
            const estaPagado = p === userID || p === "user_claudia"; 
            return (
              <div key={p} className={`flex justify-between items-center p-3 bg-[#F7F7F7] rounded border-l-4 ${estaPagado ? 'border-[#00A650]' : 'border-[#FF5A5F]'}`}>
                <div>
                  <span className={p === userID ? 'font-bold' : 'navigator'}>
                    {p} {p === userID && '(Vos)'}
                  </span>
                  <div className="text-xs text-[#666] mt-0.5">
                    Le toca poner: <strong>${montoPorPersona.toLocaleString('es-AR')}</strong>
                  </div>
                </div>
                <span className={`text-xs font-bold ${estaPagado ? 'text-[#00A650]' : 'text-[#FF5A5F]'}`}>
                  {estaPagado ? '● PAGADO' : '○ PENDIENTE'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-[#F5F5F5] p-4 rounded-md text-center text-[#666] text-sm">
          Esperando que paguen los pendientes para liberar el envío de Mercado Libre Full. 🚚
        </div>
      </div>
    </main>
  );
};