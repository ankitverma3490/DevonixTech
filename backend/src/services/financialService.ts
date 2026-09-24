import { Types } from 'mongoose';
import { Project } from '../models/Project.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Expense } from '../models/Expense.js';
import { Currency } from '../types/index.js';

export interface ProjectFinancialSummary {
  projectId: string;
  projectMongoId: string;
  projectName: string;
  currency: Currency;
  estimatedExchangeRate: number;
  contractValue: number; // In project's original currency
  estimatedInrValue: number; // In INR (reporting base)
  clientReceived: number; // In original currency
  clientReceivedInr: number; // In INR using actual historical exchange rates of received payments
  clientPending: number; // In original currency
  clientPendingInr: number; // In INR
  teamPayrollCommitted: number; // In INR
  teamPayrollPaid: number; // In INR
  teamPayrollPending: number; // In INR
  expenses: number; // In INR
  totalCost: number; // In INR (payroll committed + expenses)
  expectedProfit: number; // In INR (estimatedInrValue - totalCost)
  profitMargin: number; // percentage based on estimated INR value
  actualCashProfit: number; // In INR (clientReceivedInr - teamPayrollPaid - expenses)
  actualCashMargin: number; // percentage based on actual cash received
  cashReceived: number; // In original currency
  cashReceivedInr: number; // In INR
  cashPaidOut: number; // In INR (teamPayrollPaid + expenses)
  netCashPosition: number; // In INR
}

export interface AgencyFinancialSummary {
  // Main reporting totals in INR (Base currency)
  totalRevenue: number; // Total actual client payments received in INR
  totalContractValue: number; // Total estimated value of all projects in INR
  totalClientPending: number; // Total pending client payments in INR
  teamPayrollCommitted: number; // Total committed payroll in INR
  teamPayrollPaid: number; // Total paid payroll in INR
  teamPayrollPending: number; // Total pending payroll in INR
  totalExpenses: number; // Total expenses in INR
  netProfit: number; // totalRevenue - teamPayrollPaid - totalExpenses (Cash profit in INR)
  profitMargin: number; // (netProfit / totalRevenue) * 100
  accrualProfit: number; // totalContractValue - teamPayrollCommitted - totalExpenses (Accrual in INR)
  accrualMargin: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalClientsCount: number;
  totalTeamMembersCount: number;

  // Currency breakdown for transparency
  currencyBreakdown: {
    inr: {
      contractValue: number;
      received: number;
      pending: number;
    };
    usd: {
      contractValue: number;
      received: number;
      pending: number;
      inrEquivalentReceived: number;
    };
  };
}

export class FinancialService {
  public static async getProjectFinances(projectId: Types.ObjectId | string): Promise<ProjectFinancialSummary | null> {
    const project = await Project.findById(projectId).populate('client', 'name companyName');
    if (!project) return null;

    const [payrolls, milestones, payments, expenses] = await Promise.all([
      Payroll.find({ project: project._id }),
      PayrollMilestone.find({ project: project._id }),
      ClientPayment.find({ project: project._id }),
      Expense.find({ project: project._id }),
    ]);

    const currency: Currency = project.currency || 'INR';
    const estimatedExchangeRate = project.estimatedExchangeRate || (currency === 'INR' ? 1 : 88);
    const contractValue = project.projectValue || 0;
    const estimatedInrValue =
      project.estimatedInrValue ||
      (currency === 'INR' ? contractValue : Math.round(contractValue * estimatedExchangeRate));

    // Calculate received payments
    const paidPayments = payments.filter((p) => p.status === 'paid');
    const clientReceived = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate actual INR received using stored transaction exchange rates
    const clientReceivedInr = paidPayments.reduce((sum, p) => {
      if (p.inrAmount !== undefined && p.inrAmount !== null) {
        return sum + p.inrAmount;
      }
      const rate = p.exchangeRate || (p.currency === 'USD' ? 88 : 1);
      return sum + (p.currency === 'USD' ? Math.round(p.amount * rate) : p.amount);
    }, 0);

    const clientPending = Math.max(0, contractValue - clientReceived);
    const clientPendingInr = Math.max(0, estimatedInrValue - clientReceivedInr);

    // Payroll is strictly in INR
    const teamPayrollCommitted = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
    const teamPayrollPaid = milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const teamPayrollPending = Math.max(0, teamPayrollCommitted - teamPayrollPaid);

    // Expenses are strictly in INR
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Project Profitability Calculations (INR reporting)
    const totalCost = teamPayrollCommitted + expensesTotal;
    const expectedProfit = estimatedInrValue - totalCost;
    const profitMargin = estimatedInrValue > 0 ? (expectedProfit / estimatedInrValue) * 100 : 0;

    const cashPaidOut = teamPayrollPaid + expensesTotal;
    const actualCashProfit = clientReceivedInr - cashPaidOut;
    const actualCashMargin = clientReceivedInr > 0 ? (actualCashProfit / clientReceivedInr) * 100 : 0;

    return {
      projectId: project.projectId,
      projectMongoId: project._id.toString(),
      projectName: project.name,
      currency,
      estimatedExchangeRate,
      contractValue,
      estimatedInrValue,
      clientReceived,
      clientReceivedInr,
      clientPending,
      clientPendingInr,
      teamPayrollCommitted,
      teamPayrollPaid,
      teamPayrollPending,
      expenses: expensesTotal,
      totalCost,
      expectedProfit,
      profitMargin: Number(profitMargin.toFixed(2)),
      actualCashProfit,
      actualCashMargin: Number(actualCashMargin.toFixed(2)),
      cashReceived: clientReceived,
      cashReceivedInr: clientReceivedInr,
      cashPaidOut,
      netCashPosition: actualCashProfit,
    };
  }

  public static async recalculatePayrollTotals(payrollId: Types.ObjectId | string): Promise<void> {
    const payroll = await Payroll.findById(payrollId);
    if (!payroll) return;

    const milestones = await PayrollMilestone.find({ payroll: payroll._id });
    const totalPaid = milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    const pendingAmount = Math.max(0, payroll.agreedAmount - totalPaid);

    let status: 'pending' | 'partially_paid' | 'paid' = 'pending';
    if (totalPaid >= payroll.agreedAmount && payroll.agreedAmount > 0) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partially_paid';
    }

    payroll.totalPaid = totalPaid;
    payroll.pendingAmount = pendingAmount;
    payroll.status = status;
    await payroll.save();
  }
}
