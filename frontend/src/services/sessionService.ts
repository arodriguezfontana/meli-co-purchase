import { SessionState } from '../types';

const API_BASE_URL = 'http://localhost:8080'; 

export const sessionService = {
  getCatalog: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Error al traer el catálogo');
      return await response.json();
    } catch (error) {
      console.error('Error HTTP al traer catálogo:', error);
      return [];
    }
  },

  suggestProduct: async (roomID: string, productID: string): Promise<SessionState | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${roomID}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productID }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error HTTP al sugerir producto:', error);
      return null;
    }
  },

  createRoomInBackend: async (ownerID: string): Promise<SessionState> => {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: ownerID }),
    });
    return await response.json();
  },

  getRoomFromBackend: async (roomID: string): Promise<SessionState | null> => {
    const response = await fetch(`${API_BASE_URL}/sessions/${roomID}`);
    if (!response.ok) return null;
    return await response.json();
  }
};