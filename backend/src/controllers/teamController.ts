import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { Task } from '../models/Task.js';
import { AuthRequest } from '../types/index.js';

export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status } = req.query;
    const filter: any = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { skills: searchRegex },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const enrichedTeam = await Promise.all(
      users.map(async (user) => {
        const payrolls = await Payroll.find({ teamMember: user._id });
        const milestones = await PayrollMilestone.find({ teamMember: user._id });
        const tasks = await Task.find({ assignedTo: user._id });

        const totalAgreedEarnings = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
        const totalPaid = milestones
          .filter((m) => m.status === 'paid')
          .reduce((sum, m) => sum + (m.amount || 0), 0);
        const pendingPayments = Math.max(0, totalAgreedEarnings - totalPaid);

        return {
          ...user.toObject(),
          projectCount: payrolls.length,
          totalAgreedEarnings,
          totalPaid,
          pendingPayments,
          assignedTasksCount: tasks.length,
          completedTasksCount: tasks.filter((t) => t.status === 'completed').length,
        };
      })
    );

    res.json({ success: true, team: enrichedTeam });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch team' });
  }
};

export const getTeamMemberById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Team member not found' });
      return;
    }

    const [payrolls, milestones, tasks] = await Promise.all([
      Payroll.find({ teamMember: user._id })
        .populate({
          path: 'project',
          select: 'name projectId status projectValue startDate expectedEndDate client',
          populate: { path: 'client', select: 'name companyName' },
        })
        .sort({ createdAt: -1 }),
      PayrollMilestone.find({ teamMember: user._id })
        .populate('project', 'name projectId')
        .sort({ dueDate: -1 }),
      Task.find({ assignedTo: user._id })
        .populate('project', 'name projectId')
        .sort({ createdAt: -1 }),
    ]);

    const totalAgreedEarnings = payrolls.reduce((sum, p) => sum + (p.agreedAmount || 0), 0);
    const totalPaid = milestones
      .filter((m) => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const pendingPayments = Math.max(0, totalAgreedEarnings - totalPaid);

    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

    res.json({
      success: true,
      teamMember: {
        ...user.toObject(),
        projects: payrolls,
        milestones,
        tasks,
        totalAgreedEarnings,
        totalPaid,
        pendingPayments,
        completedTasksCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch team member profile' });
  }
};

export const createTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, whatsapp, skills, joiningDate, status, notes, avatarUrl } =
      req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already exists.' });
      return;
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: password || 'Agency@1234',
      role: role || 'team_member',
      phone,
      whatsapp,
      skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : [],
      joiningDate: joiningDate || new Date(),
      status: status || 'active',
      notes,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    await user.save();
    res.status(201).json({ success: true, message: 'Team member created successfully', user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create team member' });
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.body.skills && typeof req.body.skills === 'string') {
      req.body.skills = req.body.skills.split(',').map((s: string) => s.trim());
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!user) {
      res.status(404).json({ success: false, message: 'Team member not found' });
      return;
    }

    res.json({ success: true, message: 'Team member updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update team member' });
  }
};

export const deleteTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Team member not found' });
      return;
    }

    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete team member' });
  }
};
