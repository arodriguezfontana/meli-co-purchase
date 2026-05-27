package usecases

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
	"github.com/abril/meli-co-purchase/internal/domain/repository"
)

type CreateSessionUseCase struct {
	repo repository.SessionRepository
}

func NewCreateSessionUseCase(repo repository.SessionRepository) *CreateSessionUseCase {
	return &CreateSessionUseCase{
		repo: repo,
	}
}

func (uc *CreateSessionUseCase) Execute(ctx context.Context, creatorID string) (*entities.Session, error) {
	code, err := generateFriendlyCode()
	if err != nil {
		return nil, fmt.Errorf("error al generar el código de la sala: %w", err)
	}

	session := entities.NewSession(code, creatorID)

	err = uc.repo.Save(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("error al guardar la sesión: %w", err)
	}

	return session, nil
}

func generateFriendlyCode() (string, error) {
	nBig, err := rand.Int(rand.Reader, big.NewInt(9000))
	if err != nil {
		return "", err
	}
	num := nBig.Int64() + 1000
	return fmt.Sprintf("MELI-%d", num), nil
}
