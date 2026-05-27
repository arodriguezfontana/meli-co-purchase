import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWebSocket, WSMessage } from '../hooks/useWebSocket.ts';
import { SessionState, Product } from '../types';
import { sessionService } from '../services/sessionService.ts';

interface SessionContextType {
  session: SessionState | null;
  userID: string;
  createRoom: (userId: string) => Promise<void>;
  joinRoom: (sessionId: string, userId: string) => Promise<void>;
  voteProduct: (productId: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [userID, setUserID] = useState<string>('');

  const handleWebSocketMessage = useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case 'USER_JOINED':
        setSession((prev) => {
          if (!prev || prev.id !== msg.session_id) return prev;
          if (prev.participants.includes(msg.user_id)) return prev;
          return { ...prev, participants: [...prev.participants, msg.user_id] };
        });
        break;

      case 'VOTE_UPDATED':
        setSession((prev) => {
          if (!prev || prev.id !== msg.session_id || !msg.product_id) return prev;
          const currentProduct = prev.products[msg.product_id];
          if (!currentProduct) return prev;

          const updatedVotes = currentProduct.votes.includes(msg.user_id)
            ? currentProduct.votes
            : [...currentProduct.votes, msg.user_id];

          return {
            ...prev,
            products: {
              ...prev.products,
              [msg.product_id]: { ...currentProduct, votes: updatedVotes },
            },
          };
        });
        break;

      case 'PRODUCT_APPROVED':
        setSession((prev) => {
          if (!prev || prev.id !== msg.session_id || !msg.product_id) return prev;
          const currentProduct = prev.products[msg.product_id];
          return {
            ...prev,
            approvedProductID: msg.product_id,
            products: {
              ...prev.products,
              [msg.product_id]: { ...currentProduct, approved: true },
            },
          };
        });
        break;
    }
  }, []);

  const { sendMessage } = useWebSocket({ onMessageReceived: handleWebSocketMessage });

  const createRoom = async (userId: string) => {
    setUserID(userId);
    const realSession = await sessionService.createRoomInBackend(userId);
    setSession(realSession);

    sendMessage({ type: 'JOIN', session_id: realSession.id, user_id: userId });
  };

  const joinRoom = async (sessionId: string, userId: string) => {
    setUserID(userId);
    
    const backendSession = await sessionService.getRoomFromBackend(sessionId);
    
    if (backendSession) {
      setSession(backendSession);
    } else {
      setSession({
        id: sessionId,
        participants: [userId],
        products: {
          "prod_cafetera": {
            id: "prod_cafetera",
            title: "Cafetera Expreso Moulinex Dolce Gusto Genio S",
            price: 135000,
            thumbnail: "https://http2.mlstatic.com/D_NQ_NP_614741-MLA46132470650_052021-O.webp",
            votes: [],
            approved: false
          }
        },
        status: "ACTIVE"
      });
    }

    sendMessage({ type: 'JOIN', session_id: sessionId, user_id: userId });
  };

  const voteProduct = (productId: string) => {
    if (!session) return;
    sendMessage({
      type: 'VOTE',
      session_id: session.id,
      user_id: userID,
      product_id: productId
    });
  };

  return (
    <SessionContext.Provider value={{ session, userID, createRoom, joinRoom, voteProduct }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de un SessionProvider');
  return context;
};