package database

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
	"github.com/redis/go-redis/v9"
)

type RedisSessionRepository struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisSessionRepository(client *redis.Client, ttl time.Duration) *RedisSessionRepository {
	return &RedisSessionRepository{
		client: client,
		ttl:    ttl,
	}
}

func (r *RedisSessionRepository) Save(ctx context.Context, session *entities.Session) error {
	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("error al serializar la sesion a JSON: %w", err)
	}

	key := fmt.Sprintf("session:%s", session.ID)
	err = r.client.Set(ctx, key, data, r.ttl).Err()
	if err != nil {
		return fmt.Errorf("error al guardar en redis: %w", err)
	}

	return nil
}

func (r *RedisSessionRepository) FindByID(ctx context.Context, id string) (*entities.Session, error) {
	key := fmt.Sprintf("session:%s", id)

	data, err := r.client.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("error al obtener de redis: %w", err)
	}

	var session entities.Session
	err = json.Unmarshal(data, &session)
	if err != nil {
		return nil, fmt.Errorf("error al deserializar el JSON de la sesion: %w", err)
	}

	return &session, nil
}

func (r *RedisSessionRepository) Delete(ctx context.Context, id string) error {
	key := fmt.Sprintf("session:%s", id)
	return r.client.Del(ctx, key).Err()
}
