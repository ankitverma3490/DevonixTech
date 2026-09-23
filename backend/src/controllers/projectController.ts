import { Response } from 'express';
import { Project } from '../models/Project.js';
import { Payroll } from '../models/Payroll.js';
import { PayrollMilestone } from '../models/PayrollMilestone.js';
import { Task } from '../models/Task.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { Expense } from '../models/Expense.js';
import { FinancialService } from '../services/financialService.js';
import { AuthRequest } from '../types/index.js';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, client, projectManager, priority } = req.query;
    const filter: any = {};

    // Role-based visibility
    if (req.user?.role === 'project_manager') {
      filter.projectManager = req.user.userId;
    } else if (req.user?.role === 'team_member') {
      const memberPayrolls = await Payroll.find({ teamMember: req.user.userId }).select('project');
      const projectIds = memberPayrolls.map((p) => p.project);
      filter._id = { $in: projectIds };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (client && client !== 'all') {
      filter.client = client;
    }
    if (projectManager && projectManager !== 'all') {
      filter.projectManager = projectManager;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { projectId: searchRegex },
        { description: searchRegex },
        { technologies: searchRegex },
      ];
    }

    const projects = await Project.find(filter)
      .populate('client', 'name companyName email country')
      .populate('projectManager', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    // Enrich with financial metrics & task completion progress
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const finances = await FinancialService.getProjectFinances(project._id);
        const tasks = await Task.find({ project: project._id });
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        return {
          ...project.toObject(),
          finances,
          taskCount: tasks.length,
          completedTaskCount: completedTasks,
          taskProgress,
        };
      })
    );

    res.json({ success: true, projects: enrichedProjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('client')
      .populate('projectManager', 'name email phone avatarUrl role skills');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Authorization check for Team Member
    if (req.user?.role === 'team_member') {
      const isAssigned = await Payroll.exists({ project: project._id, teamMember: req.user.userId });
      if (!isAssigned) {
        res.status(403).json({ success: false, message: 'Access denied. You are not assigned to this project.' });
        return;
      }
    }

    const [tasks, payrolls, milestones, payments, expenses, finances] = await Promise.all([
      Task.find({ project: project._id })
        .populate('assignedTo', 'name email avatarUrl role')
        .sort({ createdAt: -1 }),
      Payroll.find({ project: project._id })
        .populate('teamMember', 'name email avatarUrl role skills phone')
        .sort({ createdAt: -1 }),
      PayrollMilestone.find({ project: project._id })
        .populate('teamMember', 'name email avatarUrl')
        .sort({ dueDate: 1 }),
      ClientPayment.find({ project: project._id })
        .populate('client', 'name companyName')
        .sort({ paymentDate: -1, dueDate: 1 }),
      Expense.find({ project: project._id }).sort({ date: -1 }),
      FinancialService.getProjectFinances(project._id),
    ]);

    // Attach task count per team member
    const teamWithTasks = payrolls.map((payroll) => {
      const memberObj = payroll.toObject();
      const memberId = (payroll.teamMember as any)?._id?.toString();
      const memberTasks = tasks.filter((t) => (t.assignedTo as any)?._id?.toString() === memberId);
      return {
        ...memberObj,
        assignedTasksCount: memberTasks.length,
        completedTasksCount: memberTasks.filter((t) => t.status === 'completed').length,
      };
    });

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        progress,
        tasks,
        team: teamWithTasks,
        milestones,
        payments,
        expenses,
        finances,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch project workspace' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      projectId,
      client,
      description,
      projectType,
      startDate,
      expectedEndDate,
      actualEndDate,
      status,
      priority,
      projectValue,
      projectManager,
      technologies,
      notes,
    } = req.body;

    if (!name || !projectId || !client || !startDate || !expectedEndDate || projectValue === undefined || !projectManager) {
      res.status(400).json({
        success: false,
        message: 'Name, project ID, client, start date, expected end date, project value, and project manager are required.',
      });
      return;
    }

    const existingProject = await Project.findOne({ projectId: projectId.toUpperCase().trim() });
    if (existingProject) {
      res.status(400).json({ success: false, message: `Project ID '${projectId}' already exists.` });
      return;
    }

    const project = new Project({
      name,
      projectId: projectId.toUpperCase().trim(),
      client,
      description,
      projectType: projectType || 'Web Application',
      startDate,
      expectedEndDate,
      actualEndDate,
      status: status || 'planning',
      priority: priority || 'medium',
      projectValue: Number(projectValue),
      projectManager,
      technologies: Array.isArray(technologies) ? technologies : typeof technologies === 'string' ? technologies.split(',').map((s: string) => s.trim()) : [],
      notes,
    });

    await project.save();
    res.status(201).json({ success: true, message: 'Project created successfully', project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.body.technologies && typeof req.body.technologies === 'string') {
      req.body.technologies = req.body.technologies.split(',').map((s: string) => s.trim());
    }

    const project = await Project.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, message: 'Project updated successfully', project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Cascade delete linked entities
    await Promise.all([
      Task.deleteMany({ project: id }),
      Payroll.deleteMany({ project: id }),
      PayrollMilestone.deleteMany({ project: id }),
      ClientPayment.deleteMany({ project: id }),
      Expense.deleteMany({ project: id }),
    ]);

    res.json({ success: true, message: 'Project and all associated records deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete project' });
  }
};
