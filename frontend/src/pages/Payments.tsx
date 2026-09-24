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
  AlertTriangle,
  RefreshCw,
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
import { CurrencySelector } from '../components/common/CurrencySelector.js';
import { ExchangeRateInput } from '../components/common/ExchangeRateInput.js';
import { INRAmountDisplay } from '../components/common/INRAmountDisplay.js';
import { formatCurrency, formatINR, formatUSD, formatExchangeRate, formatDate } from '../utils/formatters.js';
import { IClientPayment, Currency, ClientPaymentStatus } from '../types/index.js';

export const Payments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, isLoading } = useSelector((state: RootState) => state.payments);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { user } = useSelector((state: RootState) => state.auth);

  const [projectFilter, setProjectFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<IClientPayment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    project: string;
    client: string;
    currency: Currency;
    amount: number;
    exchangeRate: number;
    dueDate: string;
    paymentDate: string;
    status: ClientPaymentStatus;
    paymentMethod: string;
    transactionId: string;
    notes: string;
  }>({
    project: '',
    client: '',
    currency: 'USD',
    amount: 5000,
    exchangeRate: 88,
    dueDate: new Date().toISOString().slice(0, 10),
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
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
    const firstProj = projects[0];
    const defaultCurrency: Currency = firstProj?.currency || 'USD';
    const defaultRate = defaultCurrency === 'INR' ? 1 : firstProj?.estimatedExchangeRate || 88;

    setFormData({
      project: firstProj?._id || '',
      client: (typeof firstProj?.client === 'object' ? firstProj?.client?._id : firstProj?.client) || clients[0]?._id || '',
      currency: defaultCurrency,
      amount: 5000,
      exchangeRate: defaultRate,
      dueDate: new Date().toISOString().slice(0, 10),
      paymentDate: new Date().toISOString().slice(0, 10),
      status: 'paid',
      paymentMethod: defaultCurrency === 'USD' ? 'wire' : 'bank_transfer',
      transactionId: `INV-TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: IClientPayment) => {
    setEditingPayment(p);
    const pCurrency: Currency = p.currency || 'USD';
    const pRate = p.exchangeRate || (pCurrency === 'INR' ? 1 : 88);

    setFormData({
      project: (p.project as any)?._id || (p.project as string),
      client: (p.client as any)?._id || (p.client as string),
      currency: pCurrency,
      amount: p.amount,
      exchangeRate: pRate,
      dueDate: p.dueDate ? new Date(p.dueDate).toISOString().slice(0, 10) : '',
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : '',
      status: p.status,
      paymentMethod: p.paymentMethod || 'bank_transfer',
      transactionId: p.transactionId || '',
      notes: p.notes || '',
    });
    setIsModalOpen(true);
  };

  // When selecting project in modal, auto-populate client and currency if not set
  const handleProjectSelect = (projId: string) => {
    const selected = projects.find((p) => p._id === projId);
    if (selected) {
      const pCurr: Currency = selected.currency || 'USD';
      const cId = typeof selected.client === 'object' ? (selected.client as any)?._id : selected.client;
      setFormData((prev) => ({
        ...prev,
        project: projId,
        client: cId || prev.client,
        currency: pCurr,
        exchangeRate: pCurr === 'INR' ? 1 : selected.estimatedExchangeRate || 88,
      }));
    } else {
      setFormData((prev) => ({ ...prev, project: projId }));
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = formData.currency === 'INR' ? 1 : Number(formData.exchangeRate || 1);
    const inrAmt = Number(formData.amount) * rate;

    if (editingPayment) {
      await dispatch(
        updatePayment({
          id: editingPayment._id,
          data: {
            ...formData,
            amount: Number(formData.amount),
            exchangeRate: rate,
            inrAmount: inrAmt,
          },
        })
      );
    } else {
      await dispatch(
        createPayment({
          ...formData,
          amount: Number(formData.amount),
          exchangeRate: rate,
          inrAmount: inrAmt,
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

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (currencyFilter !== 'all' && (p.currency || 'USD') !== currencyFilter) {
      return false;
    }
    return true;
  });

  // Calculate INR Reporting Base Aggregates using stored payment INR amounts
  const totalInrReceived = filteredPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.inrAmount ?? (p.currency === 'USD' ? p.amount * (p.exchangeRate || 88) : p.amount)), 0);

  const totalInrPending = filteredPayments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + (p.inrAmount ?? (p.currency === 'USD' ? p.amount * (p.exchangeRate || 88) : p.amount)), 0);

  const totalInrInvoiced = totalInrReceived + totalInrPending;

  // Currency breakdown for UI insight
  const usdReceived = filteredPayments
    .filter((p) => p.status === 'paid' && p.currency === 'USD')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const inrDirectReceived = filteredPayments
    .filter((p) => p.status === 'paid' && p.currency === 'INR')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Client Inflow Payments</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Reporting Base: INR (₹)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-currency client payments with locked historical exchange rates consolidated into base INR
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Record Client Payment
          </Button>
        )}
      </div>

      {/* KPI Cards (Consolidated in Base INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Invoiced (INR Base)
              </p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {formatINR(totalInrInvoiced)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-lg">
              ₹
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">{filteredPayments.length} Payment records</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actual Collected (INR Base)
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(totalInrReceived)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 flex flex-wrap gap-2">
            {usdReceived > 0 && <span>USD: <strong className="text-slate-200">{formatUSD(usdReceived)}</strong></span>}
            {usdReceived > 0 && inrDirectReceived > 0 && <span>•</span>}
            {inrDirectReceived > 0 && <span>INR: <strong className="text-slate-200">{formatINR(inrDirectReceived)}</strong></span>}
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending Receivables (INR Base)
              </p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatINR(totalInrPending)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Outstanding receivables across clients</p>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Filter by Currency"
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Currencies' },
              { value: 'INR', label: 'INR (₹) Payments' },
              { value: 'USD', label: 'USD ($) Payments' },
            ]}
          />
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
              { value: 'paid', label: 'Paid / Received' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>
      </Card>

      {/* Payments Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading client payments..." />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-indigo-400" />}
          title="No client payments found"
          description="Record client retainer deposits and milestone payments in INR or USD."
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
                  <th className="py-3.5 px-4 text-right">Original Amount</th>
                  <th className="py-3.5 px-3">Currency</th>
                  <th className="py-3.5 px-3">Exchange Rate</th>
                  <th className="py-3.5 px-4 text-right">INR Equivalent</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Paid Date</th>
                  <th className="py-3.5 px-4">Method & Trans.</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((p) => {
                  const clientObj = typeof p.client === 'object' ? p.client : null;
                  const projectObj = typeof p.project === 'object' ? p.project : null;
                  const pCurrency: Currency = p.currency || 'USD';
                  const pRate = p.exchangeRate || (pCurrency === 'INR' ? 1 : 88);
                  const pInr = p.inrAmount ?? (pCurrency === 'USD' ? p.amount * pRate : p.amount);

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
                        {p.requiresExchangeRateUpdate && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mt-1 border border-amber-500/20 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Needs Rate Confirmation
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-white text-sm">
                        {formatCurrency(p.amount, pCurrency)}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pCurrency === 'USD'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {pCurrency}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-300 font-mono text-[11px]">
                        {pCurrency === 'USD' ? formatExchangeRate(pRate) : '1.00 (Base)'}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-emerald-400 text-sm">
                        {formatINR(pInr)}
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
                                title="Edit Payment & Rate"
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

      {/* Record / Edit Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? 'Edit Client Payment & Exchange Rate' : 'Record Client Inflow Payment'}
        maxWidth="lg"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Project"
              required
              value={formData.project}
              onChange={(e) => handleProjectSelect(e.target.value)}
              options={projects.map((p) => ({
                value: p._id,
                label: `${p.name} (${p.projectId}) [${p.currency || 'USD'}]`,
              }))}
              placeholder="Select Project"
            />
            <Select
              label="Client"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              options={clients.map((c) => ({ value: c._id, label: c.companyName }))}
              placeholder="Select Client"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencySelector
              value={formData.currency}
              onChange={(cur) => {
                setFormData({
                  ...formData,
                  currency: cur,
                  exchangeRate: cur === 'INR' ? 1 : 88,
                });
              }}
              label="Payment Currency"
            />
            <Input
              label={`Payment Amount (${formData.currency})`}
              type="number"
              required
              min={0}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>

          {formData.currency === 'USD' && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <ExchangeRateInput
                value={formData.exchangeRate}
                onChange={(rate) => setFormData({ ...formData, exchangeRate: rate })}
                originalAmount={formData.amount}
                label="Transaction USD → INR Exchange Rate"
                helperText="Permanent historical rate for this payment. It will NOT fluctuate with future rates."
              />
              <INRAmountDisplay
                inrAmount={formData.amount * formData.exchangeRate}
                originalAmount={formData.amount}
                originalCurrency="USD"
                exchangeRate={formData.exchangeRate}
              />
            </div>
          )}

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
                { value: 'wire', label: 'Wire Transfer / Swift' },
                { value: 'bank_transfer', label: 'Bank Transfer (NEFT/IMPS/UPI)' },
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
            label="Transaction ID / Wire Reference / Invoice ID"
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
              placeholder="e.g. 50% Kickoff milestone or upfront retainer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPayment ? 'Save Payment Record' : 'Record Payment'}
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
