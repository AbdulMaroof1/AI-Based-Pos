import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: '/api' });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  async requestOtp(email: string) {
    const response = await this.client.post('/auth/request-otp', { email });
    return response.data;
  }

  async verifyOtp(email: string, code: string) {
    const response = await this.client.post('/auth/verify-otp', { email, code });
    return response.data;
  }

  async setupAccount(
    data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      companyName: string;
      country: string;
      phone?: string;
    },
    setupToken: string,
  ) {
    const response = await this.client.post('/auth/setup-account', data, {
      headers: { 'X-Setup-Token': setupToken },
    });
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken!);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    const response = await this.client.post('/auth/register', data);
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
    const response = await this.client.post('/auth/refresh', { refreshToken });
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('setupToken');
    sessionStorage.removeItem('pendingEmail');
  }

  async getActiveModules() {
    const response = await this.client.get('/modules/active');
    return response.data;
  }

  async getModulePermissions(tenantId: string) {
    const response = await this.client.get(`/modules/${tenantId}/permissions`);
    return response.data;
  }

  async getTenants() {
    const response = await this.client.get('/tenants');
    return response.data;
  }

  async getTenant(id: string) {
    const response = await this.client.get(`/tenants/${id}`);
    return response.data;
  }

  async createTenant(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) {
    const response = await this.client.post('/tenants', data);
    return response.data;
  }

  async getBranches(tenantId: string) {
    const response = await this.client.get(`/tenants/${tenantId}/branches`);
    return response.data;
  }

  async enableModule(
    tenantId: string,
    moduleName: string,
    enabledBy: string,
  ) {
    const response = await this.client.put(
      `/modules/${tenantId}/enable/${moduleName}`,
      { enabledBy },
    );
    return response.data;
  }

  async disableModule(
    tenantId: string,
    moduleName: string,
    enabledBy: string,
  ) {
    const response = await this.client.put(
      `/modules/${tenantId}/disable/${moduleName}`,
      { enabledBy },
    );
    return response.data;
  }

  async checkModuleAccess(tenantId: string, moduleName: string) {
    const response = await this.client.get(
      `/modules/${tenantId}/check/${moduleName}`,
    );
    return response.data;
  }

  async getFiscalYears() {
    const response = await this.client.get('/accounting/fiscal-years');
    return response.data;
  }

  async createFiscalYear(data: {
    name: string;
    startDate: string;
    endDate: string;
  }) {
    const response = await this.client.post('/accounting/fiscal-years', data);
    return response.data;
  }

  async getAccounts() {
    const response = await this.client.get('/accounting/accounts');
    return response.data;
  }

  async createAccount(data: {
    code: string;
    name: string;
    accountType: string;
    parentId?: string;
  }) {
    const response = await this.client.post('/accounting/accounts', data);
    return response.data;
  }

  async getJournalEntries(fiscalYearId?: string) {
    const params = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    const response = await this.client.get(
      `/accounting/journal-entries${params}`,
    );
    return response.data;
  }

  async createJournalEntry(data: {
    fiscalYearId: string;
    date: string;
    reference?: string;
    memo?: string;
    lines: {
      accountId: string;
      debit: number;
      credit: number;
      memo?: string;
    }[];
  }) {
    const response = await this.client.post(
      '/accounting/journal-entries',
      data,
    );
    return response.data;
  }

  async getInvoicingSummary(fiscalYearId?: string) {
    const params = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    const response = await this.client.get(
      `/accounting/invoicing-summary${params}`,
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
