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
		Title:     "Cafetera Expreso Moulinex Dolce Gusto Genio S Plus Black",
		Price:     145000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_614741-MLA46132470650_052021-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_auriculares",
		Title:     "Auriculares Bluetooth Sony WH-CH520 Inalámbricos Blue",
		Price:     78000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_791830-MLA54904555845_042023-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_termo",
		Title:     "Termo Stanley Classic Custom Insulated 1.4 Litros Nightfall",
		Price:     95000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_824584-MLA74353457591_022024-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_teclado",
		Title:     "Teclado Mecánico Gamer Logitech G Pro K/DA RGB Edición Especial",
		Price:     120000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_745973-MLA47101751168_082021-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_mouse",
		Title:     "Mouse Inalámbrico Logitech G305 LightSpeed Gamer Black",
		Price:     49000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_675231-MLA32442672322_102019-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_monitor",
		Title:     "Monitor Gamer Samsung Odyssey G3 24'' FHD 144Hz 1ms Freesync",
		Price:     310000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_888915-MLA70605942207_072023-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_buza",
		Title:     "Buza Canguro Con Capucha Oversize Unisex Frisa Premium Black",
		Price:     28000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_769395-MLA74116239129_012024-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_zapas",
		Title:     "Zapatillas Adidas Grand Court Base 2.0 Urbanas Blancas",
		Price:     89000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_705273-MLA54984245648_042023-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_mochila",
		Title:     "Mochila Portanotebook Impermeable Antirrobo Con Puerto USB Black",
		Price:     35000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_600109-MLA51369719113_092022-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
	{
		ID:        "meli_parlante",
		Title:     "Parlante Bluetooth Portátil JBL GO 4 Water Resistant Blue",
		Price:     65000,
		Thumbnail: "https://http2.mlstatic.com/D_NQ_NP_909985-MLU75727040431_042024-O.webp",
		Votes:     []string{},
		Approved:  false,
	},
}

func (p *Product) AddVote(userID string) {
	for _, id := range p.Votes {
		if id == userID {
			return
		}
	}
	p.Votes = append(p.Votes, userID)
}
