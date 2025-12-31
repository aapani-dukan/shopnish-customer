export interface Seller {
  id: number;
  businessName: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[] | null;
  brand: string | null;
  stock: number;
  rating: number | null;
  reviewCount: number | null;
  categoryName: string | null;
  seller: Seller;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  };
}