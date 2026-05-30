package usecases

import (
	"context"
	"fmt"

	"github.com/abril/meli-co-purchase/internal/domain/repository"
)

type PaySplitUseCase struct {
	repo repository.SessionRepository
}

func NewPaySplitUseCase(repo repository.SessionRepository) *PaySplitUseCase {
	return &PaySplitUseCase{repo: repo}
}

func (uc *PaySplitUseCase) Execute(ctx context.Context, sessionID string, userID string) (bool, error) {
	session, err := uc.repo.FindByID(ctx, sessionID)
	if err != nil || session == nil {
		return false, fmt.Errorf("sala no encontrada")
	}

	allPaid := session.RegisterPayment(userID)

	err = uc.repo.Save(ctx, session)
	return allPaid, err
}
