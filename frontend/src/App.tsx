import React, { useState } from 'react';
import { useSession } from './context/SessionContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginView } from './components/LoginView.tsx';
import { VotingView } from './components/VotingView.tsx';
import { CheckoutView } from './components/CheckoutView.tsx';

export default function App() {
  const { session, userID, createRoom, joinRoom, voteProduct } = useSession();
  const [inputUserID, setInputUserID] = useState('');
  const [inputRoomID, setInputRoomID] = useState('');

  const salaStatus = session?.status || (session as any)?.Status || "ACTIVE";
  const productsMap = session?.products || (session as any)?.Products || {};
  const yaEstaEnCheckout = salaStatus === "COMPLETED" || salaStatus === "SUCCESS";
  const esCompraExitosa = salaStatus === "SUCCESS";

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [salaStatus]);

  if (!session) {
    return (
      <div className="bg-[#fafafa] min-h-screen">
        <Navbar />
        <LoginView 
          inputUserID={inputUserID}
          setInputUserID={setInputUserID}
          inputRoomID={inputRoomID}
          setInputRoomID={setInputRoomID}
          onCreateRoom={() => createRoom(inputUserID)}
          onJoinRoom={() => joinRoom(inputRoomID, inputUserID)}
        />
      </div>
    );
  }

  if (yaEstaEnCheckout) {
    return (
      <div className={`min-h-screen transition-colors duration-[1500ms] ease-in-out 'bg-[#EBEBEB]'
      }`}>
        <Navbar roomID={session.id} isCheckout={true} />
        <CheckoutView 
          participants={session.participants || (session as any).Participants || []}
          products={productsMap} 
          userID={userID}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#EBEBEB] min-h-screen">
      <Navbar roomID={session.id} isCheckout={false} />
      <VotingView 
        roomID={session.id}
        participants={session.participants || (session as any).Participants || []}
        products={productsMap} 
        userID={userID}
        onVote={voteProduct}
      />
    </div>
  );
}