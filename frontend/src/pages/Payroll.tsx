import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Users2,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchPayrolls,
  addMilestone,
  updateMilestone,
} from '../store/slices/payrollSlice.js';
import { fetchProjects } from '../store/slices/projectSlice.js';
import { fetchTeam } from '../store/slices/teamSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatINR, formatDate } from '../utils/formatters.js';
import { IPayroll } from '../types/index.js';

export const Payroll: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payrolls, isLoading } = useSelector((state: RootState) => state.payroll);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { team } = useSelector((state: RootState) => state.team);
  const { user } = useSelector((state: RootState) => state.auth);

  const [projectFilter, setProjectFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [expandedPayrollIds, setExpandedPayrollIds] = useState<string[]>([]);

  // Add Milestone Modal (Always INR)
  const [selectedPayrollForMilestone, setSelectedPayrollForMilestone] = useState<IPayroll | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '',
    amount: 25000,
    dueDate: new Date().toISOString().slice(0, 10),
    status: 'pending' as any,
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
  });

  // Pay Milestone Modal (Always INR)
  const [payingMilestone, setPayingMilestone] = useState<any | null>(null);
  const [payFormData, setPayFormData] = useState({
    paidDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
  });

  const loadPayrolls = () => {
    dispatch(
      fetchPayrolls({
        project: projectFilter !== 'all' ? projectFilter : undefined,
        teamMember: memberFilter !== 'all' ? memberFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
    );
  };

  useEffect(() => {
    loadPayrolls();
    dispatch(fetchProjects({}));
    dispatch(fetchTeam({}));
  }, [dispatch, projectFilter, memberFilter, statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedPayrollIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOpenAddMilestone = (p: IPayroll) => {
    setSelectedPayrollForMilestone(p);
    setMilestoneFormData({
      title: '',
      amount: Math.max(0, p.pendingAmount || 25000),
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
      paymentMethod: 'bank_transfer',
      transactionId: '',
      notes: '',
    });
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayrollForMilestone) return;
    await dispatch(
      addMilestone({
        payrollId: selectedPayrollForMilestone._id,
        data: {
          ...milestoneFormData,
          amount: Number(milestoneFormData.amount),
          currency: 'INR',
        },
      })
    );
    setSelectedPayrollForMilestone(null);
    loadPayrolls();
  };

  const handleMarkMilestonePaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingMilestone) return;
    await dispatch(
      updateMilestone({
        id: payingMilestone._id,
        data: {
          status: 'paid',
          paidDate: payFormData.paidDate,
          paymentMethod: payFormData.paymentMethod,
          transactionId: payFormData.transactionId,
          notes: payFormData.notes,
        },
      })
    );
    setPayingMilestone(null);
    loadPayrolls();
  };

  // Calculations for KPI Cards (All Strictly INR)
  const totalAgreed = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
  const totalPaid = payrolls.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
  const totalPending = Math.max(0, totalAgreed - totalPaid);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Project-Based Team Payroll
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Strictly INR (₹) Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage developer compensations, milestone divisions, and INR disbursements
          </p>
        </div>
      </div>

      {/* Overview Cards (All INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Committed Payroll
              </p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {formatINR(totalAgreed)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-lg">
              ₹
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">{payrolls.length} Member Assignments</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Settled Disbursements
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(totalPaid)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Disbursed to developer bank accounts</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatINR(totalPending)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Pending milestone settlements</p>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Filter by Team Member"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Team Members' },
              ...team.map((m) => ({ value: m._id, label: m.name })),
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
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'partially_paid', label: 'Partially Paid' },
              { value: 'paid', label: 'Fully Paid' },
            ]}
          />
        </div>
      </Card>

      {/* Central Payroll Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading payroll records..." />
      ) : payrolls.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-8 h-8 text-indigo-400" />}
          title="No payroll records found"
          description="Assign team members to projects to generate INR payroll records."
        />
      ) : (
        <div className="space-y-4">
          {payrolls.map((p) => {
            const memberObj = typeof p.teamMember === 'object' ? p.teamMember : null;
            const projectObj = typeof p.project === 'object' ? p.project : null;
            const isExpanded = expandedPayrollIds.includes(p._id);
            const msList = p.milestones || [];

            return (
              <Card key={p._id} className="p-0 overflow-hidden border border-slate-800">
                {/* Main Row */}
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        memberObj?.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberObj?.name || 'User'}`
                      }
                      alt={memberObj?.name}
                      className="w-11 h-11 rounded-full bg-slate-800 object-cover border border-indigo-500/30"
                    />
                    <div>
                      <div className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                        <span>{memberObj?.name}</span>
                        <Badge variant="status" status={p.status} size="sm">
                          {p.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-indigo-400 font-semibold mt-0.5">
                        {p.role} in{' '}
                        <span className="text-slate-300 font-bold">{projectObj?.name}</span> (
                        <span className="font-mono">{projectObj?.projectId}</span>)
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics Row (INR) */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Agreed (INR)
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {formatINR(p.agreedAmount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Paid Out (INR)
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {formatINR(p.totalPaid)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Pending (INR)
                      </span>
                      <span className="text-sm font-extrabold text-amber-400">
                        {formatINR(p.pendingAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Plus className="w-3 h-3 text-indigo-400" />}
                          onClick={() => handleOpenAddMilestone(p)}
                        >
                          Add Milestone
                        </Button>
                      )}
                      <button
                        onClick={() => toggleExpand(p._id)}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={isExpanded ? 'Collapse Milestones' : 'Expand Milestones'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Milestones Table */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/80">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Milestone Payment Tranches ({msList.length}) - Denominated in INR (₹)
                    </h5>

                    {msList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 italic">
                        No individual milestones divided yet. Add milestones to track settlements.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                              <th className="pb-2.5 pr-4">Milestone Title</th>
                              <th className="pb-2.5 px-4 text-right">Amount (INR)</th>
                              <th className="pb-2.5 px-4">Due Date</th>
                              <th className="pb-2.5 px-4">Paid Date</th>
                              <th className="pb-2.5 px-4">Method & Transaction</th>
                              <th className="pb-2.5 px-4">Status</th>
                              {isAdmin && <th className="pb-2.5 pl-4 text-right">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {msList.map((ms: any) => (
                              <tr key={ms._id} className="hover:bg-slate-900/50">
                                <td className="py-3 pr-4 font-bold text-slate-200">{ms.title}</td>
                                <td className="py-3 px-4 text-right font-extrabold text-emerald-400">
                                  {formatINR(ms.amount)}
                                </td>
                                <td className="py-3 px-4 text-slate-400">{formatDate(ms.dueDate)}</td>
                                <td className="py-3 px-4 text-slate-300">{formatDate(ms.paidDate)}</td>
                                <td className="py-3 px-4">
                                  <span className="capitalize font-medium text-slate-200">
                                    {ms.paymentMethod?.replace('_', ' ')}
                                  </span>
                                  {ms.transactionId && (
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      {ms.transactionId}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="status" status={ms.status} size="sm">
                                    {ms.status}
                                  </Badge>
                                </td>
                                {isAdmin && (
                                  <td className="py-3 pl-4 text-right">
                                    {ms.status !== 'paid' && (
                                      <button
                                        onClick={() => {
                                          setPayingMilestone(ms);
                                          setPayFormData({
                                            paidDate: new Date().toISOString().slice(0, 10),
                                            paymentMethod: 'bank_transfer',
                                            transactionId: `TXN-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
                                            notes: 'Settled milestone payout',
                                          });
                                        }}
                                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                      >
                                        Mark as Paid
                                      </button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ADD MILESTONE MODAL (INR) */}
      <Modal
        isOpen={!!selectedPayrollForMilestone}
        onClose={() => setSelectedPayrollForMilestone(null)}
        title="Add Milestone Tranche (INR)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveMilestone} className="space-y-4">
          <Input
            label="Milestone Title"
            required
            value={milestoneFormData.title}
            onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
            placeholder="e.g. Sprint 1 Deliverables & UI Handoff"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Milestone Amount (₹ INR)"
              type="number"
              required
              min={0}
              value={milestoneFormData.amount}
              onChange={(e) =>
                setMilestoneFormData({ ...milestoneFormData, amount: Number(e.target.value) })
              }
            />
            <Input
              label="Due Date"
              type="date"
              required
              value={milestoneFormData.dueDate}
              onChange={(e) =>
                setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedPayrollForMilestone(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Milestone (INR)
            </Button>
          </div>
        </form>
      </Modal>

      {/* MARK MILESTONE AS PAID MODAL */}
      <Modal
        isOpen={!!payingMilestone}
        onClose={() => setPayingMilestone(null)}
        title={`Settle Payout: ${payingMilestone?.title || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleMarkMilestonePaid} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-400">Payout Amount</span>
            <span className="text-base font-extrabold text-emerald-400">
              {formatINR(payingMilestone?.amount)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Disbursement Date"
              type="date"
              required
              value={payFormData.paidDate}
              onChange={(e) => setPayFormData({ ...payFormData, paidDate: e.target.value })}
            />
            <Select
              label="Payment Method"
              value={payFormData.paymentMethod}
              onChange={(e) => setPayFormData({ ...payFormData, paymentMethod: e.target.value })}
              options={[
                { value: 'bank_transfer', label: 'Bank Transfer (NEFT/IMPS/UPI)' },
                { value: 'stripe', label: 'Stripe' },
                { value: 'wise', label: 'Wise' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'cash', label: 'Cash' },
              ]}
            />
          </div>

          <Input
            label="Transaction ID / UTR / Reference"
            value={payFormData.transactionId}
            onChange={(e) => setPayFormData({ ...payFormData, transactionId: e.target.value })}
            placeholder="e.g. UTR-BANK-99210"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setPayingMilestone(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Mark as Paid
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
