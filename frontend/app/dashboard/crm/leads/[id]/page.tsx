'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, SOURCE_LABELS, LEAD_STATUSES, ACTIVITY_TYPES, ACTIVITY_ICONS } from '@/lib/crm-config';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface LeadDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  assignedTo: string | null;
  expectedRevenue: number | null;
  notes: string | null;
  convertedAt: string | null;
  customerId: string | null;
  customer: { id: string; name: string; email: string | null } | null;
  activities: Activity[];
  createdAt: string;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [activityForm, setActivityForm] = useState({ type: 'NOTE', description: '' });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const id = params.id as string;

  const load = () => {
    apiClient.getLead(id).then((res) => {
      if (res.success && res.data) setLead(res.data);
      else setError('Lead not found');
    }).catch(() => setError('Failed to load lead')).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  }, [isAuthenticated, router, id]);

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading('status');
    setError('');
    try {
      const res = await apiClient.updateLeadStatus(id, newStatus);
      if (res.success) load();
      else setError(res.error || 'Failed to update status');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading('');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.description.trim()) return;
    setActionLoading('activity');
    try {
      const res = await apiClient.addLeadActivity(id, activityForm);
      if (res.success) {
        setActivityForm({ type: 'NOTE', description: '' });
        setShowActivityForm(false);
        load();
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to add activity');
    } finally {
      setActionLoading('');
    }
  };

  const handleConvert = async () => {
    setActionLoading('convert');
    setError('');
    try {
      const res = await apiClient.convertLead(id);
      if (res.success) {
        setShowConvertModal(false);
        load();
      } else {
        setError(res.error || 'Failed to convert');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to convert lead');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setActionLoading('delete');
    try {
      const res = await apiClient.deleteLead(id);
      if (res.success) router.push('/dashboard/crm/leads');
      else setError(res.error || 'Failed to delete');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to delete lead');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error || 'Lead not found'}</div>
      </div>
    );
  }

  const isClosed = lead.status === 'WON' || lead.status === 'LOST';
  const currentIdx = LEAD_STATUSES.indexOf(lead.status as typeof LEAD_STATUSES[number]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/crm/leads" className="text-primary-600 hover:text-primary-700">← Back to Leads</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {lead.company && <span>{lead.company} &middot; </span>}
              {SOURCE_LABELS[lead.source] || lead.source} &middot; Created {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isClosed && !lead.customerId && (
              <button
                onClick={() => setShowConvertModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Convert to Customer
              </button>
            )}
            {!isClosed && !lead.customerId && (
              <button
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

        {/* Pipeline Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-1">
            {LEAD_STATUSES.map((status, idx) => {
              const isActive = status === lead.status;
              const isPast = idx < currentIdx;
              return (
                <button
                  key={status}
                  onClick={() => !isClosed && handleStatusChange(status)}
                  disabled={isClosed || !!actionLoading}
                  className={`flex-1 py-2 px-1 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? `${STATUS_COLORS[status]} ring-2 ring-offset-1 ring-current`
                      : isPast
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  } ${isClosed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lead Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500 uppercase">Status</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                  </dd>
                </div>
                {lead.email && <div><dt className="text-xs text-gray-500 uppercase">Email</dt><dd className="text-sm text-gray-900">{lead.email}</dd></div>}
                {lead.phone && <div><dt className="text-xs text-gray-500 uppercase">Phone</dt><dd className="text-sm text-gray-900">{lead.phone}</dd></div>}
                {lead.company && <div><dt className="text-xs text-gray-500 uppercase">Company</dt><dd className="text-sm text-gray-900">{lead.company}</dd></div>}
                <div><dt className="text-xs text-gray-500 uppercase">Source</dt><dd className="text-sm text-gray-900">{SOURCE_LABELS[lead.source] || lead.source}</dd></div>
                {lead.expectedRevenue && (
                  <div><dt className="text-xs text-gray-500 uppercase">Expected Revenue</dt><dd className="text-sm font-medium text-gray-900">${Number(lead.expectedRevenue).toLocaleString()}</dd></div>
                )}
                {lead.notes && <div><dt className="text-xs text-gray-500 uppercase">Notes</dt><dd className="text-sm text-gray-700">{lead.notes}</dd></div>}
              </dl>

              {lead.customer && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase mb-1">Converted Customer</p>
                  <Link href={`/dashboard/crm/customers/${lead.customer.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    {lead.customer.name}
                  </Link>
                  {lead.convertedAt && <p className="text-xs text-gray-400 mt-1">Converted {new Date(lead.convertedAt).toLocaleDateString()}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
                <button
                  onClick={() => setShowActivityForm(!showActivityForm)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showActivityForm ? 'Cancel' : '+ Add Activity'}
                </button>
              </div>

              {showActivityForm && (
                <form onSubmit={handleAddActivity} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <select
                      className="rounded border border-gray-300 px-3 py-2 text-sm"
                      value={activityForm.type}
                      onChange={(e) => setActivityForm((f) => ({ ...f, type: e.target.value }))}
                    >
                      {ACTIVITY_TYPES.map((t) => (
                        <option key={t} value={t}>{ACTIVITY_ICONS[t]} {t}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    required rows={2} placeholder="Describe the activity..."
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    value={activityForm.description}
                    onChange={(e) => setActivityForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <button
                    type="submit"
                    disabled={actionLoading === 'activity'}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {actionLoading === 'activity' ? 'Adding...' : 'Add Activity'}
                  </button>
                </form>
              )}

              {lead.activities.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">No activities yet. Add one to start tracking.</p>
              ) : (
                <div className="space-y-4">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="text-lg flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[activity.type] || '📌'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">{activity.type}</span>
                          <span className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Convert Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Convert Lead to Customer</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will create a new customer from <strong>{lead.name}</strong> and mark the lead as Won.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-1">
                <p className="text-sm"><span className="text-gray-500">Name:</span> {lead.name}</p>
                {lead.email && <p className="text-sm"><span className="text-gray-500">Email:</span> {lead.email}</p>}
                {lead.phone && <p className="text-sm"><span className="text-gray-500">Phone:</span> {lead.phone}</p>}
                {lead.company && <p className="text-sm"><span className="text-gray-500">Company:</span> {lead.company}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={actionLoading === 'convert'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                  {actionLoading === 'convert' ? 'Converting...' : 'Convert'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
