import axios from 'axios';
import { useAuthZustand } from '@/store/authZustand';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        useAuthZustand.getState().logout();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string, role: 'farmer' | 'buyer') =>
    api.post('/auth/login', { email, password, role }),
  register: (data: { email: string; password: string; name: string; role: 'farmer' | 'buyer'; location?: string; phone?: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getByFarmer: (farmerId: string) => api.get(`/products/farmer/${farmerId}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  search: (query: string) => api.get('/products/search', { params: { q: query } }),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Orders API
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  rate: (id: string, rating: number, review?: string) => api.put(`/orders/${id}/rate`, { rating, review }),
  getInventorySummary: () => api.get('/orders/inventory/summary'),
  adjustInventory: (payload: { productId: string; quantityAdjustment: number; notes?: string }) =>
    api.post('/orders/inventory/adjust', payload),
};

// RFQ API
export const rfqApi = {
  create: (data: any) => api.post('/rfqs', data),
  getAll: () => api.get('/rfqs'),
  getById: (id: string) => api.get(`/rfqs/${id}`),
  respond: (id: string, data: any) => api.post(`/rfqs/${id}/respond`, data),
  award: (rfqId: string, responseId: string) => api.put(`/rfqs/${rfqId}/award/${responseId}`, {}),
  getMyRfqs: () => api.get('/rfqs/buyer/my-rfqs'),
};

// Payments API
export const paymentsApi = {
  createMockIntent: (orderId: string) => api.post('/payments/mock/create-intent', { orderId }),
  confirmMockPayment: (paymentId: string, status: 'success' | 'failed') => api.post(`/payments/${paymentId}/confirm`, { status }),
  markPaid: (orderId: string) => api.post(`/payments/orders/${orderId}/mark-paid`),
};

// Supplier Ratings API
export const supplierRatingsApi = {
  summary: (farmerId: string) => api.get(`/suppliers/${farmerId}/ratings/summary`),
  getAll: (farmerId: string) => api.get(`/suppliers/${farmerId}/ratings`),
};

// Logistics API
export const logisticsApi = {
  getAll: () => api.get('/logistics'),
  update: (id: string, data: any) => api.put(`/logistics/${id}`, data),
};

// Samples API
export const samplesApi = {
  getAll: () => api.get('/samples'),
  create: (data: any) => api.post('/samples', data),
  updateStatus: (id: string, status: string) => api.put(`/samples/${id}`, { status }),
};

// Tenders API
export const tendersApi = {
  getAll: (params?: any) => api.get('/tenders', { params }),
  getMy: () => api.get('/tenders/my'),
  create: (data: any) => api.post('/tenders', data),
  bid: (id: string, data: any) => api.post(`/tenders/${id}/bid`, data),
  award: (tenderId: string, bidId: string) => api.post(`/tenders/${tenderId}/award/${bidId}`, {}),
};

// Contracts API
export const contractsApi = {
  generate: (orderId: string) => api.post(`/contracts/generate/${orderId}`, {}),
  getByOrder: (orderId: string) => api.get(`/contracts/order/${orderId}`),
};

// Buyer Cart API
export const buyerCartApi = {
  get: () => api.get('/buyer/cart'),
  addItem: (productId: string, quantity: number = 1) => api.post('/buyer/cart/items', { productId, quantity }),
  updateItemQty: (productId: string, quantity: number) => api.put(`/buyer/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) => api.delete(`/buyer/cart/items/${productId}`),
  checkout: () => api.post('/buyer/cart/checkout'),
};

// Messages API
export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId: string, content: string) =>
    api.post(`/messages/${conversationId}`, { content }),
  startConversation: (userId: string, initialMessage: string) =>
    api.post('/messages/start', { userId, initialMessage }),
};

// AI API
export const aiApi = {
  getPriceSuggestion: (productData: any) => api.post('/ai/price-suggestion', productData),
  getSupplierRecommendation: (buyerId: string, requirements: any) =>
    api.post('/ai/supplier-recommendation', { buyerId, requirements }),
  getQualityGrade: (productId: string) => api.get(`/ai/quality-grade/${productId}`),
  getDemandForecast: (productCategory: string) => api.get(`/ai/demand-forecast/${productCategory}`),
};

// Blockchain API
export const blockchainApi = {
  verifyProduct: (productId: string) => api.get(`/blockchain/verify/${productId}`),
  getProductHistory: (productId: string) => api.get(`/blockchain/history/${productId}`),
  generateQRCode: (productId: string) => api.get(`/blockchain/qr/${productId}`),
  recordProductCreated: (data: any) => api.post('/blockchain/product-created', data),
  recordTransfer: (data: any) => api.post('/blockchain/transfer', data),
};

export default api;