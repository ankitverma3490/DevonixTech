import { Response } from 'express';
import { Client } from '../models/Client.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Expense } from '../models/Expense.js';
import { Task } from '../models/Task.js';
import { FinancialService } from '../services/financialService.js';
import { AuthRequest } from '../types/index.js';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    // Team Member Dashboard
    if (userRole === 'team_member') {
      const payrolls = await Payroll.find({ teamMember: userId }).populate('project', 'name projectId status projectValue');
      const milestones = await PayrollMilestone.find({ teamMember: userId }).sort({ dueDate: 1 });
      const tasks = await Task.find({ assignedTo: userId }).populate('project', 'name projectId');

      const totalAgreed = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
      const totalPaid = milestones
        .filter((m) => m.status === 'paid')
        .reduce((sum, m) => sum + (m.amount || 0), 0);
      const totalPending = Math.max(0, totalAgreed - totalPaid);

      const activeProjectsCount = payrolls.filter(
        (p) => (p.project as any)?.status === 'active' || (p.project as any)?.status === 'planning'
      ).length;

      const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
      const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

      res.json({
        success: true,
        role: 'team_member',
        summary: {
          totalAgreed,
          totalPaid,
          totalPending,
          assignedProjectsCount: payrolls.length,
          activeProjectsCount,
          totalTasksCount: tasks.length,
          completedTasksCount,
          pendingTasksCount,
        },
        payrolls,
        upcomingMilestones: milestones.filter((m) => m.status !== 'paid').slice(0, 5),
        recentTasks: tasks.slice(0, 6),
      });
      return;
    }

    // Project Manager Dashboard
    if (userRole === 'project_manager') {
      const projects = await Project.find({ projectManager: userId }).populate('client', 'name companyName');
      const projectIds = projects.map((p) => p._id);

      const [tasks, payrolls, milestones, payments, expenses] = await Promise.all([
        Task.find({ project: { $in: projectIds } }),
        Payroll.find({ project: { $in: projectIds } }).populate('teamMember', 'name email avatarUrl role'),
        PayrollMilestone.find({ project: { $in: projectIds } }),
        ClientPayment.find({ project: { $in: projectIds } }),
        Expense.find({ project: { $in: projectIds } }),
      ]);

      const totalProjectValue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
      const totalReceived = payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPendingInvoices = Math.max(0, totalProjectValue - totalReceived);

      const teamPayrollCommitted = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
      const teamPayrollPaid = milestones
        .filter((m) => m.status === 'paid')
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalProjectValue - teamPayrollCommitted - totalExpenses;
      const profitMargin = totalProjectValue > 0 ? (netProfit / totalProjectValue) * 100 : 0;

      const completedTasks = tasks.filter((t) => t.status === 'completed').length;

      const recentProjectsWithProgress = await Promise.all(
        projects.slice(0, 5).map(async (project) => {
          const pTasks = tasks.filter((t) => t.project.toString() === project._id.toString());
          const cTasks = pTasks.filter((t) => t.status === 'completed').length;
          const progress = pTasks.length > 0 ? Math.round((cTasks / pTasks.length) * 100) : 0;
          const pFinances = await FinancialService.getProjectFinances(project._id);

          return {
            ...project.toObject(),
            progress,
            finances: pFinances,
          };
        })
      );

      res.json({
        success: true,
        role: 'project_manager',
        summary: {
          managedProjectsCount: projects.length,
          activeProjectsCount: projects.filter((p) => p.status === 'active').length,
          totalProjectValue,
          totalReceived,
          totalPendingInvoices,
          teamPayrollCommitted,
          teamPayrollPaid,
          totalExpenses,
          netProfit,
          profitMargin: Number(profitMargin.toFixed(2)),
          totalTasksCount: tasks.length,
          completedTasksCount: completedTasks,
        },
        recentProjects: recentProjectsWithProgress,
      });
      return;
    }

    // Admin Dashboard (Agency Wide)
    const [clientsCount, projects, teamCount, payments, payrolls, milestones, expenses] =
      await Promise.all([
        Client.countDocuments(),
        Project.find().populate('client', 'name companyName').populate('projectManager', 'name avatarUrl'),
        User.countDocuments({ role: { $in: ['team_member', 'project_manager'] } }),
        ClientPayment.find(),
        Payroll.find(),
        PayrollMilestone.find(),
        Expense.find(),
      ]);

    const totalContractValue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0);

    // Revenue = Client Payments Received
    const totalRevenue = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalClientPending = Math.max(0, totalContractValue - totalRevenue);

    // Team Payroll (Committed and Paid)
    const teamPayrollCommitted = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
    const teamPayrollPaid = milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const teamPayrollPending = Math.max(0, teamPayrollCommitted - teamPayrollPaid);

    // Expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Accrual Financials (Contract Value - Committed Payroll - Expenses)
    const accrualProfit = totalContractValue - teamPayrollCommitted - totalExpenses;
    const accrualMargin = totalContractValue > 0 ? (accrualProfit / totalContractValue) * 100 : 0;

    // Cash Financials (Cash In - Cash Out)
    const netProfit = totalRevenue - teamPayrollPaid - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const activeProjects = projects.filter((p) => p.status === 'active');
    const completedProjects = projects.filter((p) => p.status === 'completed');

    // Recent projects with progress and profit
    const recentProjects = await Promise.all(
      projects.slice(0, 5).map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        const finances = await FinancialService.getProjectFinances(project._id);

        return {
          ...project.toObject(),
          progress,
          finances,
        };
      })
    );

    res.json({
      success: true,
      role: 'admin',
      cards: {
        totalClients: clientsCount,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        teamMembers: teamCount,
        totalRevenue,
        totalContractValue,
        totalClientPending,
        teamPayroll: teamPayrollPaid,
        teamPayrollCommitted,
        teamPayrollPending,
        expenses: totalExpenses,
        netProfit,
        profitMargin: Number(profitMargin.toFixed(1)),
        accrualProfit,
        accrualMargin: Number(accrualMargin.toFixed(1)),
      },
      recentProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard' });
  }
};

export const getRevenueChart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await ClientPayment.find({ status: 'paid' }).sort({ paymentDate: 1 });
    const expenses = await Expense.find().sort({ date: 1 });
    const milestones = await PayrollMilestone.find({ status: 'paid' }).sort({ paidDate: 1 });

    // Group by month YYYY-MM
    const monthsMap: { [key: string]: { month: string; revenue: number; expenses: number; payroll: number; profit: number } } = {};

    const months = ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04'];
    months.forEach((m) => {
      monthsMap[m] = { month: m, revenue: 0, expenses: 0, payroll: 0, profit: 0 };
    });

    payments.forEach((p) => {
      if (p.paymentDate) {
        const m = p.paymentDate.toISOString().slice(0, 7);
        if (!monthsMap[m]) monthsMap[m] = { month: m, revenue: 0, expenses: 0, payroll: 0, profit: 0 };
        monthsMap[m].revenue += p.amount;
      }
    });

    expenses.forEach((e) => {
      if (e.date) {
        const m = e.date.toISOString().slice(0, 7);
        if (!monthsMap[m]) monthsMap[m] = { month: m, revenue: 0, expenses: 0, payroll: 0, profit: 0 };
        monthsMap[m].expenses += e.amount;
      }
    });

    milestones.forEach((m) => {
      if (m.paidDate) {
        const key = m.paidDate.toISOString().slice(0, 7);
        if (!monthsMap[key]) monthsMap[key] = { month: key, revenue: 0, expenses: 0, payroll: 0, profit: 0 };
        monthsMap[key].payroll += m.amount;
      }
    });

    const chartData = Object.values(monthsMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        profit: item.revenue - item.payroll - item.expenses,
      }));

    res.json({ success: true, chartData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch revenue chart' });
  }
};

export const getProjectProfitabilityChart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().select('name projectId projectValue');

    const projectProfits = await Promise.all(
      projects.map(async (project) => {
        const finances = await FinancialService.getProjectFinances(project._id);
        return {
          name: project.name,
          projectId: project.projectId,
          contractValue: finances?.contractValue || 0,
          revenue: finances?.clientReceived || 0,
          teamPayroll: finances?.teamPayrollCommitted || 0,
          expenses: finances?.expenses || 0,
          profit: finances?.expectedProfit || 0,
          margin: finances?.profitMargin || 0,
        };
      })
    );

    res.json({ success: true, projectProfits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch profitability chart' });
  }
};
