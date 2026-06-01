package delivery

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/abril/meli-co-purchase/internal/domain/repository"
	"github.com/abril/meli-co-purchase/internal/usecases"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WSMessage struct {
	Type       string   `json:"type"`
	SessionID  string   `json:"session_id"`
	UserID     string   `json:"user_id"`
	ProductID  string   `json:"product_id,omitempty"`
	ReadyUsers []string `json:"ready_users,omitempty"`
}

type WebSocketHandler struct {
	voteUseCase  *usecases.VoteProductUseCase
	readyUseCase *usecases.ReadySessionUseCase
	payUseCase   *usecases.PaySplitUseCase
	repo         repository.SessionRepository
	rooms        map[string][]*websocket.Conn
	roomsMutex   sync.RWMutex
}

func NewWebSocketHandler(voteUC *usecases.VoteProductUseCase, readyUC *usecases.ReadySessionUseCase, payUC *usecases.PaySplitUseCase, repo repository.SessionRepository) *WebSocketHandler {
	return &WebSocketHandler{
		voteUseCase:  voteUC,
		readyUseCase: readyUC,
		payUseCase:   payUC,
		repo:         repo,
		rooms:        make(map[string][]*websocket.Conn),
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

			session, err := h.repo.FindByID(context.Background(), msg.SessionID)

			if err == nil && session != nil {
				_ = session.AddParticipant(msg.UserID)
				_ = h.repo.Save(context.Background(), session)
			}

			h.broadcastToRoom(msg.SessionID, WSMessage{
				Type:      "ROOM_STRUCTURE_CHANGED",
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
				Type:      "ROOM_STRUCTURE_CHANGED",
				SessionID: msg.SessionID,
				UserID:    msg.UserID,
				ProductID: msg.ProductID,
			})

		case "READY":
			allReady, err := h.readyUseCase.Execute(context.Background(), msg.SessionID, msg.UserID)
			if err != nil {
				log.Printf("Error al procesar estado de listo: %v", err)
				continue
			}

			if allReady {
				h.broadcastToRoom(msg.SessionID, WSMessage{
					Type:      "GROUP_CHECKOUT_TRIGGERED",
					SessionID: msg.SessionID,
				})
			} else {
				h.broadcastToRoom(msg.SessionID, WSMessage{
					Type:      "ROOM_STRUCTURE_CHANGED",
					SessionID: msg.SessionID,
					UserID:    msg.UserID,
				})
			}
		case "PAY":
			allPaid, err := h.payUseCase.Execute(context.Background(), msg.SessionID, msg.UserID)
			if err != nil {
				log.Printf("Error al procesar pago: %v", err)
				continue
			}

			if allPaid {
				h.broadcastToRoom(msg.SessionID, WSMessage{
					Type:      "GROUP_COMPRA_SUCCESSFUL",
					SessionID: msg.SessionID,
				})
			} else {
				h.broadcastToRoom(msg.SessionID, WSMessage{
					Type:      "ROOM_STRUCTURE_CHANGED",
					SessionID: msg.SessionID,
					UserID:    msg.UserID,
				})
			}
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
