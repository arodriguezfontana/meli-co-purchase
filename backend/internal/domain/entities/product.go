package entities

type Product struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Price     float64  `json:"price"`
	Thumbnail string   `json:"thumbnail"`
	Votes     []string `json:"votes"`
	Approved  bool     `json:"approved"`
}

func (p *Product) AddVote(userID string) {
	for _, id := range p.Votes {
		if id == userID {
			return
		}
	}
	p.Votes = append(p.Votes, userID)
}
