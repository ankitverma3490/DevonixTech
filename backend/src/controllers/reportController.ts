import { Response } from 'express';
import { Project } from '../models/Project.js';
import { Client } from '../models/Client.js';
import { User } from '../models/User.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Expense } from '../models/Expense.js';
import { FinancialService } from '../services/financialService.js';
import { AuthRequest } from '../types/index.js';

export const getRevenueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(String(startDate));
    if (endDate) dateFilter.$lte = new Date(String(endDate));

    const paymentQuery: any = { status: 'paid' };
    if (startDate || endDate) paymentQuery.paymentDate = dateFilter;

    const [projects, clients, payments] = await Promise.all([
      Project.find().populate('client', 'name companyName'),
      Client.find(),
      ClientPayment.find(paymentQuery).populate('project', 'name projectId projectValue').populate('client', 'name companyName'),
    ]);

    const totalProjectValue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = Math.max(0, totalProjectValue - totalReceived);

    // Client Breakdown
    const clientBreakdown = await Promise.all(
      clients.map(async (client) => {
        const clientProjects = projects.filter(
          (p) => (p.client as any)?._id?.toString() === client._id.toString()
        );
        const clientPayments = payments.filter(
          (p) => (p.client as any)?._id?.toString() === client._id.toString()
        );

        const projectVal = clientProjects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
        const received = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pending = Math.max(0, projectVal - received);

        return {
          clientId: client._id,
          clientName: client.name,
          companyName: client.companyName,
          projectCount: clientProjects.length,
          projectValue: projectVal,
          received,
          pending,
        };
      })
    );

    res.json({
      success: true,
      summary: {
        totalProjectValue,
        totalReceived,
        totalPending,
      },
      clientBreakdown: clientBreakdown.filter((c) => c.projectCount > 0 || c.received > 0),
      recentPayments: payments.slice(0, 15),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch revenue report' });
  }
};

export const getPayrollReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const [payrolls, milestones, teamMembers] = await Promise.all([
      Payroll.find().populate('project', 'name projectId').populate('teamMember', 'name email role'),
      PayrollMilestone.find().populate('project', 'name projectId').populate('teamMember', 'name email role'),
      User.find({ role: { $in: ['team_member', 'project_manager'] } }),
    ]);

    const totalAgreedCost = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
    const totalPaid = milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalPending = Math.max(0, totalAgreedCost - totalPaid);

    // Member Breakdown
    const memberBreakdown = teamMembers.map((member) => {
      const memberPayrolls = payrolls.filter(
        (p) => (p.teamMember as any)?._id?.toString() === member._id.toString()
      );
      const memberMilestones = milestones.filter(
        (m) => (m.teamMember as any)?._id?.toString() === member._id.toString()
      );

      const agreed = memberPayrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
      const paid = memberMilestones
        .filter((m) => m.status === 'paid')
        .reduce((sum, m) => sum + (m.amount || 0), 0);
      const pending = Math.max(0, agreed - paid);

      return {
        memberId: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        projectCount: memberPayrolls.length,
        agreed,
        paid,
        pending,
      };
    });

    res.json({
      success: true,
      summary: {
        totalAgreedCost,
        totalPaid,
        totalPending,
      },
      memberBreakdown: memberBreakdown.filter((m) => m.projectCount > 0 || m.paid > 0),
      recentPayouts: milestones.filter((m) => m.status === 'paid').slice(0, 15),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payroll report' });
  }
};

export const getProfitReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [projects, payments, milestones, expenses] = await Promise.all([
      Project.find().populate('client', 'name companyName'),
      ClientPayment.find({ status: 'paid' }),
      PayrollMilestone.find({ status: 'paid' }),
      Expense.find(),
    ]);

    const totalContractRevenue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    const cashRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const payrollPaid = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const cashProfit = cashRevenue - payrollPaid - totalExpenses;
    const cashMargin = cashRevenue > 0 ? (cashProfit / cashRevenue) * 100 : 0;

    // Project-level financial profitability breakdown
    const projectFinances = await Promise.all(
      projects.map(async (project) => {
        const finances = await FinancialService.getProjectFinances(project._id);
        return {
          ...finances,
          clientName: (project.client as any)?.name || 'N/A',
          companyName: (project.client as any)?.companyName || 'N/A',
          status: project.status,
        };
      })
    );

    res.json({
      success: true,
      summary: {
        totalContractRevenue,
        cashRevenue,
        payrollPaid,
        totalExpenses,
        cashProfit,
        cashMargin: Number(cashMargin.toFixed(2)),
      },
      projects: projectFinances,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch profit report' });
  }
};
