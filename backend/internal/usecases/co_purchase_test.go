package usecases

import (
	"context"
	"testing"

	"github.com/abril/meli-co-purchase/internal/domain/entities"
	"github.com/abril/meli-co-purchase/internal/usecases/mocks"
)

func TestProductosElegidosPorAlgoritmoDeMayoriaSimple(t *testing.T) {
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

	// Tiara vota la cafetera (2 votos de 3)
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

func TestPagoDivididoConUnanimidad(t *testing.T) {
	ctx := context.Background()
	repoFalso := mocks.NewSessionRepositoryMock()
	casoCrearSala := NewCreateSessionUseCase(repoFalso)

	sala, _ := casoCrearSala.Execute(ctx, "user_abril")
	_ = sala.AddParticipant("user_claudia")
	_ = sala.AddParticipant("user_tiara")

	cafetera := &entities.Product{
		ID:    "prod_cafetera",
		Title: "Cafetera de Claudia",
		Price: 90000,
	}
	_ = sala.AddProduct(cafetera)

	sala.Products["prod_cafetera"].Approved = true

	err := sala.InitCheckout("prod_cafetera")
	if err != nil {
		t.Fatalf("No se pudo iniciar el checkout: %v", err)
	}

	paymentModule := sala.CurrentPayment

	montoEsperado := 30000.0
	if paymentModule.Payments["user_abril"].Amount != montoEsperado {
		t.Errorf("ERROR: El monto calculado para Abril es incorrecto. Esperado: %v, Obtenido: %v", montoEsperado, paymentModule.Payments["user_abril"].Amount)
	}

	// Abril paga sus $30.000
	todoPago := paymentModule.ConfirmUserPayment("user_abril")
	if todoPago {
		t.Errorf("ERROR: El pago grupal figura como COMPLETADO pero solo pagó 1 de 3 personas.")
	}

	// Claudia paga sus $30.000
	todoPago = paymentModule.ConfirmUserPayment("user_claudia")
	if todoPago {
		t.Errorf("ERROR: El pago grupal figura como COMPLETADO pero solo pagaron 2 de 3 personas (Falta Tiara).")
	}

	// El estado del pago general sigue pendiente
	if paymentModule.Status != "PENDING" {
		t.Errorf("ERROR: El estado debería ser PENDING hasta que pague el último. Estado actual: %s", paymentModule.Status)
	}

	// Tiara paga sus $30.000
	todoPago = paymentModule.ConfirmUserPayment("user_tiara")

	// El estado del pago general esta completaddo
	if !todoPago {
		t.Errorf("ERROR: Al confirmar el pago de Tiara, el sistema debería avisar que el pago grupal se completó.")
	}
	if paymentModule.Status != "COMPLETED" {
		t.Errorf("ERROR: El estado final del pago grupal debería ser COMPLETED. Obtenido: %s", paymentModule.Status)
	}
}
