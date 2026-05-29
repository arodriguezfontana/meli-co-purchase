import React, { useEffect, useState } from 'react';
import { sessionService } from '../services/sessionService.ts';
import { useSession } from '../context/SessionContext.tsx';

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  votes: string[];
  approved: boolean; 
}

interface VotingViewProps {
  roomID: string;
  participants: string[];
  products: { [key: string]: Product }; 
  userID: string;
  onVote: (id: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({ roomID, participants, products, userID, onVote }) => {
  const { suggestProduct, sendReadyStatus, session } = useSession();
  const [catalog, setCatalog] = useState<any[]>([]);

  useEffect(() => {
    sessionService.getCatalog().then((data) => setCatalog(data));
  }, []);

  const sugeridosList = Object.values(products || {});
  const votosNecesarios = Math.floor(participants.length / 2) + 1;

  const readyUsers: string[] = (session as any)?.ready_users || (session as any)?.ReadyUsers || [];
  const imReady = readyUsers.includes(userID);

  return (
    <div className="font-sans text-[#333] max-w-[1250px] mx-auto px-4 py-6">
      
      <div className="bg-white px-5 py-3 rounded mb-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] text-sm text-[#666] flex justify-between items-center">
        <div>
          Sala: <strong className="text-gray-800 mr-4">{roomID}</strong>
          Integrantes: <strong className="text-gray-800">{participants.join(', ')}</strong>
        </div>
        <div className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
          Total: {participants.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        
        <div className="bg-white rounded p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]">
          <div className="border-b border-[#EEE] pb-3 mb-5">
            <h2 className="text-lg font-semibold text-[#333]">Elegí productos en Mercado Libre</h2>
            <p className="text-xs text-[#999] mt-0.5">Seleccioná ítems para sumarlos a la lista de compra grupal</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[680px] overflow-y-auto pr-2">
            {catalog.map((prod) => {
              const yaSugerido = !!products[prod.id];
              return (
                <div key={prod.id} className="border border-[#EDEDED] rounded p-4 flex flex-col justify-between hover:border-[#D9D9D9] transition-all">
                  <div className="flex justify-center items-center mb-3 h-32">
                    <img src={prod.thumbnail} alt={prod.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs font-normal text-gray-700 line-clamp-2 h-8 mb-1 overflow-hidden">
                      {prod.title}
                    </h3>
                    <div className="text-lg font-semibold text-[#333] mb-3">
                      $ {prod.price.toLocaleString('es-AR')}
                    </div>
                  </div>
                  <button
                    onClick={() => suggestProduct(prod.id)}
                    disabled={yaSugerido}
                    className={`w-full py-2 rounded text-xs font-semibold transition-colors duration-150 ${
                      yaSugerido 
                        ? 'bg-[#F5F5F5] text-[#999] cursor-not-allowed border border-[#E0E0E0]' 
                        : 'bg-[#FFF159] text-[#333] hover:bg-[#E6D950] cursor-pointer shadow-sm'
                    }`}
                  >
                    {yaSugerido ? 'Agregado a la lista' : 'Sugerir para Co-Compra'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]">
            <div className="border-b border-[#EEE] pb-3 mb-5">
              <h2 className="text-lg font-semibold text-[#333]">Lista de Compra Grupal 🚀</h2>
              <p className="text-xs text-[#999] mt-0.5">Votá los productos que querés comprar en grupo</p>
            </div>

            <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-2 mb-4">
              {sugeridosList.map((item) => {
                const totalVotos = item.votes?.length || 0;
                const yaVote = item.votes?.includes(userID);
                const porcentaje = Math.min((totalVotos / votosNecesarios) * 100, 100);
                const estaBloqueado = item.approved; 

                return (
                  <div key={item.id} className={`border rounded-lg p-4 flex gap-4 transition-all ${estaBloqueado ? 'border-amber-300 bg-amber-50/40' : 'border-[#EDEDED] bg-[#F9F9F9] hover:bg-white'}`}>
                    <div className="w-20 h-20 bg-white rounded border border-[#EEE] p-1 flex justify-center items-center flex-shrink-0">
                      <img src={item.thumbnail} alt={item.title} className="max-w-full max-h-full object-contain" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-800 line-clamp-1 mb-0.5">{item.title}</h4>
                      <div className="text-sm font-bold text-[#333] mb-2">
                        $ {item.price.toLocaleString('es-AR')}
                      </div>
                      
                      <div className="w-full h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden mb-2">
                        <div 
                          style={{ width: `${porcentaje}%` }} 
                          className={`h-full transition-[width] duration-300 ease-out ${estaBloqueado ? 'bg-amber-500' : 'bg-[#3483FA]'}`} 
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-[11px] text-[#666]">
                          {estaBloqueado ? (
                            <span className="text-amber-700 font-semibold">⭐ ¡Seleccionado para la compra!</span>
                          ) : (
                            <>Progreso: <strong className="text-[#3483FA]">{totalVotos}</strong> de {votosNecesarios}</>
                          )}
                        </div>
                        
                        <button
                          onClick={() => onVote(item.id)}
                          disabled={estaBloqueado} 
                          className={`px-4 py-1 rounded text-xs font-semibold border transition-all ${
                            estaBloqueado
                              ? 'bg-amber-100 text-amber-800 border-amber-200 cursor-not-allowed'
                              : yaVote 
                                ? 'bg-[#3483FA] text-white border-transparent hover:bg-blue-600 cursor-pointer shadow-inner brightness-90' // Visualmente marcado, pero clickeable para sacar voto
                                : 'bg-white text-[#3483FA] border-[#3483FA] hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          {estaBloqueado ? 'Seleccionado' : yaVote ? '✓ Votado' : 'Votar'}
                        </button>
                      </div>

                      {totalVotos > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-[#EAEAEA] text-[10px] text-gray-500 truncate">
                          Votado por: <span className="font-medium text-gray-700">{item.votes.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sugeridosList.length === 0 && (
                <div className="text-center py-16 text-[#999] text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-2xl mb-2">🛒</div>
                  No hay productos sugeridos en esta sala.<br />
                  ¡Elegí uno del catálogo de la izquierda para empezar!
                </div>
              )}
            </div>

            {sugeridosList.length > 0 && (
              <div className="border-t border-[#EEE] pt-4 mt-2">
                <div className="flex justify-between items-center mb-3 text-xs text-gray-600">
                  <span>Confirmaciones de pago:</span>
                  <span className="font-semibold text-gray-800">{readyUsers.length} de {participants.length} listos</span>
                </div>
                
                <button
                  onClick={sendReadyStatus}
                  disabled={imReady}
                  className={`w-full py-3 rounded-md text-sm font-semibold transition-all shadow-sm ${
                    imReady
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed text-center'
                      : 'bg-[#009EE3] text-white hover:bg-blue-500 cursor-pointer'
                  }`}
                >
                  {imReady ? '✓ Esperando al resto de los integrantes...' : 'Listo para pagar'}
                </button>
                
                {readyUsers.length > 0 && (
                  <div className="text-[10px] text-gray-400 mt-2 text-center">
                    Confirmados: {readyUsers.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};