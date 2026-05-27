export interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  votes: string[];
  approved: boolean;
}

export interface SessionState {
  id: string;
  participants: string[];
  products: { [key: string]: Product };
  status: string;
  approvedProductID?: string;
}