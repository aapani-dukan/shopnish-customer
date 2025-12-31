import api from './api';
import { Product } from '../types/Product';

export const fetchAllProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

// Category ke hisab se products lane ke liye (Bade app ke liye zaroori)
export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const response = await api.get(`/products?category=${category}`);
  return response.data;
};