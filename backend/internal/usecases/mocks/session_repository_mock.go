package mocks

import (
	"context"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
)

type SessionRepositoryMock struct {
	storage map[string]*entities.Session
}

func NewSessionRepositoryMock() *SessionRepositoryMock {
	return &SessionRepositoryMock{
		storage: make(map[string]*entities.Session),
	}
}

func (m *SessionRepositoryMock) Save(ctx context.Context, session *entities.Session) error {
	m.storage[session.ID] = session
	return nil
}

func (m *SessionRepositoryMock) FindByID(ctx context.Context, id string) (*entities.Session, error) {
	session, existe := m.storage[id]
	if !existe {
		return nil, nil
	}
	return session, nil
}

func (m *SessionRepositoryMock) Delete(ctx context.Context, id string) error {
	delete(m.storage, id)
	return nil
}
