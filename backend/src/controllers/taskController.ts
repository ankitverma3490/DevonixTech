import { Response } from 'express';
import { Task } from '../models/Task.js';
import { Payroll } from '../models/Payroll.js';
import { AuthRequest } from '../types/index.js';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, status, assignedTo, priority } = req.query;
    const filter: any = {};

    if (project) {
      filter.project = project;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (assignedTo && assignedTo !== 'all') {
      filter.assignedTo = assignedTo;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // If team member, only show their tasks or tasks for their projects
    if (req.user?.role === 'team_member') {
      const memberPayrolls = await Payroll.find({ teamMember: req.user.userId }).select('project');
      const projectIds = memberPayrolls.map((p) => p.project);
      filter.project = { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name projectId status')
      .populate('assignedTo', 'name email avatarUrl role')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch tasks' });
  }
};

export const getTasksByProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email avatarUrl role')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch tasks for project' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, title, description, assignedTo, priority, status, dueDate } = req.body;
    const projectId = req.params.projectId || project;

    if (!projectId || !title) {
      res.status(400).json({ success: false, message: 'Project and task title are required.' });
      return;
    }

    const task = new Task({
      project: projectId,
      title,
      description,
      assignedTo: assignedTo || undefined,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || undefined,
    });

    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name projectId')
      .populate('assignedTo', 'name email avatarUrl role');

    res.status(201).json({ success: true, message: 'Task created successfully', task: populatedTask });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('project', 'name projectId')
      .populate('assignedTo', 'name email avatarUrl role');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Task updated successfully', task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete task' });
  }
};
