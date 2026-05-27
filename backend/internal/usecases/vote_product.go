package usecases

import (
	"context"
	"fmt"

	"github.com/abril/meli-co-purchase/internal/domain/repository"
)

type VoteProductUseCase struct {
	repo repository.SessionRepository
}

func NewVoteProductUseCase(repo repository.SessionRepository) *VoteProductUseCase {
	return &VoteProductUseCase{
		repo: repo,
	}
}

type VoteProductRequest struct {
	SessionID string
	ProductID string
	UserID    string
}

func (uc *VoteProductUseCase) Execute(ctx context.Context, req VoteProductRequest) (bool, error) {
	session, err := uc.repo.FindByID(ctx, req.SessionID)
	if err != nil {
		return false, fmt.Errorf("error al buscar la sesión: %w", err)
	}
	if session == nil {
		return false, fmt.Errorf("la sesión %s no existe", req.SessionID)
	}

	isApproved, err := session.VoteProduct(req.ProductID, req.UserID)
	if err != nil {
		return false, err
	}

	err = uc.repo.Save(ctx, session)
	if err != nil {
		return false, fmt.Errorf("error al actualizar la sesión: %w", err)
	}

	return isApproved, nil
}