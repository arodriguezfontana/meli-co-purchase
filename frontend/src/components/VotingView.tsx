import React from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  votes: string[];
}

interface VotingViewProps {
  roomID: string;
  participants: string[];
  product: Product;
  userID: string;
  onVote: (id: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({ roomID, participants, product, userID, onVote }) => {
  const totalVotos = product.votes.length;
  const votosNecesarios = Math.floor(participants.length / 2) + 1;
  const yaVote = product.votes.includes(userID);
  const porcentaje = Math.min((totalVotos / votosNecesarios) * 100, 100);

  return (
    <div className="font-sans text-[#333]">
      <div className="bg-white px-5 py-3 border-b border-[#E0E0E0] text-sm text-[#666]">
        <div className="max-w-[1000px] mx-auto">
          Personas en la sala: <strong className="text-gray-800">{participants.join(', ')}</strong> (Total: {participants.length})
        </div>
      </div>

      <main className="max-w-[1000px] mx-auto mt-8 px-5 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5">
        <div className="bg-white rounded p-8 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] flex flex-col sm:flex-row">
          <div className="w-[250px] mx-auto sm:mr-8 flex justify-center items-center mb-5 sm:mb-0">
            <img src={product.thumbnail} alt={product.title} className="max-w-full max-h-[250px] object-contain" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-[#666]">Sugerido para la compra grupal</span>
            <h1 className="text-xl font-semibold mt-2 mb-3 text-[#333]">{product.title}</h1>
            
            <div className="text-3xl font-light mb-5">
              $ {product.price.toLocaleString('es-AR')}
              <span className="text-xs text-[#00A650] block font-bold mt-1">Mismo precio que comprando solo</span>
            </div>

            <div className="border-t border-[#EEE] pt-5">
              <div className="flex justify-between mb-2 text-sm font-semibold">
                <span>Progreso de la votación:</span>
                <span className="text-[#3483FA]">{totalVotos} de {votosNecesarios} requeridos</span>
              </div>
              
              <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden mb-6">
                <div style={{ width: `${porcentaje}%` }} className="h-full bg-[#3483FA] transition-[width] duration-300 ease-out" />
              </div>

              <button 
                onClick={() => onVote(product.id)}
                disabled={yaVote}
                className={`w-full py-3.5 text-base font-semibold rounded-md transition-colors duration-200 ${yaVote ? 'bg-[#E1E1E1] text-[#999] cursor-not-allowed' : 'bg-[#3483FA] text-white cursor-pointer hover:bg-[#1e6be6]'}`}
              >
                {yaVote ? 'Ya votaste este producto' : 'Votar este producto'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] h-fit">
          <h3 className="text-base font-semibold mb-4 text-[#333]">Actividad en Vivo</h3>
          <div className="flex flex-col gap-3">
            {product.votes.map((voter) => (
              <div key={voter} className="text-sm text-[#666] flex items-center">
                <span className="text-[#00A650] mr-1.5">👍</span> <strong className="text-gray-800 mr-1">{voter}</strong> votó a favor.
              </div>
            ))}
            {totalVotos === 0 && (
              <div className="text-sm text-[#999] text-center py-5">Nadie votó todavía. ¡Sé el primero!</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};