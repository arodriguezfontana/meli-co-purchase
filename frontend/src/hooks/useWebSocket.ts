import { useEffect, useRef, useCallback } from 'react';

export interface WSMessage {
  type: 'JOIN' | 'VOTE' | 'USER_JOINED' | 'VOTE_UPDATED' | 'PRODUCT_APPROVED';
  session_id: string;
  user_id: string;
  product_id?: string;
}

interface UseWebSocketProps {
  onMessageReceived: (msg: WSMessage) => void;
}

export const useWebSocket = ({ onMessageReceived }: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket('ws://localhost:8080/ws');

    ws.current.onopen = () => {
      console.log('Conectado al backend de Go');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        onMessageReceived(message); 
      } catch (error) {
        console.error('Error al parsear el mensaje del servidor:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('Conexión WebSocket cerrada. Intentando reconectar.');
      setTimeout(() => connect(), 3000); 
    };

    ws.current.onerror = (error) => {
      console.error('Error en el WebSocket:', error);
    };
  }, [onMessageReceived]);

  const sendMessage = useCallback((msg: WSMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    } else {
      console.warn('No se pudo enviar el mensaje, WebSocket desconectado.');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return { sendMessage };
};