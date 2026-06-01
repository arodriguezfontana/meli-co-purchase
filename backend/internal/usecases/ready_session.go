package usecases

import (
	"context"
	"fmt"

	"github.com/abril/meli-co-purchase/internal/domain/repository"
)

type ReadySessionUseCase struct {
	repo repository.SessionRepository
}

func NewReadySessionUseCase(repo repository.SessionRepository) *ReadySessionUseCase {
	return &ReadySessionUseCase{repo: repo}
}

func (uc *ReadySessionUseCase) Execute(ctx context.Context, sessionID string, userID string) (bool, error) {
	session, err := uc.repo.FindByID(ctx, sessionID)
	if err != nil || session == nil {
		return false, fmt.Errorf("la sala no existe o falló redis")
	}

	allReady := session.UserIsReady(userID)

	if allReady {
		var totalAmount float64
		for _, prod := range session.Products {
			if prod.Approved {
				totalAmount += prod.Price
			}
		}
	}

	err = uc.repo.Save(ctx, session)
	return allReady, err
}
