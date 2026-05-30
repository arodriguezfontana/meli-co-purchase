package entities

type Product struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Price     float64  `json:"price"`
	Thumbnail string   `json:"thumbnail"`
	Votes     []string `json:"votes"`
	Approved  bool     `json:"approved"`
}

var Catalog = []Product{
	{
		ID:        "meli_cafetera",
		Title:     "Cafetera Express Gadnic Cm3000 3 en 1 15L Gris",
		Price:     259000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_716087-MLA100066480983_122025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_auriculares",
		Title:     "Auriculares Inalámbricos Xiaomi Redmi Buds 6 Play Negro",
		Price:     29000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_802305-MLA95679505222_102025-OO.jpg",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_termo",
		Title:     "Termo Stanley 950ml Con Manija Y Tapón Cebador - Original",
		Price:     139000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_607656-MLA99468837238_112025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_teclado",
		Title:     "Teclado Mecánico Gamer Hyperx Alloy Rise 75 Rgb Lineal Teclado Negro Idioma Español Latinoamérica",
		Price:     200000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_621197-MLA99385773380_112025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_mouse",
		Title:     "Mouse Gamer Inalámbrico Logitech Lightspeed G305 Color Blanco",
		Price:     57000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_732776-MLA99558362230_122025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_freidora",
		Title:     "Freidora De Aire 10lts Westinghouse Afr-1802 Táctil 12func Color Gris oscuro",
		Price:     140000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_829854-MLA91872135911_092025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_compu",
		Title:     "Notebook Lenovo IdeaPad 1 con Intel Celeron, 12GB RAM y 128GB SSD",
		Price:     560000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_761852-MLA100001156811_112025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_monitor",
		Title:     "Monitor Msi Pro Mp251 E2 24.5 Pulgadas Ips Fhd 120hz 1ms Color Negro",
		Price:     195000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_900933-MLA111001399533_042026-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_mochila",
		Title:     "Mochila Porta Notebook Bagcherry Urbana 430000 Color Negro Diseño lisa 25L",
		Price:     21000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_804324-MLA99397174998_112025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_parlante",
		Title:     "Parlante Bluetooth Jbl Portátil Go 4 Waterproof Graves",
		Price:     75000,
		Thumbnail: "https://http2.mlstatic.com/D_Q_NP_850185-MLA84848519677_052025-F.webp",
		Votes:     []string{},
		Approved:  false,
	},
}

func (p *Product) ToggleVote(userID string) {
	for i, id := range p.Votes {
		if id == userID {
			p.Votes = append(p.Votes[:i], p.Votes[i+1:]...)
			return
		}
	}
	p.Votes = append(p.Votes, userID)
}
