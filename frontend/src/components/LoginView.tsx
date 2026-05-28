import React from 'react';

interface LoginViewProps {
  inputUserID: string;
  setInputUserID: (val: string) => void;
  inputRoomID: string;
  setInputRoomID: (val: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  inputUserID, setInputUserID, inputRoomID, setInputRoomID, onCreateRoom, onJoinRoom
}) => {
  return (
    <main className="max-w-[450px] mx-auto mt-10 px-5 font-sans">
      <div className="bg-white p-8 rounded-md shadow-[0_1px_3px_0_rgba(0,0,0,0.15)]">
        <h2 className="text-600 text-xl font-semibold text-[#333]">Bienvenido a Co-Compra!</h2>
        
        <div className="text-[#999] mt-2 mb-6 text-sm">Realizá una compra en grupo y compartí el costo.</div>


        <div className="mb-5">
          <label className="block text-sm text-[#666] mb-1.5">Email</label>
          <input 
            type="text" 
            placeholder="Ej: nombre@gmail.com" 
            value={inputUserID}
            onChange={(e) => setInputUserID(e.target.value)}
            className="w-full p-2.5 text-base rounded border border-[#D9D9D9] box-border focus:outline-none focus:border-[#3483FA]"
          />
        </div>

        <button 
          onClick={onCreateRoom}
          disabled={!inputUserID}
          className={`w-full text-white bg-[#3483FA] py-3 text-base font-semibold rounded-md transition-colors duration-200 mb-5 ${inputUserID ? 'cursor-pointer hover:bg-[#1e6be6]' : 'cursor-not-allowed opacity-50'}`}
        >
          Crear nueva sala
        </button>

        <div className="text-center text-[#999] my-4 text-sm">¿Ya tenés una sala?</div>

        <div className="mb-5">
          <label className="block text-sm text-[#666] mb-1.5">Código de la sala</label>
          <input 
            type="text" 
            placeholder="Ej: MELI-4829" 
            value={inputRoomID}
            onChange={(e) => setInputRoomID(e.target.value)}
            className="w-full p-2.5 text-base rounded border border-[#D9D9D9] box-border focus:outline-none focus:border-[#3483FA]"
          />
        </div>

        <button 
          onClick={onJoinRoom}
          disabled={!inputUserID || !inputRoomID}
          className={`w-full bg-transparent text-[#3483FA] border border-[#3483FA] py-3 text-base font-semibold rounded-md transition-colors duration-200 ${(inputUserID && inputRoomID) ? 'cursor-pointer hover:bg-[#3483FA]/5' : 'cursor-not-allowed opacity-50'}`}
        >
          Unirse a sala existente
        </button>
      </div>
    </main>
  );
};