import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Building,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../store/slices/paymentSlice.js';
import { fetchProjects } from '../store/slices/projectSlice.js';
import { fetchClients } from '../store/slices/clientSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { Badge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { IClientPayment } from '../types/index.js';

export const Payments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, isLoading } = useSelector((state: RootState) => state.payments);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { user } = useSelector((state: RootState) => state.auth);

  const [projectFilter, setProjectFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<IClientPayment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    project: '',
    client: '',
    amount: 5000,
    dueDate: new Date().toISOString().slice(0, 10),
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid' as any,
    paymentMethod: 'stripe',
    transactionId: '',
    notes: '',
  });

  const loadPayments = () => {
    dispatch(
      fetchPayments({
        project: projectFilter !== 'all' ? projectFilter : undefined,
        client: clientFilter !== 'all' ? clientFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
    );
  };

  useEffect(() => {
    loadPayments();
    dispatch(fetchProjects({}));
    dispatch(fetchClients({}));
  }, [dispatch, projectFilter, clientFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingPayment(null);
    setFormData({
      project: projects[0]?._id || '',
      client: clients[0]?._id || '',
      amount: 5000,
      dueDate: new Date().toISOString().slice(0, 10),
      paymentDate: new Date().toISOString().slice(0, 10),
      status: 'paid',
      paymentMethod: 'stripe',
      transactionId: `INV-TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: IClientPayment) => {
    setEditingPayment(p);
    setFormData({
      project: (p.project as any)?._id || (p.project as string),
      client: (p.client as any)?._id || (p.client as string),
      amount: p.amount,
      dueDate: p.dueDate ? new Date(p.dueDate).toISOString().slice(0, 10) : '',
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : '',
      status: p.status,
      paymentMethod: p.paymentMethod || 'bank_transfer',
      transactionId: p.transactionId || '',
      notes: p.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayment) {
      await dispatch(
        updatePayment({
          id: editingPayment._id,
          data: {
            ...formData,
            amount: Number(formData.amount),
          },
        })
      );
    } else {
      await dispatch(
        createPayment({
          ...formData,
          amount: Number(formData.amount),
        })
      );
    }
    setIsModalOpen(false);
    loadPayments();
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await dispatch(deletePayment(deletingId));
    setDeletingId(null);
  };

  const handleQuickMarkPaid = async (paymentId: string) => {
    await dispatch(
      updatePayment({
        id: paymentId,
        data: {
          status: 'paid',
          paymentDate: new Date().toISOString().slice(0, 10),
        },
      })
    );
    loadPayments();
  };

  // Aggregates
  const totalReceived = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalInvoiced = totalReceived + totalPending;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Client Payments</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track client invoices, retainer collections, and payment receivables across projects
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Record Client Payment
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Invoiced
              </p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(totalInvoiced)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">{payments.length} Payment records</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Collected Revenue
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(totalReceived)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Deposited to agency accounts</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending Receivables
              </p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(totalPending)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Outstanding client balances</p>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Filter by Project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Projects' },
              ...projects.map((p) => ({ value: p._id, label: `${p.name} (${p.projectId})` })),
            ]}
          />
          <Select
            label="Filter by Client"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Clients' },
              ...clients.map((c) => ({ value: c._id, label: c.companyName })),
            ]}
          />
          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>
      </Card>

      {/* Payments Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading client payments..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-indigo-400" />}
          title="No client payments recorded"
          description="Record client retainer deposits and milestone payments."
          actionText={isAdmin ? 'Record Client Payment' : undefined}
          onAction={isAdmin ? handleOpenCreate : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Client & Project</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Paid Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => {
                  const clientObj = typeof p.client === 'object' ? p.client : null;
                  const projectObj = typeof p.project === 'object' ? p.project : null;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-100 text-sm">
                          {clientObj?.companyName || 'Client'}
                        </div>
                        <div className="text-xs text-indigo-400 mt-0.5">
                          {projectObj?.name} (
                          <span className="font-mono">{projectObj?.projectId}</span>)
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-emerald-400 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-4 text-slate-400">{formatDate(p.dueDate)}</td>
                      <td className="py-4 px-4 text-slate-300">{formatDate(p.paymentDate)}</td>
                      <td className="py-4 px-4">
                        <span className="capitalize font-medium text-slate-200">
                          {p.paymentMethod?.replace('_', ' ')}
                        </span>
                        {p.transactionId && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {p.transactionId}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="status" status={p.status} size="sm">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && p.status !== 'paid' && (
                            <button
                              onClick={() => handleQuickMarkPaid(p._id)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              Mark Paid
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingId(p._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? 'Edit Payment Record' : 'Record Client Payment'}
        maxWidth="md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <Select
            label="Project"
            required
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            options={projects.map((p) => ({ value: p._id, label: `${p.name} (${p.projectId})` }))}
            placeholder="Select Project"
          />

          <Input
            label="Payment Amount ($)"
            type="number"
            required
            min={0}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'paid', label: 'Paid / Received' },
                { value: 'pending', label: 'Pending Invoice' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { value: 'stripe', label: 'Stripe' },
                { value: 'wire', label: 'Wire Transfer' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'card', label: 'Credit Card' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              label="Payment Received Date"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          <Input
            label="Transaction ID / Invoice ID"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            placeholder="INV-PAID-001"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. 50% Upfront kickoff deposit"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPayment ? 'Save Changes' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? This will adjust project and agency cash balances."
        confirmText="Delete Payment"
      />
    </div>
  );
};
