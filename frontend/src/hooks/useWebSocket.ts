import { useEffect, useRef, useCallback } from 'react';

export interface WSMessage {
  type: 'JOIN' | 'VOTE' | 'USER_JOINED' | 'VOTE_UPDATED' | 'PRODUCT_APPROVED' | 'READY' | 'READY_STATUS_UPDATED' | 'GROUP_CHECKOUT_TRIGGERED' | 'READY_RESET' | 'PRODUCT_SUGGESTED';
  session_id: string;
  user_id: string;
  product_id?: string;
}

interface UseWebSocketProps {
  onMessageReceived: (msg: WSMessage) => void;
}

export const useWebSocket = ({ onMessageReceived }: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  
  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    ws.current = new WebSocket('ws://localhost:8080/ws');

    ws.current.onopen = () => {
      console.log('Conectado exitosamente al backend de Go');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        onMessageRef.current(message); 
      } catch (error) {
        console.error('Error al parsear JSON del servidor:', error);
      }
    };

    ws.current.onclose = (event) => {
      console.log(`Conexión cerrada (Código: ${event.code}). Reintentando en 3s...`);
      ws.current = null;
      setTimeout(() => connect(), 3000); 
    };

    ws.current.onerror = (error) => {
      console.error('Error detectado en el canal:', error);
    };
  }, []);

  const sendMessage = useCallback((msg: WSMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    } else if (ws.current?.readyState === WebSocket.CONNECTING) {
      console.log('Canal negociando conexión... reintentando envío en 500ms');
      setTimeout(() => sendMessage(msg), 500);
    } else {
      console.warn('No se envió el mensaje. El cable está muerto o en estado:', ws.current?.readyState);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { sendMessage };
};