import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users2,
  Calendar,
  Filter,
  Download,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchRevenueReport,
  fetchPayrollReport,
  fetchProfitReport,
} from '../store/slices/reportSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';

export const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { revenueReport, payrollReport, profitReport, isLoading } = useSelector(
    (state: RootState) => state.reports
  );

  const [activeReportTab, setActiveReportTab] = useState<'profit' | 'revenue' | 'payroll'>('profit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReportData = () => {
    const params = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    if (activeReportTab === 'profit') dispatch(fetchProfitReport(params));
    if (activeReportTab === 'revenue') dispatch(fetchRevenueReport(params));
    if (activeReportTab === 'payroll') dispatch(fetchPayrollReport(params));
  };

  useEffect(() => {
    loadReportData();
  }, [dispatch, activeReportTab, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive Reports</h2>
          <p className="text-xs text-slate-400 mt-1">
            Audited financial breakdown of revenue, project-based payroll commitments, and net profitability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-indigo-400" />}
            onClick={handlePrint}
          >
            Export / Print Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2">
        <button
          onClick={() => setActiveReportTab('profit')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeReportTab === 'profit'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Profit & Margin Report</span>
        </button>

        <button
          onClick={() => setActiveReportTab('revenue')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeReportTab === 'revenue'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-blue-400" />
          <span>Revenue & Client Receivables</span>
        </button>

        <button
          onClick={() => setActiveReportTab('payroll')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeReportTab === 'payroll'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users2 className="w-4 h-4 text-purple-400" />
          <span>Team Payroll Disbursements</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Filter by Date Period:</span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs"
            />
            <span className="text-slate-500">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-semibold text-rose-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </Card>

      {/* REPORT CONTENT */}
      {isLoading ? (
        <LoadingSpinner message="Generating report..." />
      ) : activeReportTab === 'profit' ? (
        <div className="space-y-6">
          {/* Profit Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">
                {formatCurrency(profitReport?.summary?.cashRevenue || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Contract: {formatCurrency(profitReport?.summary?.totalContractRevenue || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Payroll Paid
              </span>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">
                {formatCurrency(profitReport?.summary?.payrollPaid || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Total team payouts</div>
            </Card>

            <Card className="border-l-4 border-l-rose-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatCurrency(profitReport?.summary?.totalExpenses || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Cloud, APIs, software</div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Profit
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(profitReport?.summary?.cashProfit || 0)}
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-2">
                {formatPercentage(profitReport?.summary?.cashMargin || 0)} Margin
              </div>
            </Card>
          </div>

          {/* Project Profitability Table */}
          <Card
            title="Project Profitability Statement"
            subtitle="Contract valuation, committed costs, and net margin realized across projects"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-6">Project & Client</th>
                    <th className="py-3 px-4 text-right">Contract Value</th>
                    <th className="py-3 px-4 text-right">Revenue Received</th>
                    <th className="py-3 px-4 text-right">Team Payroll</th>
                    <th className="py-3 px-4 text-right">Expenses</th>
                    <th className="py-3 px-4 text-right">Expected Profit</th>
                    <th className="py-3 px-6 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(profitReport?.projects || []).map((p: any) => (
                    <tr key={p.projectId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-100">{p.projectName}</div>
                        <div className="text-slate-400 text-xs">
                          {p.companyName} • <span className="font-mono text-indigo-400">{p.projectId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {formatCurrency(p.contractValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                        {formatCurrency(p.clientReceived)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-indigo-400 font-bold">
                        {formatCurrency(p.teamPayrollCommitted)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-rose-400 font-bold">
                        {formatCurrency(p.expenses)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                        {formatCurrency(p.expectedProfit)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {formatPercentage(p.profitMargin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeReportTab === 'revenue' ? (
        <div className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Project Value
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(revenueReport?.summary?.totalProjectValue || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue Collected
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(revenueReport?.summary?.totalReceived || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pending Receivables
              </span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(revenueReport?.summary?.totalPending || 0)}
              </div>
            </Card>
          </div>

          {/* Client Inflow Breakdown Table */}
          <Card title="Client Receivables Breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-6">Client Company</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4 text-center">Projects</th>
                    <th className="py-3 px-4 text-right">Project Value</th>
                    <th className="py-3 px-4 text-right">Received</th>
                    <th className="py-3 px-6 text-right">Pending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(revenueReport?.clientBreakdown || []).map((c: any) => (
                    <tr key={c.clientId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-6 font-bold text-slate-100">{c.companyName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{c.clientName}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                        {c.projectCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {formatCurrency(c.projectValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(c.received)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold text-amber-400">
                        {formatCurrency(c.pending)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payroll Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-l-4 border-l-indigo-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Team Agreed Cost
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(payrollReport?.summary?.totalAgreedCost || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Paid Disbursements
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(payrollReport?.summary?.totalPaid || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pending Payroll
              </span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(payrollReport?.summary?.totalPending || 0)}
              </div>
            </Card>
          </div>

          {/* Member Payroll Breakdown Table */}
          <Card title="Team Compensation Breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-6">Member Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Projects Assigned</th>
                    <th className="py-3 px-4 text-right">Agreed Compensation</th>
                    <th className="py-3 px-4 text-right">Paid Out</th>
                    <th className="py-3 px-6 text-right">Pending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(payrollReport?.memberBreakdown || []).map((m: any) => (
                    <tr key={m.memberId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-6 font-bold text-slate-100">{m.name}</td>
                      <td className="py-3.5 px-4 capitalize text-indigo-400 font-medium">
                        {m.role?.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                        {m.projectCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {formatCurrency(m.agreed)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(m.paid)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold text-amber-400">
                        {formatCurrency(m.pending)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
