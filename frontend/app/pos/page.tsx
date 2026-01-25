'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: string;
  currentOrderId: string | null;
}

interface Order {
  id: string;
  tableId: string | null;
  orderType: string;
  status: string;
  total: number;
  items: any[];
}

export default function POSPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [branchId] = useState('test-branch-123'); // TODO: Get from context
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: 4 });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTables();
    loadOrders();
  }, [isAuthenticated, router, branchId]);

  const loadTables = async () => {
    try {
      const response = await apiClient.getTables(branchId);
      if (response.success) {
        setTables(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await apiClient.getOrders(branchId);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createTable({
        branchId,
        tableNumber: tableForm.tableNumber,
        capacity: tableForm.capacity,
      });
      if (response.success) {
        setShowCreateTable(false);
        setTableForm({ tableNumber: '', capacity: 4 });
        loadTables();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create table');
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableOrder = (tableId: string) => {
    return orders.find((o) => o.tableId === tableId && o.status !== 'COMPLETED');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">POS Interface</h1>
            </div>
            <button
              onClick={() => setShowCreateTable(!showCreateTable)}
              className="zoho-button-primary"
            >
              {showCreateTable ? 'Cancel' : '+ Add Table'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateTable && (
          <div className="zoho-card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Table</h2>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <input
                    type="text"
                    required
                    className="zoho-input"
                    value={tableForm.tableNumber}
                    onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="zoho-input"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <button type="submit" className="zoho-button-primary">
                Create Table
              </button>
            </form>
          </div>
        )}

        <div className="zoho-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tables</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {tables.map((table) => {
                const order = getTableOrder(table.id);
                return (
                  <div
                    key={table.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTable === table.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{table.tableNumber}</div>
                      <div className="text-xs text-gray-500">Capacity: {table.capacity}</div>
                      <div className={`mt-2 text-xs px-2 py-1 rounded ${getTableStatusColor(table.status)}`}>
                        {table.status}
                      </div>
                      {order && (
                        <div className="mt-2 text-xs font-medium text-primary-600">
                          Order: ${order.total.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedTable && (
          <div className="zoho-card mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Table {tables.find((t) => t.id === selectedTable)?.tableNumber} - Orders
            </h2>
            <div className="space-y-4">
              {orders
                .filter((o) => o.tableId === selectedTable)
                .map((order) => (
                  <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-500">
                          {order.orderType} • {order.status}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                        <Link
                          href={`/pos/orders/${order.id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

