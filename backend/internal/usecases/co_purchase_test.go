package usecases

import (
	"context"
	"testing"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
	"github.com/abril/meli-co-purchase/internal/usecases/mocks"
)

func TestAlgoritmoDeMayoria(t *testing.T) {
	ctx := context.Background()

	repoFalso := mocks.NewSessionRepositoryMock()

	casoCrearSala := NewCreateSessionUseCase(repoFalso)
	casoVotar := NewVoteProductUseCase(repoFalso)

	salaCreada, err := casoCrearSala.Execute(ctx, "user_abril")
	if err != nil {
		t.Fatalf("No se pudo crear la sala: %v", err)
	}

	_ = salaCreada.AddParticipant("user_claudia")
	_ = salaCreada.AddParticipant("user_tiara")

	cafetera := &entities.Product{
		ID:    "prod_cafetera",
		Title: "Cafetera de Claudia",
		Price: 90000,
	}
	_ = salaCreada.AddProduct(cafetera)

	_ = repoFalso.Save(ctx, salaCreada)

	// Claudia vota la cafetera (1 voto de 3)
	estaAprobado, err := casoVotar.Execute(ctx, VoteProductRequest{
		SessionID: salaCreada.ID,
		ProductID: "prod_cafetera",
		UserID:    "user_claudia",
	})

	if err != nil {
		t.Fatalf("Falló la ejecución del primer voto: %v", err)
	}

	// Como hay 1 solo voto de 3, no esta aprobado.
	if estaAprobado == true {
		t.Errorf("ERROR: La cafetera se aprobó con solo 1 voto de 3 personas. No hay mayoría.")
	}

	// Tiara también vota la cafetera (2 votos de 3)
	estaAprobado, err = casoVotar.Execute(ctx, VoteProductRequest{
		SessionID: salaCreada.ID,
		ProductID: "prod_cafetera",
		UserID:    "user_tiara",
	})

	if err != nil {
		t.Fatalf("Falló la ejecución del segundo voto: %v", err)
	}

	// Al tener 2 de 3 votos, está aprobada.
	if estaAprobado == false {
		t.Errorf("ERROR: La cafetera debería estar aprobada. Ya tiene 2 votos de 3 personas.")
	}
}
