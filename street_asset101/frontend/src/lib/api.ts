import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  profile: () => api.get('/auth/profile'),
};

// Poles
export const polesApi = {
  list: (params?: any) => api.get('/poles', { params }),
  getById: (id: string) => api.get(`/poles/${id}`),
  create: (data: any) => api.post('/poles', data),
  update: (id: string, data: any) => api.put(`/poles/${id}`, data),
  delete: (id: string) => api.delete(`/poles/${id}`),
  getGis: (params?: any) => api.get('/poles/gis', { params }),
  import: (file: FormData) => api.post('/poles/import', file, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importHistory: (params?: any) => api.get('/poles/import-history', { params }),
};

// Incidents
export const incidentsApi = {
  list: (params?: any) => api.get('/incidents', { params }),
  getById: (id: string) => api.get(`/incidents/${id}`),
  create: (data: any) => api.post('/incidents', data),
  update: (id: string, data: any) => api.put(`/incidents/${id}`, data),
  slaStats: () => api.get('/incidents/sla-stats'),
};

// Work Orders
export const workOrdersApi = {
  list: (params?: any) => api.get('/work-orders', { params }),
  getById: (id: string) => api.get(`/work-orders/${id}`),
  create: (data: any) => api.post('/work-orders', data),
  update: (id: string, data: any) => api.put(`/work-orders/${id}`, data),
  addComment: (id: string, content: string) => api.post(`/work-orders/${id}/comments`, { content }),
};

// Maintenance
export const maintenanceApi = {
  submitReport: (workOrderId: string, data: any) => api.post(`/maintenance/reports/${workOrderId}`, data),
  reviewReport: (reportId: string, data: any) => api.put(`/maintenance/reviews/${reportId}`, data),
  approveIssue: (incidentId: string, data: any) => api.put(`/maintenance/issues/${incidentId}/approve`, data),
  stats: () => api.get('/maintenance/stats'),
  engineerDashboard: () => api.get('/maintenance/engineer-dashboard'),
};

// Inventory
export const inventoryApi = {
  items: () => api.get('/inventory/items'),
  createItem: (data: any) => api.post('/inventory/items', data),
  updateItem: (id: string, data: any) => api.put(`/inventory/items/${id}`, data),
  lowStock: () => api.get('/inventory/low-stock'),
  requests: (params?: any) => api.get('/inventory/requests', { params }),
  createRequest: (data: any) => api.post('/inventory/requests', data),
  approveRequest: (id: string, data: any) => api.put(`/inventory/requests/${id}/approve`, data),
};

// Dashboard
export const dashboardApi = {
  overview: () => api.get('/dashboard/overview'),
  regionalComparison: () => api.get('/dashboard/regional-comparison'),
  maintenanceStats: () => api.get('/dashboard/maintenance-stats'),
  faultStatistics: () => api.get('/dashboard/fault-statistics'),
  recentActivities: () => api.get('/dashboard/recent-activities'),
};

// Notifications
export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Users
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  permissions: () => api.get('/users/permissions'),
};

// Regions
export const regionsApi = {
  list: () => api.get('/regions'),
  subcities: (regionId?: string) => api.get('/regions/subcities', { params: { regionId } }),
};

// Reports
export const reportsApi = {
  poleInventory: (params?: any) => api.get('/reports/pole-inventory', { params, responseType: 'blob' }),
  maintenance: (params?: any) => api.get('/reports/maintenance', { params, responseType: 'blob' }),
  incidents: (params?: any) => api.get('/reports/incidents', { params, responseType: 'blob' }),
};

// Call Logs
export const callLogsApi = {
  list: (params?: any) => api.get('/call-logs', { params }),
  create: (data: any) => api.post('/call-logs', data),
};

// Audit Logs
export const auditLogsApi = {
  list: (params?: any) => api.get('/audit-logs', { params }),
};
