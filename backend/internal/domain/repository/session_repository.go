package repository

import (
	"context"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
)

type SessionRepository interface {
	Save(ctx context.Context, session *entities.Session) error

	FindByID(ctx context.Context, id string) (*entities.Session, error)

	Delete(ctx context.Context, id string) error
}
