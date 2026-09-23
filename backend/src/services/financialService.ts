import { Types } from 'mongoose';
import { Project } from '../models/Project.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Expense } from '../models/Expense.js';

export interface ProjectFinancialSummary {
  projectId: string;
  projectMongoId: string;
  projectName: string;
  contractValue: number;
  clientReceived: number;
  clientPending: number;
  teamPayrollCommitted: number;
  teamPayrollPaid: number;
  teamPayrollPending: number;
  expenses: number;
  totalCost: number;
  expectedProfit: number;
  profitMargin: number; // percentage
  cashReceived: number;
  cashPaidOut: number;
  netCashPosition: number;
}

export interface AgencyFinancialSummary {
  totalRevenue: number; // Client payments received
  totalContractValue: number; // Sum of all project values
  totalClientPending: number;
  teamPayrollCommitted: number;
  teamPayrollPaid: number;
  teamPayrollPending: number;
  totalExpenses: number;
  netProfit: number; // totalRevenue - teamPayrollPaid - totalExpenses (Cash) OR totalContractValue - teamPayrollCommitted - totalExpenses (Accrual)
  accrualProfit: number;
  accrualMargin: number;
  cashProfit: number;
  cashMargin: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalClientsCount: number;
  totalTeamMembersCount: number;
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

    const contractValue = project.projectValue || 0;

    const clientReceived = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const clientPending = Math.max(0, contractValue - clientReceived);

    const teamPayrollCommitted = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);

    const teamPayrollPaid = milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    const teamPayrollPending = Math.max(0, teamPayrollCommitted - teamPayrollPaid);

    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalCost = teamPayrollCommitted + expensesTotal;
    const expectedProfit = contractValue - totalCost;
    const profitMargin = contractValue > 0 ? (expectedProfit / contractValue) * 100 : 0;

    const cashReceived = clientReceived;
    const cashPaidOut = teamPayrollPaid + expensesTotal;
    const netCashPosition = cashReceived - cashPaidOut;

    return {
      projectId: project.projectId,
      projectMongoId: project._id.toString(),
      projectName: project.name,
      contractValue,
      clientReceived,
      clientPending,
      teamPayrollCommitted,
      teamPayrollPaid,
      teamPayrollPending,
      expenses: expensesTotal,
      totalCost,
      expectedProfit,
      profitMargin: Number(profitMargin.toFixed(2)),
      cashReceived,
      cashPaidOut,
      netCashPosition,
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
