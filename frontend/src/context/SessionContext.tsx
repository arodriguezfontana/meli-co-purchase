import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWebSocket, WSMessage } from '../hooks/useWebSocket.ts';
import { SessionState } from '../types';
import { sessionService } from '../services/sessionService.ts';

interface SessionContextType {
  session: SessionState | null;
  userID: string;
  createRoom: (userId: string) => Promise<void>;
  joinRoom: (sessionId: string, userId: string) => Promise<void>;
  voteProduct: (productId: string) => void;
  suggestProduct: (productId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [userID, setUserID] = useState<string>('');

  const handleWebSocketMessage = useCallback(async (msg: any) => {
    const sessionId = msg.session_id || msg.SessionID;
    const userId = msg.user_id || msg.UserID;
    const productId = msg.product_id || msg.ProductID;

    switch (msg.type) {
      case 'USER_JOINED':
        setSession((prev) => {
          if (!prev) return prev;
          if (prev.id === sessionId) {
            if (prev.participants.includes(userId)) return prev;
            return { ...prev, participants: [...prev.participants, userId] };
          }
          return prev;
        });
        break;

      case 'VOTE_UPDATED':
        setSession((prev) => {
          if (!prev || prev.id !== sessionId || !productId) return prev;
          
          const currentProduct = prev.products[productId];
          if (!currentProduct) {
            console.warn(`[Context] No se encontró el producto con ID: ${productId} en el estado local.`);
            return prev;
          }

          const updatedVotes = currentProduct.votes.includes(userId)
            ? currentProduct.votes
            : [...currentProduct.votes, userId];

          return {
            ...prev,
            products: {
              ...prev.products,
              [productId]: { ...currentProduct, votes: updatedVotes },
            },
          };
        });
        break;

      case 'PRODUCT_APPROVED':
        setSession((prev) => {
          if (!prev || prev.id !== sessionId || !productId) return prev;
          const currentProduct = prev.products[productId];
          if (!currentProduct) return prev;

          return {
            ...prev,
            approvedProductID: productId,
            products: {
              ...prev.products,
              [productId]: { ...currentProduct, approved: true },
            },
          };
        });
        break;

      case 'PRODUCT_SUGGESTED': 
        try {
          const updatedSession = await sessionService.getRoomFromBackend(sessionId);
          if (updatedSession) {
            setSession(updatedSession);
          }
        } catch (error) {
          console.error('Error al sincronizar la sala tras producto sugerido:', error);
        }
        break;
      
      default:
        console.log('[Context] Mensaje WebSocket de tipo no registrado:', msg.type);
    }
  }, []);

  const { sendMessage } = useWebSocket({ onMessageReceived: handleWebSocketMessage });

  const createRoom = async (userId: string) => {
    setUserID(userId);
    try {
      const realSession = await sessionService.createRoomInBackend(userId);
      setSession(realSession);
      
      sendMessage({ 
        type: 'JOIN', 
        session_id: realSession.id, 
        user_id: userId 
      });
    } catch (err) {
      console.error('Error al instanciar la creación de sala:', err);
    }
  };

  const joinRoom = async (sessionId: string, userId: string) => {
    setUserID(userId);
    try {
      const backendSession = await sessionService.getRoomFromBackend(sessionId);
      
      if (backendSession) {
        setSession(backendSession);
      } else {
        setSession({
          id: sessionId,
          participants: [userId],
          products: {},
          status: "ACTIVE"
        });
      }

      sendMessage({ 
        type: 'JOIN', 
        session_id: sessionId, 
        user_id: userId 
      });
    } catch (err) {
      console.error('Error crítico al intentar unirse a la sala:', err);
    }
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

  const suggestProduct = async (productId: string) => {
    if (!session) return;
    try {
      const updatedSession = await sessionService.suggestProduct(session.id, productId);
      if (updatedSession) {
        setSession(updatedSession);
      }
    } catch (err) {
      console.error('Error al sugerir producto:', err);
    }
  };

  return (
    <SessionContext.Provider value={{ session, userID, createRoom, joinRoom, voteProduct, suggestProduct }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de un SessionProvider');
  return context;
};