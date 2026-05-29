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
  sendReadyStatus: () => void;
  sendPayStatus: () => void;
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
      case 'ROOM_STRUCTURE_CHANGED':
      case 'USER_JOINED':
      case 'VOTE_UPDATED':
      case 'READY_STATUS_UPDATED':
      case 'PRODUCT_SUGGESTED':
      case 'READY_RESET':
        try {
          const updatedSession = await sessionService.getRoomFromBackend(sessionId);
          if (updatedSession) {
            setSession(updatedSession);
          }
        } catch (error) {
          console.error('Error al sincronizar la sala con el backend:', error);
        }
        break;

      case 'GROUP_CHECKOUT_TRIGGERED':
        try {
          const finishedSession = await sessionService.getRoomFromBackend(sessionId);
          if (finishedSession) {
            (finishedSession as any).approvedProductID = "GROUP_CHECKOUT";
            setSession(finishedSession);
          }
        } catch (error) {
          console.error('Error al gatillar checkout grupal:', error);
        }
        break;

      case 'GROUP_COMPRA_SUCCESSFUL':
        try {
          const successSession = await sessionService.getRoomFromBackend(sessionId);
          if (successSession) {
            successSession.status = "SUCCESS"; 
            setSession(successSession);
          }
        } catch (error) {
          console.error('Error al sincronizar éxito de compra:', error);
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
      sendMessage({ type: 'JOIN', session_id: realSession.id, user_id: userId });
    } catch (err) {
      console.error('Error al crear sala:', err);
    }
  };

  const joinRoom = async (sessionId: string, userId: string) => {
    setUserID(userId);
    try {
      const backendSession = await sessionService.getRoomFromBackend(sessionId);
      if (backendSession) {
        setSession(backendSession);
      } else {
        setSession({ id: sessionId, participants: [userId], products: {}, status: "ACTIVE" });
      }
      sendMessage({ type: 'JOIN', session_id: sessionId, user_id: userId });
    } catch (err) {
      console.error('Error al unirse a la sala:', err);
    }
  };

  const voteProduct = (productId: string) => {
    if (!session) return;
    sendMessage({ type: 'VOTE', session_id: session.id, user_id: userID, product_id: productId });
  };

  const suggestProduct = async (productId: string) => {
    if (!session) return;
    try {
      const updatedSession = await sessionService.suggestProduct(session.id, productId);
      if (updatedSession) setSession(updatedSession);
    } catch (err) {
      console.error('Error al sugerir producto:', err);
    }
  };

  const sendReadyStatus = () => {
    if (!session) return;
    sendMessage({ type: 'READY', session_id: session.id, user_id: userID });
  };

  const sendPayStatus = () => {
    if (!session) return;
    sendMessage({ type: 'PAY', session_id: session.id, user_id: userID });
  };

  return (
    <SessionContext.Provider value={{ session, userID, createRoom, joinRoom, voteProduct, suggestProduct, sendReadyStatus, sendPayStatus }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de un SessionProvider');
  return context;
};