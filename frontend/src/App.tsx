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

  if (!session) {
    return (
      <div className="bg-[#EBEBEB] min-h-screen">
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

  const cafetera = session.products["prod_cafetera"];

  if (session.approvedProductID) {
    return (
      <div className="bg-[#EBEBEB] min-h-screen">
        <Navbar roomID={session.id} isCheckout={true} />
        <CheckoutView 
          participants={session.participants}
          product={cafetera}
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
        participants={session.participants}
        product={cafetera}
        userID={userID}
        onVote={voteProduct}
      />
    </div>
  );
}