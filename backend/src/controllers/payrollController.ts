import { Response } from 'express';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { FinancialService } from '../services/financialService.js';
import { AuthRequest } from '../types/index.js';

export const getPayrolls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, teamMember, status } = req.query;
    const filter: any = {};

    if (project && project !== 'all') {
      filter.project = project;
    }
    if (teamMember && teamMember !== 'all') {
      filter.teamMember = teamMember;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Role filtering: team members only see their own payroll
    if (req.user?.role === 'team_member') {
      filter.teamMember = req.user.userId;
    }

    const payrolls = await Payroll.find(filter)
      .populate('project', 'name projectId status projectValue')
      .populate('teamMember', 'name email avatarUrl role skills phone')
      .sort({ createdAt: -1 });

    // Aggregate milestones for each payroll
    const enrichedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        const milestones = await PayrollMilestone.find({ payroll: payroll._id }).sort({ dueDate: 1 });
        return {
          ...payroll.toObject(),
          milestones,
        };
      })
    );

    res.json({ success: true, payrolls: enrichedPayrolls });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payroll records' });
  }
};

export const getPayrollById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id)
      .populate('project', 'name projectId status projectValue')
      .populate('teamMember', 'name email avatarUrl role skills');

    if (!payroll) {
      res.status(404).json({ success: false, message: 'Payroll record not found' });
      return;
    }

    if (
      req.user?.role === 'team_member' &&
      (payroll.teamMember as any)?._id?.toString() !== req.user.userId
    ) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const milestones = await PayrollMilestone.find({ payroll: payroll._id }).sort({ dueDate: 1 });

    res.json({
      success: true,
      payroll: {
        ...payroll.toObject(),
        milestones,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payroll record' });
  }
};

export const createPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, teamMember, role, agreedAmount, paymentType } = req.body;

    if (!project || !teamMember || !role || agreedAmount === undefined) {
      res.status(400).json({
        success: false,
        message: 'Project, team member, role, and agreed amount are required.',
      });
      return;
    }

    const existing = await Payroll.findOne({ project, teamMember });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'This team member is already assigned to this project.',
      });
      return;
    }

    const payroll = new Payroll({
      project,
      teamMember,
      role,
      agreedAmount: Number(agreedAmount),
      paymentType: paymentType || 'fixed',
      totalPaid: 0,
      pendingAmount: Number(agreedAmount),
      status: 'pending',
    });

    await payroll.save();

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('project', 'name projectId status projectValue')
      .populate('teamMember', 'name email avatarUrl role skills');

    res.status(201).json({
      success: true,
      message: 'Team member assigned and payroll configured successfully',
      payroll: populatedPayroll,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create payroll' });
  }
};

export const updatePayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, agreedAmount, paymentType } = req.body;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      res.status(404).json({ success: false, message: 'Payroll record not found' });
      return;
    }

    if (role) payroll.role = role;
    if (paymentType) payroll.paymentType = paymentType;
    if (agreedAmount !== undefined) {
      payroll.agreedAmount = Number(agreedAmount);
    }

    await payroll.save();
    await FinancialService.recalculatePayrollTotals(payroll._id);

    const updated = await Payroll.findById(payroll._id)
      .populate('project', 'name projectId status projectValue')
      .populate('teamMember', 'name email avatarUrl role skills');

    res.json({ success: true, message: 'Payroll updated successfully', payroll: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update payroll' });
  }
};

export const deletePayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findByIdAndDelete(id);

    if (!payroll) {
      res.status(404).json({ success: false, message: 'Payroll record not found' });
      return;
    }

    await PayrollMilestone.deleteMany({ payroll: id });
    res.json({ success: true, message: 'Project assignment and payroll records removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete payroll' });
  }
};

export const addMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { payrollId } = req.params;
    const { title, amount, dueDate, status, paymentMethod, transactionId, notes } = req.body;

    const payroll = await Payroll.findById(payrollId);
    if (!payroll) {
      res.status(404).json({ success: false, message: 'Payroll record not found' });
      return;
    }

    if (!title || amount === undefined || !dueDate) {
      res.status(400).json({ success: false, message: 'Title, amount, and due date are required.' });
      return;
    }

    const isPaid = status === 'paid';

    const milestone = new PayrollMilestone({
      payroll: payroll._id,
      project: payroll.project,
      teamMember: payroll.teamMember,
      title,
      amount: Number(amount),
      dueDate,
      paidDate: isPaid ? (req.body.paidDate ? new Date(req.body.paidDate) : new Date()) : undefined,
      status: status || 'pending',
      paymentMethod: paymentMethod || 'bank_transfer',
      transactionId,
      notes,
    });

    await milestone.save();
    await FinancialService.recalculatePayrollTotals(payroll._id);

    res.status(201).json({
      success: true,
      message: 'Milestone added successfully',
      milestone,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add milestone' });
  }
};

export const updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const milestone = await PayrollMilestone.findById(id);

    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found' });
      return;
    }

    if (req.body.status === 'paid' && milestone.status !== 'paid' && !req.body.paidDate) {
      req.body.paidDate = new Date();
    } else if (req.body.status === 'pending' || req.body.status === 'overdue') {
      req.body.paidDate = null;
    }

    const updated = await PayrollMilestone.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await FinancialService.recalculatePayrollTotals(updated.payroll as any);
    }

    res.json({ success: true, message: 'Milestone updated successfully', milestone: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update milestone' });
  }
};

export const deleteMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const milestone = await PayrollMilestone.findByIdAndDelete(id);

    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found' });
      return;
    }

    await FinancialService.recalculatePayrollTotals(milestone.payroll as any);
    res.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete milestone' });
  }
};
