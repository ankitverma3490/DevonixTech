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
  Globe,
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
import { formatCurrency, formatINR, formatUSD, formatPercentage } from '../utils/formatters.js';

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
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive Reports</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Reporting Base: INR (₹)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated multi-currency audit of revenue, developer payroll disbursements, and INR profitability
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
          <span>Profit & Margin Report (INR)</span>
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
          <span>Revenue & Client Receivables (INR)</span>
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
          <span>Team Payroll Disbursements (INR)</span>
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
        <LoadingSpinner message="Generating consolidated INR report..." />
      ) : activeReportTab === 'profit' ? (
        <div className="space-y-6">
          {/* Profit Summary Cards (Strictly Consolidated in Base INR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue (INR Base)
              </span>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">
                {formatINR(profitReport?.summary?.cashRevenue || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Contract Est: {formatINR(profitReport?.summary?.totalContractRevenue || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Payroll Paid (INR)
              </span>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">
                {formatINR(profitReport?.summary?.payrollPaid || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Total developer payouts</div>
            </Card>

            <Card className="border-l-4 border-l-rose-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Expenses (INR)
              </span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatINR(profitReport?.summary?.totalExpenses || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">Cloud, APIs, software</div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Profit (INR Base)
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(profitReport?.summary?.cashProfit || 0)}
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-2">
                {formatPercentage(profitReport?.summary?.cashMargin || 0)} Margin
              </div>
            </Card>
          </div>

          {/* Project Profitability Table */}
          <Card
            title="Project Profitability Statement (INR Base)"
            subtitle="Contract valuation, committed costs, and net margin realized across projects in INR"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-6">Project & Client</th>
                    <th className="py-3 px-3">Currency</th>
                    <th className="py-3 px-4 text-right">Contract Value (INR)</th>
                    <th className="py-3 px-4 text-right">Revenue Received (INR)</th>
                    <th className="py-3 px-4 text-right">Team Payroll (INR)</th>
                    <th className="py-3 px-4 text-right">Expenses (INR)</th>
                    <th className="py-3 px-4 text-right">Expected Profit (INR)</th>
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
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.currency === 'USD'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {p.currency || 'USD'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {formatINR(p.contractValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                        {formatINR(p.clientReceived)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-indigo-400 font-bold">
                        {formatINR(p.teamPayrollCommitted)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-rose-400 font-bold">
                        {formatINR(p.expenses)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                        {formatINR(p.expectedProfit)}
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
          {/* Revenue Summary Cards (INR Base) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Project Value (INR Base)
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatINR(revenueReport?.summary?.totalProjectValue || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue Collected (INR Base)
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(revenueReport?.summary?.totalReceived || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pending Receivables (INR Base)
              </span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatINR(revenueReport?.summary?.totalPending || 0)}
              </div>
            </Card>
          </div>

          {/* Client Inflow Breakdown Table */}
          <Card title="Client Receivables Breakdown (INR Base)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-6">Client Company</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4 text-center">Projects</th>
                    <th className="py-3 px-4 text-right">Project Value (INR)</th>
                    <th className="py-3 px-4 text-right">Received (INR)</th>
                    <th className="py-3 px-6 text-right">Pending Balance (INR)</th>
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
                        {formatINR(c.projectValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatINR(c.received)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold text-amber-400">
                        {formatINR(c.pending)}
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
          {/* Payroll Summary Cards (Strictly INR) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-l-4 border-l-indigo-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Team Agreed Cost (INR)
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatINR(payrollReport?.summary?.totalAgreedCost || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Paid Disbursements (INR)
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(payrollReport?.summary?.totalPaid || 0)}
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pending Payroll (INR)
              </span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatINR(payrollReport?.summary?.totalPending || 0)}
              </div>
            </Card>
          </div>

          {/* Member Payroll Breakdown Table */}
          <Card title="Team Compensation Breakdown (INR)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-6">Member Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Projects Assigned</th>
                    <th className="py-3 px-4 text-right">Agreed Compensation (INR)</th>
                    <th className="py-3 px-4 text-right">Paid Out (INR)</th>
                    <th className="py-3 px-6 text-right">Pending Balance (INR)</th>
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
                        {formatINR(m.agreed)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatINR(m.paid)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-extrabold text-amber-400">
                        {formatINR(m.pending)}
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
