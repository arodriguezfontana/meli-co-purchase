import React from 'react';
import { useSession } from '../context/SessionContext.tsx';

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
  const { sendPayStatus, session } = useSession();

  const paidUsers: string[] = (session as any)?.paid_users || (session as any)?.PaidUsers || [];
  const imPaid = paidUsers.includes(userID);

  const esCompraExitosa = session?.status === "SUCCESS";

  const aprobados = Object.values(products || {}).filter((p) => p.approved);
  const montoTotalCarrito = aprobados.reduce((acumulado, prod) => acumulado + prod.price, 0);
  const cantidadParticipantes = participants.length > 0 ? participants.length : 1;
  const montoPorPersona = montoTotalCarrito / cantidadParticipantes;

  return (
    <main className="max-w-[600px] mx-auto mt-10 px-5 font-sans text-[#333]">
      <div className="bg-white p-8 rounded-md shadow-[0_1px_3px_0_rgba(0,0,0,0.15)]">
        
        <div className="text-center mb-6">
          {esCompraExitosa ? (
            <span className="bg-[#00A650] text-white px-4 py-2 rounded-full text-xs font-bold animate-bounce block w-fit mx-auto shadow-sm">
              🚀 ¡COMPRA GRUPAL REALIZADA CON ÉXITO!
            </span>
          ) : (
            <span className="bg-[#3483FA] text-white px-3 py-1.5 rounded-full text-xs font-bold">
              💳 CHECKOUT EN PROGRESO
            </span>
          )}
          <h2 className="text-2xl font-semibold mt-4 text-[#333]">Checkout: Pago Dividido</h2>
          <p className="text-[#666] text-sm mt-1">
            {esCompraExitosa 
              ? "¡Felicidades! Todos pagaron. El pedido ya está en camino por Mercado Libre Full." 
              : "Cada participante debe liberar su pago para procesar el despacho grupal."}
          </p>
        </div>

        <div className="border border-[#EDEDED] rounded-md p-4 mb-6 bg-[#FAFAFA]">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen de ítems incluidos</h4>
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
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center text-sm font-bold text-gray-800">
            <span>Total Acumulado:</span>
            <span className="text-[#00A650]">${montoTotalCarrito.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-3 text-[#333]">Billeteras del Grupo:</h3>
        <div className="flex flex-col gap-3 mb-6">
          {participants.map((p) => {
            const yaPagoEsteUser = paidUsers.includes(p);
            
            return (
              <div key={p} className={`flex justify-between items-center p-3 bg-[#F7F7F7] rounded border-l-4 transition-all ${yaPagoEsteUser ? 'border-[#00A650] bg-emerald-50/20' : 'border-[#FF5A5F]'}`}>
                <div>
                  <span className={p === userID ? 'font-bold text-gray-900' : 'text-gray-700'}>
                    {p} {p === userID && '(Vos)'}
                  </span>
                  <div className="text-xs text-[#666] mt-0.5">
                    Le toca poner: <strong>${montoPorPersona.toLocaleString('es-AR')}</strong>
                  </div>
                </div>
                <span className={`text-xs font-bold tracking-wide ${yaPagoEsteUser ? 'text-[#00A650]' : 'text-[#FF5A5F]'}`}>
                  {yaPagoEsteUser ? '● PAGADO' : '○ PENDIENTE'}
                </span>
              </div>
            );
          })}
        </div>

        {esCompraExitosa ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md text-center text-emerald-800 font-medium text-sm">
            📦 ¡Listo! El total de la orden fue cubierto. ID de tracking: ML-GROUP-{session?.id}. ¡Gracias por comprar juntos!
          </div>
        ) : (
          <div>
            <button 
              onClick={sendPayStatus}
              disabled={imPaid}
              className={`w-full py-3.5 rounded-md font-semibold text-base transition-all shadow-sm text-center ${
                imPaid
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed'
                  : 'bg-[#009EE3] text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              {imPaid ? '✓ Tu parte ya fue liberada. Esperando al resto...' : 'Liberar mi pago con Mercado Pago'}
            </button>
            
            <div className="bg-[#F5F5F5] p-4 rounded-md text-center text-[#666] text-xs mt-4">
              Faltan confirmar <strong className="text-gray-800">{participants.length - paidUsers.length}</strong> integrantes para procesar el empaque. 🚚
            </div>
          </div>
        )}

      </div>
    </main>
  );
};