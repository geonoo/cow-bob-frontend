import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 기사 관련 API
export const driverApi = {
  getAll: () => apiClient.get('/api/drivers'),
  getById: (id: number) => apiClient.get(`/api/drivers/${id}`),
  create: (driver: any) => apiClient.post('/api/drivers', driver),
  update: (id: number, driver: any) => apiClient.put(`/api/drivers/${id}`, driver),
  delete: (id: number) => apiClient.delete(`/api/drivers/${id}`),
  getActive: () => apiClient.get('/api/drivers/active'),
  getAvailable: (date: string) => apiClient.get(`/api/drivers/available?date=${date}`),
};

// 배송 관련 API
export const deliveryApi = {
  getAll: () => apiClient.get('/api/deliveries'),
  getById: (id: number) => apiClient.get(`/api/deliveries/${id}`),
  create: (delivery: any) => apiClient.post('/api/deliveries', delivery),
  createHistorical: (delivery: any) => apiClient.post('/api/deliveries/history', delivery),
  update: (id: number, delivery: any) => apiClient.put(`/api/deliveries/${id}`, delivery),
  delete: (id: number) => apiClient.delete(`/api/deliveries/${id}`),
  getPending: () => apiClient.get('/api/deliveries/pending'),
  getAssigned: () => apiClient.get('/api/deliveries/assigned'),
  recommendDriver: (id: number) => apiClient.post(`/api/deliveries/${id}/recommend-driver`),
  assign: (deliveryId: number, driverId: number) => 
    apiClient.post(`/api/deliveries/${deliveryId}/assign/${driverId}`),
  complete: (id: number) => apiClient.post(`/api/deliveries/${id}/complete`),
  cancelAssignment: (id: number) => apiClient.post(`/api/deliveries/${id}/cancel-assignment`),
};

// 휴가 관련 API
export const vacationApi = {
  getAll: () => apiClient.get('/api/vacations'),
  getById: (id: number) => apiClient.get(`/api/vacations/${id}`),
  create: (vacation: any) => apiClient.post('/api/vacations', vacation),
  update: (id: number, vacation: any) => apiClient.put(`/api/vacations/${id}`, vacation),
  delete: (id: number) => apiClient.delete(`/api/vacations/${id}`),
  getByDriverId: (driverId: number) => apiClient.get(`/api/vacations/driver/${driverId}`),
  approve: (id: number) => apiClient.post(`/api/vacations/${id}/approve`),
  reject: (id: number) => apiClient.post(`/api/vacations/${id}/reject`),
};

export default apiClient;