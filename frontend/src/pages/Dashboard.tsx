import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Users2,
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckSquare,
  ArrowRight,
  CreditCard,
  Percent,
  Coins,
  Globe,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchDashboardSummary,
  fetchRevenueChart,
  fetchProfitChart,
} from '../store/slices/dashboardSlice.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { formatCurrency, formatINR, formatUSD, formatPercentage } from '../utils/formatters.js';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, revenueChart, profitChart, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    if (user?.role === 'admin') {
      dispatch(fetchRevenueChart());
      dispatch(fetchProfitChart());
    }
  }, [dispatch, user?.role]);

  if (isLoading && !data) {
    return <LoadingSpinner message="Calculating agency financial metrics in base INR..." />;
  }

  // 1. Team Member View (Always INR)
  if (user?.role === 'team_member') {
    const summary = data?.summary || {};
    const upcomingMilestones = data?.upcomingMilestones || [];
    const recentTasks = data?.recentTasks || [];

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your project assignments, milestone payouts (all in INR), and active tasks
          </p>
        </div>

        {/* Member KPI Cards (Strictly INR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Agreed Earnings (INR)
                </p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {formatINR(summary.totalAgreed || 0)}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-lg">
                ₹
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              Across {summary.assignedProjectsCount || 0} assigned projects
            </p>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Paid Payouts (INR)
                </p>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {formatINR(summary.totalPaid || 0)}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              Settled milestone payments
            </p>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Payouts (INR)
                </p>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                  {formatINR(summary.totalPending || 0)}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              To be settled upon completion
            </p>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tasks Completed
                </p>
                <h3 className="text-2xl font-extrabold text-purple-400 mt-1">
                  {summary.completedTasksCount || 0}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    / {summary.totalTasksCount || 0}
                  </span>
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <ProgressBar
              progress={
                summary.totalTasksCount > 0
                  ? (summary.completedTasksCount / summary.totalTasksCount) * 100
                  : 0
              }
              size="sm"
              className="mt-3"
            />
          </Card>
        </div>

        {/* Member Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Milestone Payouts */}
          <Card title="Upcoming Milestone Settlements (INR)">
            {upcomingMilestones.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending milestones.</p>
            ) : (
              <div className="space-y-3">
                {upcomingMilestones.map((m: any) => (
                  <div
                    key={m._id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{m.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Due: {new Date(m.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-400">
                        {formatINR(m.amount)}
                      </div>
                      <Badge variant="status" status={m.status} size="sm">
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Assigned Tasks */}
          <Card
            title="My Assigned Tasks"
            action={
              <Link
                to="/tasks"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                View Kanban <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentTasks.map((t: any) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{t.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {(t.project as any)?.name || 'Project'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="priority" status={t.priority} size="sm">
                        {t.priority}
                      </Badge>
                      <Badge variant="status" status={t.status} size="sm">
                        {t.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // 2. Admin & Project Manager View (Consolidated Base Currency: INR)
  const cards = data?.cards || data?.summary || {};
  const recentProjects = data?.recentProjects || [];
  const currencyBreakdown = cards.currencyBreakdown || {
    usdRevenue: 0,
    inrDirectRevenue: 0,
    totalInrRevenue: cards.totalRevenue || 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Agency Financial & Project Dashboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Base Reporting: INR (₹)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time project profitability, cash flow, developer payroll, and multi-currency billing consolidated into base INR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Manage Projects</span>
          </Link>
          <Link
            to="/payroll"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Team Payroll (INR)</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial KPI Cards (Strictly Consolidated in Base INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue (INR Base)
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(cards.totalRevenue || cards.totalReceived || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Est. Contract Value:</span>
            <span className="font-bold text-slate-200">
              {formatINR(cards.totalContractValue || cards.totalProjectValue || 0)}
            </span>
          </div>
        </Card>

        {/* Team Payroll */}
        <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Payroll (INR)
              </p>
              <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">
                {formatINR(cards.teamPayroll || cards.teamPayrollPaid || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Committed Payroll:</span>
            <span className="font-bold text-slate-200">
              {formatINR(cards.teamPayrollCommitted || 0)}
            </span>
          </div>
        </Card>

        {/* Expenses */}
        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Expenses (INR)
              </p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatINR(cards.expenses || cards.totalExpenses || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cloud & Tools Overhead</span>
            <span className="text-rose-400 font-semibold">Active</span>
          </div>
        </Card>

        {/* Net Profit & Margin */}
        <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Profit (INR Base)
              </p>
              <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">
                {formatINR(cards.netProfit || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Profit Margin:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {formatPercentage(cards.profitMargin || 0)}
            </span>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown by Original Currency Widget */}
      <Card className="border-indigo-500/30 bg-slate-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Revenue by Original Inflow Currency</h4>
              <p className="text-xs text-slate-400">
                Original transaction totals converted to INR base using locked transaction exchange rates
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">USD Transactions</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {formatUSD(currencyBreakdown.usdRevenue || 0)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">INR Transactions</span>
              <span className="text-sm font-extrabold text-indigo-400">
                {formatINR(currencyBreakdown.inrDirectRevenue || 0)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Total Consolidated INR</span>
              <span className="text-sm font-extrabold text-white">
                {formatINR(cards.totalRevenue || cards.totalReceived || 0)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Clients</div>
            <div className="text-lg font-bold text-white">{cards.totalClients || 5}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Projects</div>
            <div className="text-lg font-bold text-white">{cards.activeProjects || 3}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Completed Projects</div>
            <div className="text-lg font-bold text-white">{cards.completedProjects || 1}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Team Members</div>
            <div className="text-lg font-bold text-white">{cards.teamMembers || 7}</div>
          </div>
        </div>
      </div>

      {/* Financial Comparison: Project Financial Position vs Cash Flow Position (Both in INR Base) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Financial Position (Accrual / Contract Level in INR) */}
        <Card
          title="Project Financial Position (Contract Level - INR)"
          subtitle="Revenue & profit based on total estimated contract values and committed costs"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Total Contract Value (INR)</span>
              <span className="text-sm font-bold text-slate-200">
                {formatINR(cards.totalContractValue || cards.totalProjectValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Client Payments Received (INR)</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatINR(cards.totalRevenue || cards.totalReceived || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Client Receivables Pending (INR)</span>
              <span className="text-sm font-bold text-amber-400">
                {formatINR(cards.totalClientPending || cards.totalPendingInvoices || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Committed Team Payroll (INR)</span>
              <span className="text-sm font-bold text-indigo-400">
                - {formatINR(cards.teamPayrollCommitted || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Project Expenses (INR)</span>
              <span className="text-sm font-bold text-rose-400">
                - {formatINR(cards.expenses || cards.totalExpenses || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 font-extrabold text-slate-100">
              <span className="text-sm">Expected Accrual Profit (INR)</span>
              <span className="text-base text-cyan-400">
                {formatINR(cards.accrualProfit || cards.netProfit || 0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Cash Flow Position (Actual Cash In Hand in INR) */}
        <Card
          title="Cash Flow Position (Actual Cash in Hand - INR)"
          subtitle="Real-time cash in hand based on settled client payments and payouts"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Cash Received from Clients (INR)</span>
              <span className="text-sm font-bold text-emerald-400">
                + {formatINR(cards.totalRevenue || cards.totalReceived || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Payroll Payouts Made (INR)</span>
              <span className="text-sm font-bold text-indigo-400">
                - {formatINR(cards.teamPayroll || cards.teamPayrollPaid || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Expenses Paid Out (INR)</span>
              <span className="text-sm font-bold text-rose-400">
                - {formatINR(cards.expenses || cards.totalExpenses || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Pending Team Milestones (INR)</span>
              <span className="text-sm font-semibold text-slate-400">
                {formatINR(cards.teamPayrollPending || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-5 font-extrabold text-slate-100">
              <span className="text-sm">Current Net Cash Position (INR)</span>
              <span className="text-lg text-emerald-400">
                {formatINR(cards.netProfit || 0)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Charts in Base INR (Admin view) */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue vs Expenses vs Payroll Area Chart */}
          <Card
            title="Monthly Cash Flow Overview (INR Base)"
            subtitle="Client Inflows vs Team Payroll & Expenses"
          >
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" textAnchor="end" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${(val / 1000).toFixed(0)}k`}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => formatINR(Number(val))}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (INR)"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="payroll"
                    name="Payroll (INR)"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorPay)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses (INR)"
                    stroke="#f43f5e"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Project Profitability Bar Chart */}
          <Card
            title="Project Profitability Breakdown (INR Base)"
            subtitle="Contract Value vs Total Costs & Expected Profit"
          >
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${(val / 1000).toFixed(0)}k`}`}
                  />
                  <YAxis type="category" dataKey="projectId" stroke="#64748b" fontSize={11} width={65} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => formatINR(Number(val))}
                  />
                  <Legend />
                  <Bar dataKey="contractValue" name="Contract Value (INR)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="teamPayroll" name="Team Payroll (INR)" fill="#a855f7" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="profit" name="Net Profit (INR)" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Projects Table */}
      <Card
        title="Active & Recent Projects"
        subtitle="Live delivery progress, original budget valuation, and INR expected profits"
        action={
          <Link
            to="/projects"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-4">Project</th>
                <th className="pb-3 px-4">Client</th>
                <th className="pb-3 px-3">Currency</th>
                <th className="pb-3 px-4">Original Value</th>
                <th className="pb-3 px-4">INR Value</th>
                <th className="pb-3 px-4">Progress</th>
                <th className="pb-3 px-4">Expected Profit (INR)</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentProjects.map((p: any) => {
                const pCurr = p.currency || 'USD';
                const pRate = p.estimatedExchangeRate || (pCurr === 'USD' ? 88 : 1);
                const pInrVal = p.estimatedInrValue || (pCurr === 'USD' ? p.projectValue * pRate : p.projectValue);

                return (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-200">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                        {p.projectId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {(p.client as any)?.companyName || (p.client as any)?.name || 'Client'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pCurr === 'USD'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {pCurr}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-200">
                      {formatCurrency(p.projectValue, pCurr)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      {formatINR(pInrVal)}
                    </td>
                    <td className="py-3.5 px-4 w-32">
                      <ProgressBar progress={p.progress || 0} showLabel size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-emerald-400">
                        {formatINR(p.finances?.expectedProfit || 0)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatPercentage(p.finances?.profitMargin || 0)} margin
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <Link
                        to={`/projects/${p._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all"
                      >
                        Workspace <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
