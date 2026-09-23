import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  Globe,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from '../store/slices/clientSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { Badge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatCurrency } from '../utils/formatters.js';
import { IClient } from '../types/index.js';

export const Clients: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { clients, isLoading } = useSelector((state: RootState) => state.clients);
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: 'United States',
    address: '',
    website: '',
    notes: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    dispatch(fetchClients({ search, status: statusFilter }));
  }, [dispatch, search, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      whatsapp: '',
      country: 'United States',
      address: '',
      website: '',
      notes: '',
      status: 'active',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (client: IClient) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone || '',
      whatsapp: client.whatsapp || '',
      country: client.country || '',
      address: client.address || '',
      website: client.website || '',
      notes: client.notes || '',
      status: client.status,
    });
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(createClient(formData));
    if (createClient.fulfilled.match(res)) {
      setIsCreateOpen(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    const res = await dispatch(updateClient({ id: editingClient._id, data: formData }));
    if (updateClient.fulfilled.match(res)) {
      setEditingClient(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await dispatch(deleteClient(deletingId));
    setDeletingId(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Client Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your client portfolio, ongoing contracts, and billing relationships
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Add New Client
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search by client name, company, email, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Clients' },
                { value: 'inactive', label: 'Inactive Clients' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading clients..." />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-indigo-400" />}
          title="No clients found"
          description={search ? 'No clients match your filter criteria.' : 'Start by adding your first agency client.'}
          actionText={isAdmin ? 'Add New Client' : undefined}
          onAction={isAdmin ? handleOpenCreate : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Client / Company</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total Contract Value</th>
                  <th className="py-3.5 px-4 text-right">Received / Pending</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-100 text-sm">{c.companyName}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{c.name}</div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {c.email}
                      </div>
                      {c.phone && (
                        <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-medium">{c.country}</td>
                    <td className="py-4 px-4">
                      <Badge variant="status" status={c.status} size="sm">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-extrabold text-slate-200">
                      {formatCurrency(c.totalProjectValue || 0)}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {c.projectCount || 0} projects
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-extrabold text-emerald-400">
                        {formatCurrency(c.totalReceived || 0)}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-400">
                        {formatCurrency(c.totalPending || 0)} pending
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/clients/${c._id}`}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="View client profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit client"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(c._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit Client Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingClient}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingClient(null);
        }}
        title={editingClient ? 'Edit Client Details' : 'Add New Client'}
        maxWidth="lg"
      >
        <form onSubmit={editingClient ? handleSaveEdit : handleSaveCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jonathan Reynolds"
            />
            <Input
              label="Company Name"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Acme Fintech Corp"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@acme.io"
            />
            <Input
              label="Country"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. United States"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="WhatsApp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+15550000000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Office Address / City"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Notes / Background Info
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key stakeholders, billing preferences, contract terms..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingClient(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingClient ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone if there are no active projects linked."
        confirmText="Delete Client"
      />
    </div>
  );
};
