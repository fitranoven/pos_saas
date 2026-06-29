import axios from 'axios';
import type { Product, Category } from '../store/cartStore';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
});

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
}

export interface ProductQuery {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface DashboardData {
  kpi: {
    revenue: number;
    transactions: number;
    itemsSold: number;
    avgOrderValue: number;
    taxCollected: number;
    discountGiven: number;
  };
  salesByDay: { date: string; label: string; total: number; count: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  lowStock: { name: string; stock: number; threshold: number }[];
}

export interface TransactionPayload {
  items: { productId: string; quantity: number }[];
  paymentType: string;
  status: string;
  discount?: number; // nominal amount (IDR)
  taxRate?: number; // percentage
}

// Products
export const fetchProducts = (params?: ProductQuery) =>
  api.get<ProductsResponse>('/api/products', { params });

export const createProduct = (data: Partial<Product>) =>
  api.post<Product>('/api/products', data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  api.put<Product>(`/api/products/${id}`, data);

export const deleteProduct = (id: string) =>
  api.delete(`/api/products/${id}`);

// Reports
export const fetchDashboard = () =>
  api.get<DashboardData>('/api/reports/dashboard');

// Categories
export const fetchCategories = (params?: { search?: string }) =>
  api.get<CategoriesResponse>('/api/categories', { params });

export const createCategory = (data: { name: string; description?: string }) =>
  api.post<Category>('/api/categories', data);

export const updateCategory = (id: string, data: { name?: string; description?: string }) =>
  api.put<Category>(`/api/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  api.delete(`/api/categories/${id}`);

// Transactions
export const createTransaction = (data: TransactionPayload) =>
  api.post('/api/transactions', data);

export const voidTransaction = (id: string) =>
  api.patch(`/api/transactions/${id}/void`);

export const fetchTransactions = (params?: { status?: string; page?: number; limit?: number }) =>
  api.get('/api/transactions', { params });

export default api;
