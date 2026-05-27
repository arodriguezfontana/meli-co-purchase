package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/abril/meli-co-purchase/internal/infrastructure/database"
	"github.com/abril/meli-co-purchase/internal/infrastructure/delivery"
	"github.com/abril/meli-co-purchase/internal/usecases"
	"github.com/redis/go-redis/v9"
)

func main() {
	log.Println("Iniciando Meli Co-Purchase Backend...")

	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Printf("ADVERTENCIA: No se pudo conectar a Redis (%v). El repositorio real fallará si no está corriendo Docker/Redis local.", err)
	} else {
		log.Println("Conexión a Redis establecida exitosamente en memoria RAM.")
	}

	redisRepo := database.NewRedisSessionRepository(redisClient, 2*time.Hour)
	voteUseCase := usecases.NewVoteProductUseCase(redisRepo)
	wsHandler := delivery.NewWebSocketHandler(voteUseCase)

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", wsHandler.HandleConnection)
	
	serverAddr := ":8080"
	
	log.Printf("Servidor corriendo y escuchando en el puerto %s", serverAddr)
	log.Printf("Endpoint de WebSocket listo en: ws://localhost%s/ws", serverAddr)

	err := http.ListenAndServe(serverAddr, mux)
	if err != nil {
		log.Fatalf("Error crítico, el servidor se detuvo: %v", err)
	}
}
