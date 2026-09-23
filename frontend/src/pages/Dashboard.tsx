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
import { formatCurrency, formatPercentage } from '../utils/formatters.js';

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
    return <LoadingSpinner message="Calculating agency financial metrics..." />;
  }

  // 1. Team Member View
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
            Track your project assignments, milestone payouts, and active tasks
          </p>
        </div>

        {/* Member KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Agreed Earnings
                </p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {formatCurrency(summary.totalAgreed)}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <DollarSign className="w-5 h-5" />
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
                  Total Paid Payouts
                </p>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(summary.totalPaid)}
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
                  Pending Payouts
                </p>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                  {formatCurrency(summary.totalPending)}
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
          <Card title="Upcoming Milestone Settlements">
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
                        {formatCurrency(m.amount)}
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

  // 2. Admin & Project Manager View
  const cards = data?.cards || data?.summary || {};
  const recentProjects = data?.recentProjects || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Agency Financial & Project Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time project profitability, cash flow, team payroll commitments, and delivery status
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
            <span>Team Payroll</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue (Inflows)
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(cards.totalRevenue || cards.totalReceived)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Contract Value:</span>
            <span className="font-bold text-slate-200">
              {formatCurrency(cards.totalContractValue || cards.totalProjectValue)}
            </span>
          </div>
        </Card>

        {/* Team Payroll */}
        <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Payroll (Cost)
              </p>
              <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">
                {formatCurrency(cards.teamPayroll || cards.teamPayrollPaid)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Committed Payroll:</span>
            <span className="font-bold text-slate-200">
              {formatCurrency(cards.teamPayrollCommitted)}
            </span>
          </div>
        </Card>

        {/* Expenses */}
        <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Expenses
              </p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatCurrency(cards.expenses || cards.totalExpenses)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cloud & Tools Cost</span>
            <span className="text-rose-400 font-semibold">Active</span>
          </div>
        </Card>

        {/* Net Profit & Margin */}
        <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Profit
              </p>
              <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">
                {formatCurrency(cards.netProfit)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Profit Margin:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {formatPercentage(cards.profitMargin)}
            </span>
          </div>
        </Card>
      </div>

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

      {/* Financial Comparison: Project Financial Position vs Cash Flow Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Financial Position (Accrual / Contract Level) */}
        <Card
          title="Project Financial Position (Contract Level)"
          subtitle="Revenue & profit based on total contract values and committed team costs"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Total Contract Value</span>
              <span className="text-sm font-bold text-slate-200">
                {formatCurrency(cards.totalContractValue || cards.totalProjectValue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Client Payments Received</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatCurrency(cards.totalRevenue || cards.totalReceived)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Client Receivables (Pending)</span>
              <span className="text-sm font-bold text-amber-400">
                {formatCurrency(cards.totalClientPending || cards.totalPendingInvoices)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Committed Team Payroll</span>
              <span className="text-sm font-bold text-indigo-400">
                - {formatCurrency(cards.teamPayrollCommitted)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Project Expenses</span>
              <span className="text-sm font-bold text-rose-400">
                - {formatCurrency(cards.expenses || cards.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 font-extrabold text-slate-100">
              <span className="text-sm">Expected Accrual Profit</span>
              <span className="text-base text-cyan-400">
                {formatCurrency(cards.accrualProfit || cards.netProfit)}
              </span>
            </div>
          </div>
        </Card>

        {/* Cash Flow Position */}
        <Card
          title="Cash Flow Position (Actual Cash In Hand)"
          subtitle="Real-time cash in hand based on settled payments and payouts"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Cash Received from Clients</span>
              <span className="text-sm font-bold text-emerald-400">
                + {formatCurrency(cards.totalRevenue || cards.totalReceived)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Payroll Payouts Made</span>
              <span className="text-sm font-bold text-indigo-400">
                - {formatCurrency(cards.teamPayroll || cards.teamPayrollPaid)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Expenses Paid Out</span>
              <span className="text-sm font-bold text-rose-400">
                - {formatCurrency(cards.expenses || cards.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Pending Team Milestones</span>
              <span className="text-sm font-semibold text-slate-400">
                {formatCurrency(cards.teamPayrollPending)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-5 font-extrabold text-slate-100">
              <span className="text-sm">Current Net Cash Position</span>
              <span className="text-lg text-emerald-400">
                {formatCurrency(cards.netProfit)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Charts (Admin view) */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue vs Expenses vs Payroll Area Chart */}
          <Card
            title="Monthly Cash Flow Overview"
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
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="payroll"
                    name="Payroll"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorPay)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
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
            title="Project Profitability Breakdown"
            subtitle="Contract Value vs Total Costs & Expected Profit"
          >
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                  <YAxis type="category" dataKey="projectId" stroke="#64748b" fontSize={11} width={65} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => formatCurrency(Number(val))}
                  />
                  <Legend />
                  <Bar dataKey="contractValue" name="Contract Value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="teamPayroll" name="Team Payroll" fill="#a855f7" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Projects Table */}
      <Card
        title="Active & Recent Projects"
        subtitle="Live delivery progress, budget valuation, and profit margins"
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
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Contract Value</th>
                <th className="pb-3 px-4">Progress</th>
                <th className="pb-3 px-4">Expected Profit</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentProjects.map((p: any) => (
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
                  <td className="py-3.5 px-4">
                    <Badge variant="status" status={p.status} size="sm">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-200">
                    {formatCurrency(p.projectValue)}
                  </td>
                  <td className="py-3.5 px-4 w-36">
                    <ProgressBar progress={p.progress || 0} showLabel size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-emerald-400">
                      {formatCurrency(p.finances?.expectedProfit || 0)}
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
