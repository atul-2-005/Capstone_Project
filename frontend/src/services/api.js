import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user session if expired
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/users/me'),
};

export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/users/${id}`),
  getStaffMembers: (departmentId) => api.get('/users/staff', { params: { departmentId } }),
};

export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const requestApi = {
  getAll: (params) => api.get('/requests', { params }),
  getMyRequests: () => api.get('/requests/my'),
  getAssignedRequests: () => api.get('/requests/assigned'),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  updateStatus: (id, data) => api.patch(`/requests/${id}/status`, data),
  assign: (id, data) => api.patch(`/requests/${id}/assign`, data),
  updatePriority: (id, data) => api.patch(`/requests/${id}/priority`, data),
  getStats: () => api.get('/requests/stats'),
};

export const commentApi = {
  getByRequestId: (requestId) => api.get(`/requests/${requestId}/comments`),
  addComment: (requestId, data) => api.post(`/requests/${requestId}/comments`, data),
};

export const facilityApi = {
  getAll: () => api.get('/facilities'),
  getById: (id) => api.get(`/facilities/${id}`),
  getAvailability: (id, date) => api.get(`/facilities/${id}/availability`, { params: { date } }),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`),
};

export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  approve: (id) => api.patch(`/bookings/${id}/approve`),
};

export const lostFoundApi = {
  getAll: (params) => api.get('/lost-found', { params }),
  getMyItems: () => api.get('/lost-found/my'),
  getById: (id) => api.get(`/lost-found/${id}`),
  create: (data) => api.post('/lost-found', data),
  update: (id, data) => api.put(`/lost-found/${id}`, data),
  updateStatus: (id, status) => api.patch(`/lost-found/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/lost-found/${id}`),
};

export const notificationApi = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const activityApi = {
  getRecent: () => api.get('/activity-logs'),
};

export const dashboardApi = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getStudentStats: () => api.get('/dashboard/student'),
  getStaffStats: () => api.get('/dashboard/staff'),
};

export default api;
