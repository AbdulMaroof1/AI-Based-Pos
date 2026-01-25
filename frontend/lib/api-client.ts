import axios, { AxiosInstance, AxiosError } from 'axios';

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3000';
const TENANT_SERVICE_URL = process.env.NEXT_PUBLIC_TENANT_SERVICE_URL || 'http://localhost:3001';
const MODULE_ACCESS_SERVICE_URL = process.env.NEXT_PUBLIC_MODULE_ACCESS_SERVICE_URL || 'http://localhost:3002';
const POS_SERVICE_URL = process.env.NEXT_PUBLIC_POS_SERVICE_URL || 'http://localhost:3003';

class ApiClient {
  private authClient: AxiosInstance;
  private tenantClient: AxiosInstance;
  private moduleAccessClient: AxiosInstance;
  private posClient: AxiosInstance;

  constructor() {
    this.authClient = axios.create({ baseURL: AUTH_SERVICE_URL });
    this.tenantClient = axios.create({ baseURL: TENANT_SERVICE_URL });
    this.moduleAccessClient = axios.create({ baseURL: MODULE_ACCESS_SERVICE_URL });
    this.posClient = axios.create({ baseURL: POS_SERVICE_URL });

    // Add auth token interceptor
    [this.authClient, this.tenantClient, this.moduleAccessClient, this.posClient].forEach(client => {
      client.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      });
    });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.authClient.post('/auth/login', { email, password });
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; role: string }) {
    const response = await this.authClient.post('/auth/register', data);
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const response = await this.authClient.post('/auth/refresh', { refreshToken });
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Tenant endpoints
  async getTenants() {
    const response = await this.tenantClient.get('/tenants');
    return response.data;
  }

  async getTenant(id: string) {
    const response = await this.tenantClient.get(`/tenants/${id}`);
    return response.data;
  }

  async createTenant(data: { name: string; email: string; phone: string; address: string }) {
    const response = await this.tenantClient.post('/tenants', data);
    return response.data;
  }

  async getBranches(tenantId: string) {
    const response = await this.tenantClient.get(`/tenants/${tenantId}/branches`);
    return response.data;
  }

  // Module Access endpoints
  async getModulePermissions(tenantId: string) {
    const response = await this.moduleAccessClient.get(`/modules/${tenantId}/permissions`);
    return response.data;
  }

  async enableModule(tenantId: string, moduleName: string, enabledBy: string) {
    const response = await this.moduleAccessClient.put(`/modules/${tenantId}/enable/${moduleName}`, { enabledBy });
    return response.data;
  }

  async disableModule(tenantId: string, moduleName: string, enabledBy: string) {
    const response = await this.moduleAccessClient.put(`/modules/${tenantId}/disable/${moduleName}`, { enabledBy });
    return response.data;
  }

  async checkModuleAccess(tenantId: string, moduleName: string) {
    const response = await this.moduleAccessClient.get(`/modules/${tenantId}/check/${moduleName}`);
    return response.data;
  }

  // POS endpoints
  async getTables(branchId: string) {
    const response = await this.posClient.get(`/pos/tables/branch/${branchId}`);
    return response.data;
  }

  async createTable(data: { branchId: string; tableNumber: string; capacity: number }) {
    const response = await this.posClient.post('/pos/tables', data);
    return response.data;
  }

  async getOrders(branchId: string, status?: string) {
    const url = status 
      ? `/pos/orders/branch/${branchId}?status=${status}`
      : `/pos/orders/branch/${branchId}`;
    const response = await this.posClient.get(url);
    return response.data;
  }

  async createOrder(data: {
    branchId: string;
    tableId?: string;
    orderType: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) {
    const response = await this.posClient.post('/pos/orders', data);
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.posClient.get(`/pos/orders/${id}`);
    return response.data;
  }

  async createPayment(data: { orderId: string; paymentMethod: string; amount: number }) {
    const response = await this.posClient.post('/pos/payments', data);
    return response.data;
  }

  async createKot(data: { orderId: string }) {
    const response = await this.posClient.post('/pos/kot', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();

