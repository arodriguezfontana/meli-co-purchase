package delivery

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/abril/meli-co-purchase/internal/usecases"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WSMessage struct {
	Type      string `json:"type"`
	SessionID string `json:"session_id"`
	UserID    string `json:"user_id"`
	ProductID string `json:"product_id,omitempty"`
}

type WebSocketHandler struct {
	voteUseCase *usecases.VoteProductUseCase
	rooms       map[string][]*websocket.Conn
	roomsMutex  sync.RWMutex
}

func NewWebSocketHandler(voteUC *usecases.VoteProductUseCase) *WebSocketHandler {
	return &WebSocketHandler{
		voteUseCase: voteUC,
		rooms:       make(map[string][]*websocket.Conn),
	}
}

func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error al upgradear a WebSocket: %v", err)
		return
	}
	defer conn.Close()

	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Cliente desconectado")
			h.removeConnection(conn)
			break
		}

		var msg WSMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			log.Printf("Error de JSON inválido: %v", err)
			continue
		}

		switch msg.Type {
		case "JOIN":
			h.addConnectionToRoom(msg.SessionID, conn)
			h.broadcastToRoom(msg.SessionID, WSMessage{
				Type:      "USER_JOINED",
				SessionID: msg.SessionID,
				UserID:    msg.UserID,
			})

		case "VOTE":
			req := usecases.VoteProductRequest{
				SessionID: msg.SessionID,
				ProductID: msg.ProductID,
				UserID:    msg.UserID,
			}

			_, err := h.voteUseCase.Execute(context.Background(), req)
			if err != nil {
				log.Printf("Error procesando voto en el negocio: %v", err)
				continue
			}

			h.broadcastToRoom(msg.SessionID, WSMessage{
				Type:      "VOTE_UPDATED",
				SessionID: msg.SessionID,
				UserID:    msg.UserID,
				ProductID: msg.ProductID,
			})
		}
	}
}

func (h *WebSocketHandler) addConnectionToRoom(sessionID string, conn *websocket.Conn) {
	h.roomsMutex.Lock()
	defer h.roomsMutex.Unlock()
	h.rooms[sessionID] = append(h.rooms[sessionID], conn)
}

func (h *WebSocketHandler) broadcastToRoom(sessionID string, msg WSMessage) {
	h.roomsMutex.RLock()
	connections := h.rooms[sessionID]
	h.roomsMutex.RUnlock()

	msgBytes, _ := json.Marshal(msg)

	for _, conn := range connections {
		_ = conn.WriteMessage(websocket.TextMessage, msgBytes)
	}
}

func (h *WebSocketHandler) removeConnection(conn *websocket.Conn) {
	h.roomsMutex.Lock()
	defer h.roomsMutex.Unlock()

	for roomID, conns := range h.rooms {
		for i, c := range conns {
			if c == conn {
				h.rooms[roomID] = append(conns[:i], conns[i+1:]...)
				break
			}
		}
	}
}
