import axios from 'axios';

const mlClient = axios.create({
  baseURL: 'http://localhost:8087',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ram_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ram_token');
      localStorage.removeItem('ram_username');
      localStorage.removeItem('ram_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export const flightsAPI = {
  getAll: () => api.get('/flights'),
  getById: (id: number) => api.get(`/flights/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/flights/${id}/status?status=${status}`),
  create: (data: any) => api.post('/flights', data),
  delete: (id: number) => api.delete(`/flights/${id}`),
};

export const aircraftAPI = {
  getAll: () => api.get('/aircraft'),
  getById: (id: number) => api.get(`/aircraft/${id}`),
  create: (data: any) => api.post('/aircraft', data),
};

export const seatsAPI = {
  getSeatMap: (aircraftId: number) =>
    api.get(`/seats/aircraft/${aircraftId}`),
  generateSeats: (data: any) => api.post('/seats/generate', data),
  updateStatus: (seatId: string, aircraftId: number, status: string) =>
    api.put(
      `/seats/${encodeURIComponent(seatId)}/status`,
      { status },
      { params: { aircraftId } },
    ),
};

export const passengersAPI = {
  getAll: () => api.get('/passengers'),
  getById: (id: number) => api.get(`/passengers/${id}`),
  searchByName: (name: string) =>
    api.get(`/passengers/search?name=${name}`),
  getByFlight: (flightId: number) =>
    api.get(`/passengers/flight/${flightId}`),
  assignSeat: (id: number, seatId: string, aircraftId: number) =>
    api.put(`/passengers/${id}/assign-seat`, { seatId, aircraftId }),
  delete: (id: number) => api.delete(`/passengers/${id}`),
};

export const feedbackAPI = {
  submit: (data: any) => api.post('/feedback', data),
  getByFlight: (flightId: number) =>
    api.get(`/feedback/flight/${flightId}`),
  getAnalytics: () => api.get('/feedback/analytics'),
};

export const mlAPI = {
  getPredictions: () => mlClient.get('/predictions'),
  getHealth: () => mlClient.get('/health'),
};

export const aiAPI = {
  query: (query: string, conversationHistory: { role: string; content: string }[]) =>
    api.post('/ai/query', { query, conversationHistory }),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

export default api;

