package delivery

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
	"github.com/abril/meli-co-purchase/internal/domain/repository"
	"github.com/abril/meli-co-purchase/internal/usecases"
)

func SetupRoutes(mux *http.ServeMux, createUC *usecases.CreateSessionUseCase, repo repository.SessionRepository, wsHandler *WebSocketHandler) {

	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next(w, r)
		}
	}

	mux.HandleFunc("/products", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entities.Catalog)
	}))

	mux.HandleFunc("/sessions", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			OwnerID string `json:"owner_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "JSON inválido", http.StatusBadRequest)
			return
		}

		session, err := createUC.Execute(r.Context(), req.OwnerID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if session.Products == nil {
			session.Products = make(map[string]*entities.Product)
			_ = repo.Save(r.Context(), session)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(session)
	}))

	mux.HandleFunc("/sessions/", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")

		if len(parts) >= 4 && parts[3] == "products" {
			handleSuggestProduct(w, r, parts[2], repo, wsHandler)
			return
		}

		if r.Method != http.MethodGet {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
			return
		}

		roomID := parts[2]
		session, err := repo.FindByID(r.Context(), roomID)
		if err != nil || session == nil {
			http.Error(w, "La sala no existe en Redis", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session)
	}))

	mux.HandleFunc("/ws", wsHandler.HandleConnection)
}

func handleSuggestProduct(w http.ResponseWriter, r *http.Request, roomID string, repo repository.SessionRepository, wsHandler *WebSocketHandler) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ProductID string `json:"product_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	var targetProduct *entities.Product
	for i := range entities.Catalog {
		if entities.Catalog[i].ID == req.ProductID {
			targetProduct = &entities.Catalog[i]
			break
		}
	}
	if targetProduct == nil {
		http.Error(w, "Producto no encontrado en catálogo", http.StatusNotFound)
		return
	}

	session, err := repo.FindByID(r.Context(), roomID)
	if err != nil || session == nil {
		http.Error(w, "Sala no encontrada", http.StatusNotFound)
		return
	}

	if session.Products == nil {
		session.Products = make(map[string]*entities.Product)
	}

	productCopy := *targetProduct
	session.Products[targetProduct.ID] = &productCopy

	_ = repo.Save(r.Context(), session)

	wsHandler.broadcastToRoom(roomID, WSMessage{
		Type:      "PRODUCT_SUGGESTED",
		SessionID: roomID,
		ProductID: targetProduct.ID,
	})

	wsHandler.broadcastToRoom(roomID, WSMessage{Type: "READY_RESET", SessionID: roomID})
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}
