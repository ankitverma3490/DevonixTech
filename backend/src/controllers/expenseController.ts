import { Response } from 'express';
import { Expense } from '../models/Expense.js';
import { AuthRequest } from '../types/index.js';

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, category, search, startDate, endDate } = req.query;
    const filter: any = {};

    if (project && project !== 'all') {
      filter.project = project;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(String(startDate));
      if (endDate) filter.date.$lte = new Date(String(endDate));
    }

    const expenses = await Expense.find(filter)
      .populate('project', 'name projectId')
      .sort({ date: -1, createdAt: -1 });

    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    res.json({ success: true, expenses, totalAmount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch expenses' });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id).populate('project', 'name projectId');

    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }

    res.json({ success: true, expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch expense' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, name, category, amount, date, paymentMethod, description, receipt } = req.body;

    if (!name || !category || amount === undefined) {
      res.status(400).json({
        success: false,
        message: 'Expense name, category, and amount are required.',
      });
      return;
    }

    const expense = new Expense({
      project: project || undefined,
      name,
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'credit_card',
      description,
      receipt,
    });

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id).populate('project', 'name projectId');

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense: populatedExpense,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('project', 'name projectId');

    if (!updated) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }

    res.json({ success: true, message: 'Expense updated successfully', expense: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete expense' });
  }
};
