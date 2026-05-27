package entities

type ParticipantPayment struct {
	UserID    string  `json:"user_id"`
	Amount    float64 `json:"amount"`
	Confirmed bool    `json:"confirmed"`
}

type SplitPayment struct {
	ProductID   string                         `json:"product_id"`
	TotalAmount float64                        `json:"total_amount"`
	Payments    map[string]*ParticipantPayment `json:"payments"`
	Status      string                         `json:"status"`
}

func NewSplitPayment(productID string, totalAmount float64, userIDs []string) *SplitPayment {
	payments := make(map[string]*ParticipantPayment)

	amountPerUser := totalAmount / float64(len(userIDs))

	for _, userID := range userIDs {
		payments[userID] = &ParticipantPayment{
			UserID:    userID,
			Amount:    amountPerUser,
			Confirmed: false,
		}
	}

	return &SplitPayment{
		ProductID:   productID,
		TotalAmount: totalAmount,
		Payments:    payments,
		Status:      "PENDING",
	}
}

func (sp *SplitPayment) ConfirmUserPayment(userID string) bool {
	payment, exists := sp.Payments[userID]
	if !exists {
		return false
	}

	payment.Confirmed = true

	allConfirmed := true
	for _, p := range sp.Payments {
		if !p.Confirmed {
			allConfirmed = false
			break
		}
	}

	if allConfirmed {
		sp.Status = "COMPLETED"
	}

	return allConfirmed
}
