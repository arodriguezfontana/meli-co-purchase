package entities

import "errors"

var (
	ErrSessionNotActive = errors.New("la sesión no se encuentra activa")
	ErrUserNotInSession = errors.New("el usuario no pertenece a esta sala")
	ErrProductNotFound  = errors.New("el producto no existe en la sala")
)

type Session struct {
	ID           string              `json:"id"`
	Participants []string            `json:"participants"`
	Products     map[string]*Product `json:"products"`
	Status       string              `json:"status"`
}

func NewSession(id string, creatorID string) *Session {
	return &Session{
		ID:           id,
		Participants: []string{creatorID},
		Products:     make(map[string]*Product),
		Status:       "ACTIVE",
	}
}

func (s *Session) AddParticipant(userID string) error {
	if s.Status != "ACTIVE" {
		return ErrSessionNotActive
	}

	for _, id := range s.Participants {
		if id == userID {
			return nil
		}
	}

	s.Participants = append(s.Participants, userID)
	return nil
}

func (s *Session) AddProduct(p *Product) error {
	if s.Status != "ACTIVE" {
		return ErrSessionNotActive
	}

	if _, exists := s.Products[p.ID]; !exists {
		p.Votes = []string{}
		p.Approved = false
		s.Products[p.ID] = p
	}
	return nil
}

func (s *Session) VoteProduct(productID string, userID string) (bool, error) {
	if s.Status != "ACTIVE" {
		return false, ErrSessionNotActive
	}

	userBelongs := false
	for _, id := range s.Participants {
		if id == userID {
			userBelongs = true
			break
		}
	}
	if !userBelongs {
		return false, ErrUserNotInSession
	}

	product, exists := s.Products[productID]
	if !exists {
		return false, ErrProductNotFound
	}

	product.AddVote(userID)

	requiredVotes := float64(len(s.Participants)) / 2.0
	if float64(len(product.Votes)) > requiredVotes {
		product.Approved = true
	}

	return product.Approved, nil
}
