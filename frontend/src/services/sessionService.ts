import { SessionState } from '../types';

const API_URL = 'http://localhost:8080/api';

export const sessionService = {
  createRoomInBackend: async (ownerID: string): Promise<SessionState> => {
    const roomID = "MELI-" + Math.floor(1000 + Math.random() * 9000);

    const sessionData: SessionState = {
      id: roomID,
      participants: [ownerID],
      products: {
        "prod_cafetera": {
          id: "prod_cafetera",
          title: "Cafetera Expreso Moulinex Dolce Gusto Genio S",
          price: 135000,
          thumbnail: "https://http2.mlstatic.com/D_NQ_NP_614741-MLA46132470650_052021-O.webp",
          votes: [],
          approved: false
        },
        "prod_auriculares": {
          id: "prod_auriculares",
          title: "Auriculares Sony WH-CH520 Inalámbricos Blue",
          price: 75000,
          thumbnail: "https://http2.mlstatic.com/D_NQ_NP_791830-MLA54904555845_042023-O.webp",
          votes: [],
          approved: false
        }
      },
      status: "ACTIVE"
    };

    return sessionData;
  },

  getRoomFromBackend: async (roomID: string): Promise<SessionState | null> => {
    try {
      const response = await fetch(`${API_URL}/sessions/${roomID}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn("Conexión directa por HTTP falló, usando datos base para la demo en vivo.");
      return null;
    }
  }
};