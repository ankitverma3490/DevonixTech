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
    const { startDate, endDate, currency, client } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(String(startDate));
    if (endDate) dateFilter.$lte = new Date(String(endDate));

    const paymentQuery: any = { status: 'paid' };
    if (startDate || endDate) paymentQuery.paymentDate = dateFilter;
    if (currency && currency !== 'all') paymentQuery.currency = currency;
    if (client && client !== 'all') paymentQuery.client = client;

    const [projects, clients, payments] = await Promise.all([
      Project.find().populate('client', 'name companyName'),
      Client.find(),
      ClientPayment.find(paymentQuery)
        .populate('project', 'name projectId projectValue currency estimatedExchangeRate estimatedInrValue')
        .populate('client', 'name companyName'),
    ]);

    // Total Contract Value in INR (Reporting Base)
    const totalProjectValue = projects.reduce((sum, p) => {
      if (p.estimatedInrValue) return sum + p.estimatedInrValue;
      const rate = p.estimatedExchangeRate || (p.currency === 'USD' ? 88 : 1);
      return sum + (p.currency === 'USD' ? Math.round(p.projectValue * rate) : p.projectValue);
    }, 0);

    // Total Received in INR using historical transaction rates
    const totalReceived = payments.reduce((sum, p) => {
      if (p.inrAmount !== undefined && p.inrAmount !== null) return sum + p.inrAmount;
      const rate = p.exchangeRate || (p.currency === 'USD' ? 88 : 1);
      return sum + (p.currency === 'USD' ? Math.round(p.amount * rate) : p.amount);
    }, 0);

    const totalPending = Math.max(0, totalProjectValue - totalReceived);

    // Breakdown by Original Currency
    const inrPayments = payments.filter((p) => p.currency === 'INR');
    const usdPayments = payments.filter((p) => p.currency === 'USD');

    const inrReceived = inrPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const usdReceived = usdPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const usdReceivedInr = usdPayments.reduce((sum, p) => {
      if (p.inrAmount !== undefined && p.inrAmount !== null) return sum + p.inrAmount;
      return sum + Math.round((p.amount || 0) * (p.exchangeRate || 88));
    }, 0);

    // Client Breakdown (with INR conversion for multi-currency contracts)
    const clientBreakdown = await Promise.all(
      clients.map(async (clientDoc) => {
        const clientProjects = projects.filter(
          (p) => (p.client as any)?._id?.toString() === clientDoc._id.toString()
        );
        const clientPayments = payments.filter(
          (p) => (p.client as any)?._id?.toString() === clientDoc._id.toString()
        );

        const projectValInr = clientProjects.reduce((sum, p) => {
          if (p.estimatedInrValue) return sum + p.estimatedInrValue;
          const rate = p.estimatedExchangeRate || (p.currency === 'USD' ? 88 : 1);
          return sum + (p.currency === 'USD' ? Math.round(p.projectValue * rate) : p.projectValue);
        }, 0);

        const receivedInr = clientPayments.reduce((sum, p) => {
          if (p.inrAmount !== undefined && p.inrAmount !== null) return sum + p.inrAmount;
          const rate = p.exchangeRate || (p.currency === 'USD' ? 88 : 1);
          return sum + (p.currency === 'USD' ? Math.round(p.amount * rate) : p.amount);
        }, 0);

        const pendingInr = Math.max(0, projectValInr - receivedInr);

        return {
          clientId: clientDoc._id,
          clientName: clientDoc.name,
          companyName: clientDoc.companyName,
          projectCount: clientProjects.length,
          projectValue: projectValInr,
          received: receivedInr,
          pending: pendingInr,
        };
      })
    );

    res.json({
      success: true,
      currency: 'INR',
      summary: {
        totalProjectValue,
        totalReceived,
        totalPending,
        inrReceived,
        usdReceived,
        usdReceivedInr,
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
    const { startDate, endDate, teamMember, project } = req.query;

    const payrollFilter: any = {};
    if (teamMember && teamMember !== 'all') payrollFilter.teamMember = teamMember;
    if (project && project !== 'all') payrollFilter.project = project;

    const milestoneQuery: any = { status: 'paid' };
    if (teamMember && teamMember !== 'all') milestoneQuery.teamMember = teamMember;
    if (project && project !== 'all') milestoneQuery.project = project;

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(String(startDate));
      if (endDate) dateFilter.$lte = new Date(String(endDate));
      milestoneQuery.paidDate = dateFilter;
    }

    const [payrolls, milestones, teamMembers] = await Promise.all([
      Payroll.find(payrollFilter).populate('project', 'name projectId').populate('teamMember', 'name email role'),
      PayrollMilestone.find(milestoneQuery).populate('project', 'name projectId').populate('teamMember', 'name email role'),
      User.find({ role: { $in: ['team_member', 'project_manager'] } }),
    ]);

    const totalAgreedCost = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
    const totalPaid = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalPending = Math.max(0, totalAgreedCost - totalPaid);

    // Member Breakdown (All in INR)
    const memberBreakdown = teamMembers.map((member) => {
      const memberPayrolls = payrolls.filter(
        (p) => (p.teamMember as any)?._id?.toString() === member._id.toString()
      );
      const memberMilestones = milestones.filter(
        (m) => (m.teamMember as any)?._id?.toString() === member._id.toString()
      );

      const agreed = memberPayrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
      const paid = memberMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);
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
      currency: 'INR',
      summary: {
        totalAgreedCost,
        totalPaid,
        totalPending,
      },
      memberBreakdown: memberBreakdown.filter((m) => m.projectCount > 0 || m.paid > 0),
      recentPayouts: milestones.slice(0, 15),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payroll report' });
  }
};

export const getProfitReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const paymentQuery: any = { status: 'paid' };
    const milestoneQuery: any = { status: 'paid' };
    const expenseQuery: any = {};

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(String(startDate));
      if (endDate) dateFilter.$lte = new Date(String(endDate));

      paymentQuery.paymentDate = dateFilter;
      milestoneQuery.paidDate = dateFilter;
      expenseQuery.date = dateFilter;
    }

    const [projects, payments, milestones, expenses] = await Promise.all([
      Project.find().populate('client', 'name companyName'),
      ClientPayment.find(paymentQuery),
      PayrollMilestone.find(milestoneQuery),
      Expense.find(expenseQuery),
    ]);

    // Total Estimated Project Value in INR
    const totalContractRevenue = projects.reduce((sum, p) => {
      if (p.estimatedInrValue) return sum + p.estimatedInrValue;
      const rate = p.estimatedExchangeRate || (p.currency === 'USD' ? 88 : 1);
      return sum + (p.currency === 'USD' ? Math.round(p.projectValue * rate) : p.projectValue);
    }, 0);

    // Cash Revenue in INR from actual payments with stored exchange rates
    const cashRevenue = payments.reduce((sum, p) => {
      if (p.inrAmount !== undefined && p.inrAmount !== null) return sum + p.inrAmount;
      const rate = p.exchangeRate || (p.currency === 'USD' ? 88 : 1);
      return sum + (p.currency === 'USD' ? Math.round(p.amount * rate) : p.amount);
    }, 0);

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
      currency: 'INR',
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
