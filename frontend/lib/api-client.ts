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

  async syncNewModulesToAllTenants() {
    const response = await this.client.post('/modules/sync-new');
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

  async seedStarterAccounts() {
    const response = await this.client.post('/accounting/seed');
    return response.data;
  }

  // --- Phase 1: Enhanced Accounting ---

  async updateAccount(id: string, data: { name?: string; parentId?: string | null; isActive?: boolean }) {
    const response = await this.client.patch(`/accounting/accounts/${id}`, data);
    return response.data;
  }

  async getJournalEntry(id: string) {
    const response = await this.client.get(`/accounting/journal-entries/${id}`);
    return response.data;
  }

  async postJournalEntry(id: string) {
    const response = await this.client.post(`/accounting/journal-entries/${id}/post`);
    return response.data;
  }

  async deleteJournalEntry(id: string) {
    const response = await this.client.delete(`/accounting/journal-entries/${id}`);
    return response.data;
  }

  async lockFiscalYear(id: string) {
    const response = await this.client.post(`/accounting/fiscal-years/${id}/lock`);
    return response.data;
  }

  async unlockFiscalYear(id: string) {
    const response = await this.client.post(`/accounting/fiscal-years/${id}/lock?action=unlock`);
    return response.data;
  }

  async getTrialBalance(fiscalYearId?: string) {
    const params = fiscalYearId ? `?fiscalYearId=${fiscalYearId}` : '';
    const response = await this.client.get(`/accounting/reports/trial-balance${params}`);
    return response.data;
  }

  async getLedger(options?: { accountId?: string; fiscalYearId?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (options?.accountId) params.set('accountId', options.accountId);
    if (options?.fiscalYearId) params.set('fiscalYearId', options.fiscalYearId);
    if (options?.startDate) params.set('startDate', options.startDate);
    if (options?.endDate) params.set('endDate', options.endDate);
    const qs = params.toString();
    const response = await this.client.get(`/accounting/reports/ledger${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getProfitAndLoss(fiscalYearId: string) {
    const response = await this.client.get(`/accounting/reports/profit-loss?fiscalYearId=${fiscalYearId}`);
    return response.data;
  }

  async getBalanceSheet(fiscalYearId: string) {
    const response = await this.client.get(`/accounting/reports/balance-sheet?fiscalYearId=${fiscalYearId}`);
    return response.data;
  }

  // --- Phase 2: CRM ---

  async getLeads(options?: { status?: string; source?: string; search?: string; page?: number }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.source) params.set('source', options.source);
    if (options?.search) params.set('search', options.search);
    if (options?.page) params.set('page', String(options.page));
    const qs = params.toString();
    const response = await this.client.get(`/crm/leads${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getLead(id: string) {
    const response = await this.client.get(`/crm/leads/${id}`);
    return response.data;
  }

  async createLead(data: { name: string; email?: string; phone?: string; company?: string; source?: string; expectedRevenue?: number; notes?: string }) {
    const response = await this.client.post('/crm/leads', data);
    return response.data;
  }

  async updateLead(id: string, data: Record<string, unknown>) {
    const response = await this.client.patch(`/crm/leads/${id}`, data);
    return response.data;
  }

  async updateLeadStatus(id: string, status: string) {
    const response = await this.client.patch(`/crm/leads/${id}/status`, { status });
    return response.data;
  }

  async deleteLead(id: string) {
    const response = await this.client.delete(`/crm/leads/${id}`);
    return response.data;
  }

  async getLeadPipeline() {
    const response = await this.client.get('/crm/leads/pipeline');
    return response.data;
  }

  async getLeadActivities(leadId: string) {
    const response = await this.client.get(`/crm/leads/${leadId}/activities`);
    return response.data;
  }

  async addLeadActivity(leadId: string, data: { type: string; description: string }) {
    const response = await this.client.post(`/crm/leads/${leadId}/activities`, data);
    return response.data;
  }

  async convertLead(leadId: string, overrides?: Record<string, string>) {
    const response = await this.client.post(`/crm/leads/${leadId}/convert`, overrides || {});
    return response.data;
  }

  async getCustomers(options?: { search?: string; page?: number }) {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.page) params.set('page', String(options.page));
    const qs = params.toString();
    const response = await this.client.get(`/crm/customers${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getCustomer(id: string) {
    const response = await this.client.get(`/crm/customers/${id}`);
    return response.data;
  }

  // --- Phase 3: Sales ---

  async getSalesSummary() {
    const response = await this.client.get('/sales/summary');
    return response.data;
  }

  async getQuotations(options?: { status?: string; customerId?: string }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.customerId) params.set('customerId', options.customerId);
    const qs = params.toString();
    const response = await this.client.get(`/sales/quotations${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getQuotation(id: string) {
    const response = await this.client.get(`/sales/quotations/${id}`);
    return response.data;
  }

  async createQuotation(data: {
    customerId: string; date: string; validUntil?: string; taxRate?: number; notes?: string;
    lines: { description: string; quantity: number; unitPrice: number; productId?: string }[];
  }) {
    const response = await this.client.post('/sales/quotations', data);
    return response.data;
  }

  async updateQuotationStatus(id: string, status: string) {
    const response = await this.client.patch(`/sales/quotations/${id}`, { status });
    return response.data;
  }

  async convertQuotationToOrder(id: string) {
    const response = await this.client.post(`/sales/quotations/${id}/convert`);
    return response.data;
  }

  async getSalesOrders(options?: { status?: string; customerId?: string }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.customerId) params.set('customerId', options.customerId);
    const qs = params.toString();
    const response = await this.client.get(`/sales/orders${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getSalesOrder(id: string) {
    const response = await this.client.get(`/sales/orders/${id}`);
    return response.data;
  }

  async createSalesOrder(data: {
    customerId: string; date: string; taxRate?: number; notes?: string;
    lines: { description: string; quantity: number; unitPrice: number; productId?: string }[];
  }) {
    const response = await this.client.post('/sales/orders', data);
    return response.data;
  }

  async updateSalesOrderStatus(id: string, status: string) {
    const response = await this.client.patch(`/sales/orders/${id}`, { status });
    return response.data;
  }

  async createInvoiceFromOrder(orderId: string) {
    const response = await this.client.post(`/sales/orders/${orderId}/invoice`);
    return response.data;
  }

  async getSalesInvoices(options?: { status?: string; customerId?: string }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.customerId) params.set('customerId', options.customerId);
    const qs = params.toString();
    const response = await this.client.get(`/sales/invoices${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getSalesInvoice(id: string) {
    const response = await this.client.get(`/sales/invoices/${id}`);
    return response.data;
  }

  async createDirectInvoice(data: {
    customerId: string; date: string; dueDate?: string; taxRate?: number; notes?: string;
    lines: { description: string; quantity: number; unitPrice: number; productId?: string }[];
  }) {
    const response = await this.client.post('/sales/invoices', data);
    return response.data;
  }

  async postSalesInvoice(id: string) {
    const response = await this.client.post(`/sales/invoices/${id}/post`);
    return response.data;
  }

  async recordPayment(invoiceId: string, data: { date: string; amount: number; method?: string; reference?: string; notes?: string }) {
    const response = await this.client.post(`/sales/invoices/${invoiceId}/payments`, data);
    return response.data;
  }

  async getCreditNotes() {
    const response = await this.client.get('/sales/credit-notes');
    return response.data;
  }

  async createCreditNote(data: {
    customerId: string; invoiceId?: string; date: string; taxRate?: number; reason?: string; notes?: string;
    lines: { description: string; quantity: number; unitPrice: number }[];
  }) {
    const response = await this.client.post('/sales/credit-notes', data);
    return response.data;
  }

  // --- Phase 4: Purchase ---

  async getPurchaseSummary() {
    const response = await this.client.get('/purchase/summary');
    return response.data;
  }

  async getVendors(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await this.client.get(`/purchase/vendors${qs}`);
    return response.data;
  }

  async getVendor(id: string) {
    const response = await this.client.get(`/purchase/vendors/${id}`);
    return response.data;
  }

  async createVendor(data: { name: string; email?: string; phone?: string; company?: string; address?: string; taxId?: string; notes?: string }) {
    const response = await this.client.post('/purchase/vendors', data);
    return response.data;
  }

  async updateVendor(id: string, data: Record<string, unknown>) {
    const response = await this.client.patch(`/purchase/vendors/${id}`, data);
    return response.data;
  }

  async getRequisitions(options?: { status?: string }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    const qs = params.toString();
    const response = await this.client.get(`/purchase/requisitions${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getRequisition(id: string) {
    const response = await this.client.get(`/purchase/requisitions/${id}`);
    return response.data;
  }

  async createRequisition(data: { vendorId?: string; date: string; requestedBy?: string; notes?: string; lines: { description: string; quantity: number; estimatedPrice?: number }[] }) {
    const response = await this.client.post('/purchase/requisitions', data);
    return response.data;
  }

  async updateRequisitionStatus(id: string, status: string) {
    const response = await this.client.patch(`/purchase/requisitions/${id}`, { status });
    return response.data;
  }

  async convertRequisitionToPO(id: string, vendorId: string) {
    const response = await this.client.post(`/purchase/requisitions/${id}/convert`, { vendorId });
    return response.data;
  }

  async getPurchaseOrders(options?: { status?: string; vendorId?: string }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.vendorId) params.set('vendorId', options.vendorId);
    const qs = params.toString();
    const response = await this.client.get(`/purchase/orders${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getPurchaseOrder(id: string) {
    const response = await this.client.get(`/purchase/orders/${id}`);
    return response.data;
  }

  async createPurchaseOrder(data: {
    vendorId: string; date: string; expectedDate?: string; taxRate?: number; notes?: string;
    lines: { description: string; quantity: number; unitPrice: number; productId?: string }[];
  }) {
    const response = await this.client.post('/purchase/orders', data);
    return response.data;
  }

  async updatePOStatus(id: string, status: string) {
    const response = await this.client.patch(`/purchase/orders/${id}`, { status });
    return response.data;
  }

  async receiveGoods(poId: string, data: { date: string; notes?: string; lines: { description: string; quantity: number; productId?: string; locationId?: string; unitCost?: number }[] }) {
    const response = await this.client.post(`/purchase/orders/${poId}/receive`, data);
    return response.data;
  }

  async createBillFromPO(poId: string) {
    const response = await this.client.post(`/purchase/orders/${poId}/bill`);
    return response.data;
  }

  async getVendorBills(options?: { status?: string; vendorId?: string }) {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.vendorId) params.set('vendorId', options.vendorId);
    const qs = params.toString();
    const response = await this.client.get(`/purchase/bills${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getVendorBill(id: string) {
    const response = await this.client.get(`/purchase/bills/${id}`);
    return response.data;
  }

  async createDirectBill(data: {
    vendorId: string; date: string; dueDate?: string; vendorRef?: string; taxRate?: number; notes?: string;
    lines: { description: string; quantity: number; unitPrice: number }[];
  }) {
    const response = await this.client.post('/purchase/bills', data);
    return response.data;
  }

  async postVendorBill(id: string) {
    const response = await this.client.post(`/purchase/bills/${id}/post`);
    return response.data;
  }

  async recordVendorPayment(billId: string, data: { date: string; amount: number; method?: string; reference?: string; notes?: string }) {
    const response = await this.client.post(`/purchase/bills/${billId}/payments`, data);
    return response.data;
  }

  async getLinkedJournalEntry(reference: string) {
    const response = await this.client.get(`/purchase/journal-entry?reference=${encodeURIComponent(reference)}`);
    return response.data;
  }

  async retryBillAccounting(billId: string) {
    const response = await this.client.post(`/purchase/bills/${billId}/retry-accounting`);
    return response.data;
  }

  async retryInvoiceAccounting(invoiceId: string) {
    const response = await this.client.post(`/sales/invoices/${invoiceId}/retry-accounting`);
    return response.data;
  }

  // ===================== INVENTORY (Phase 5) =====================

  async getInventorySettings() {
    const response = await this.client.get('/inventory/settings');
    return response.data;
  }

  async updateInventorySettings(data: { purchaseStockRecognition: 'RECEIPT' | 'BILL' }) {
    const response = await this.client.put('/inventory/settings', data);
    return response.data;
  }

  async getProducts(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await this.client.get(`/inventory/products${qs}`);
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/inventory/products/${id}`);
    return response.data;
  }

  async createProduct(data: { sku: string; name: string; type?: 'STOCK' | 'SERVICE'; standardCost?: number; salePrice?: number; isActive?: boolean }) {
    const response = await this.client.post('/inventory/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    const response = await this.client.patch(`/inventory/products/${id}`, data);
    return response.data;
  }

  async getWarehouses() {
    const response = await this.client.get('/inventory/warehouses');
    return response.data;
  }

  async createWarehouse(data: { code: string; name: string }) {
    const response = await this.client.post('/inventory/warehouses', data);
    return response.data;
  }

  async createLocation(warehouseId: string, data: { code: string; name: string; isQuarantine?: boolean }) {
    const response = await this.client.post(`/inventory/warehouses/${warehouseId}/locations`, data);
    return response.data;
  }

  async getStockBalances(params?: { productId?: string; warehouseId?: string }) {
    const qs = new URLSearchParams();
    if (params?.productId) qs.set('productId', params.productId);
    if (params?.warehouseId) qs.set('warehouseId', params.warehouseId);
    const response = await this.client.get(`/inventory/balances${qs.toString() ? `?${qs.toString()}` : ''}`);
    return response.data;
  }

  async getStockMoves() {
    const response = await this.client.get('/inventory/stock-moves');
    return response.data;
  }

  async getInventorySummary() {
    const response = await this.client.get('/inventory/summary');
    return response.data;
  }

  async createStockMove(data: any) {
    const response = await this.client.post('/inventory/stock-moves', data);
    return response.data;
  }

  async postStockMove(id: string) {
    const response = await this.client.post(`/inventory/stock-moves/${id}/post`);
    return response.data;
  }

  // ===================== POS =====================

  async getPosSession() {
    const response = await this.client.get('/pos/session');
    return response.data;
  }

  async openPosSession(data: { startingCash?: number }) {
    const response = await this.client.post('/pos/session', data);
    return response.data;
  }

  async closePosSession(sessionId: string, data: { closingCash: number }) {
    const response = await this.client.post(`/pos/session/${sessionId}/close`, data);
    return response.data;
  }

  async createPosOrder(data: { sessionId: string; lines: { productId?: string; description: string; quantity: number; unitPrice: number }[] }) {
    const response = await this.client.post('/pos/orders', data);
    return response.data;
  }

  async completePosOrder(orderId: string) {
    const response = await this.client.post(`/pos/orders/${orderId}/complete`);
    return response.data;
  }

  async cancelPosOrder(orderId: string) {
    const response = await this.client.post(`/pos/orders/${orderId}/cancel`);
    return response.data;
  }

  // ===================== HR =====================

  async getHrSummary() {
    const response = await this.client.get('/hr/summary');
    return response.data;
  }

  async getDepartments(options?: { search?: string; activeOnly?: boolean }) {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.activeOnly) params.set('activeOnly', 'true');
    const qs = params.toString();
    const response = await this.client.get(`/hr/departments${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getDepartment(id: string) {
    const response = await this.client.get(`/hr/departments/${id}`);
    return response.data;
  }

  async createDepartment(data: { name: string; code: string; isActive?: boolean }) {
    const response = await this.client.post('/hr/departments', data);
    return response.data;
  }

  async updateDepartment(id: string, data: Record<string, unknown>) {
    const response = await this.client.patch(`/hr/departments/${id}`, data);
    return response.data;
  }

  async getEmployees(options?: { search?: string; departmentId?: string; status?: string }) {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.departmentId) params.set('departmentId', options.departmentId);
    if (options?.status) params.set('status', options.status);
    const qs = params.toString();
    const response = await this.client.get(`/hr/employees${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getEmployee(id: string) {
    const response = await this.client.get(`/hr/employees/${id}`);
    return response.data;
  }

  async createEmployee(data: {
    departmentId?: string;
    employeeNumber?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    dateOfJoining?: string;
    designation?: string;
    status?: string;
  }) {
    const response = await this.client.post('/hr/employees', data);
    return response.data;
  }

  async updateEmployee(id: string, data: Record<string, unknown>) {
    const response = await this.client.patch(`/hr/employees/${id}`, data);
    return response.data;
  }

  async getAttendance(options?: { employeeId?: string; from?: string; to?: string; status?: string }) {
    const params = new URLSearchParams();
    if (options?.employeeId) params.set('employeeId', options.employeeId);
    if (options?.from) params.set('from', options.from);
    if (options?.to) params.set('to', options.to);
    if (options?.status) params.set('status', options.status);
    const qs = params.toString();
    const response = await this.client.get(`/hr/attendance${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async upsertAttendance(data: {
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status?: string;
    notes?: string;
  }) {
    const response = await this.client.post('/hr/attendance', data);
    return response.data;
  }

  async getLeaves(options?: { employeeId?: string; status?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    if (options?.employeeId) params.set('employeeId', options.employeeId);
    if (options?.status) params.set('status', options.status);
    if (options?.from) params.set('from', options.from);
    if (options?.to) params.set('to', options.to);
    const qs = params.toString();
    const response = await this.client.get(`/hr/leaves${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  async getLeave(id: string) {
    const response = await this.client.get(`/hr/leaves/${id}`);
    return response.data;
  }

  async createLeave(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
  }) {
    const response = await this.client.post('/hr/leaves', data);
    return response.data;
  }

  async approveLeave(id: string) {
    const response = await this.client.post(`/hr/leaves/${id}/approve`);
    return response.data;
  }

  async rejectLeave(id: string) {
    const response = await this.client.post(`/hr/leaves/${id}/reject`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
