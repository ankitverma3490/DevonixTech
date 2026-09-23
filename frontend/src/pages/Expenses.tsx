import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Trash2,
  Edit2,
  Calendar,
  Layers,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../store/slices/expenseSlice.js';
import { fetchProjects } from '../store/slices/projectSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { IExpense, ExpenseCategory } from '../types/index.js';

export const Expenses: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, totalAmount, isLoading } = useSelector((state: RootState) => state.expenses);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    category: 'hosting' as ExpenseCategory,
    amount: 250,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'credit_card',
    description: '',
  });

  const loadExpenses = () => {
    dispatch(
      fetchExpenses({
        search,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        project: projectFilter !== 'all' ? projectFilter : undefined,
      })
    );
  };

  useEffect(() => {
    loadExpenses();
    dispatch(fetchProjects({}));
  }, [dispatch, search, categoryFilter, projectFilter]);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setFormData({
      name: '',
      project: '',
      category: 'hosting',
      amount: 250,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'credit_card',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: IExpense) => {
    setEditingExpense(e);
    setFormData({
      name: e.name,
      project: (e.project as any)?._id || (e.project as string) || '',
      category: e.category,
      amount: e.amount,
      date: e.date ? new Date(e.date).toISOString().slice(0, 10) : '',
      paymentMethod: e.paymentMethod || 'credit_card',
      description: e.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      await dispatch(
        updateExpense({
          id: editingExpense._id,
          data: {
            ...formData,
            project: formData.project || undefined,
            amount: Number(formData.amount),
          },
        })
      );
    } else {
      await dispatch(
        createExpense({
          ...formData,
          project: formData.project || undefined,
          amount: Number(formData.amount),
        })
      );
    }
    setIsModalOpen(false);
    loadExpenses();
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await dispatch(deleteExpense(deletingId));
    setDeletingId(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Expense Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track cloud infrastructure, third-party APIs, licenses, and operating expenditures
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Add Expense
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Expenses
              </p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatCurrency(totalAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">{expenses.length} Expense items logged</p>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hosting & Cloud Infra
              </p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(
                  expenses
                    .filter((e) => e.category === 'hosting')
                    .reduce((sum, e) => sum + (e.amount || 0), 0)
                )}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">AWS, Vercel & database nodes</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                APIs & Software Licenses
              </p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(
                  expenses
                    .filter((e) => e.category === 'api' || e.category === 'software')
                    .reduce((sum, e) => sum + (e.amount || 0), 0)
                )}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Third party developer tooling</p>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search by expense name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'hosting', label: 'Hosting & Cloud' },
              { value: 'domain', label: 'Domain' },
              { value: 'api', label: 'API' },
              { value: 'software', label: 'Software' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'equipment', label: 'Equipment' },
              { value: 'travel', label: 'Travel' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Select
            label="Project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Projects (incl. Agency general)' },
              ...projects.map((p) => ({ value: p._id, label: `${p.name} (${p.projectId})` })),
            ]}
          />
        </div>
      </Card>

      {/* Expenses Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading expenses..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8 text-rose-400" />}
          title="No expenses recorded"
          description="Log project software, hosting, or agency overheads."
          actionText={isAdmin ? 'Add Expense' : undefined}
          onAction={isAdmin ? handleOpenCreate : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Expense Name</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((e) => {
                  const prj = typeof e.project === 'object' ? e.project : null;
                  return (
                    <tr key={e._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-100">{e.name}</td>
                      <td className="py-4 px-4">
                        {prj ? (
                          <span className="text-indigo-400 font-medium">
                            {prj.name} (<span className="font-mono">{prj.projectId}</span>)
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Agency Overhead</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-rose-400 text-sm">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="py-4 px-4 text-slate-400">{formatDate(e.date)}</td>
                      <td className="py-4 px-4 capitalize text-slate-300 font-medium">
                        {e.paymentMethod?.replace('_', ' ')}
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(e)}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingId(e._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <Input
            label="Expense Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. AWS Production EC2 Cluster"
          />

          <Select
            label="Project (Optional for general overhead)"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            options={[
              { value: '', label: 'General Agency Overhead' },
              ...projects.map((p) => ({ value: p._id, label: `${p.name} (${p.projectId})` })),
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              options={[
                { value: 'hosting', label: 'Hosting' },
                { value: 'domain', label: 'Domain' },
                { value: 'api', label: 'API' },
                { value: 'software', label: 'Software' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'travel', label: 'Travel' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Amount ($)"
              type="number"
              required
              min={0}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              options={[
                { value: 'credit_card', label: 'Corporate Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'cash', label: 'Cash' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Invoice reference, purpose..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense? Project profit calculations will update automatically."
        confirmText="Delete Expense"
      />
    </div>
  );
};
