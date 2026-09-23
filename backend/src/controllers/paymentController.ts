import { Response } from 'express';
import { ClientPayment } from '../models/ClientPayment.js';
import { Project } from '../models/Project.js';
import { AuthRequest } from '../types/index.js';

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, client, status } = req.query;
    const filter: any = {};

    if (project && project !== 'all') {
      filter.project = project;
    }
    if (client && client !== 'all') {
      filter.client = client;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    const payments = await ClientPayment.find(filter)
      .populate('project', 'name projectId projectValue status')
      .populate('client', 'name companyName email country')
      .sort({ paymentDate: -1, createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch client payments' });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await ClientPayment.findById(id)
      .populate('project', 'name projectId projectValue status')
      .populate('client', 'name companyName email country');

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment' });
  }
};

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, client, amount, paymentDate, dueDate, paymentMethod, transactionId, status, notes } =
      req.body;

    if (!project || amount === undefined || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Project, amount, and due date are required.',
      });
      return;
    }

    let clientId = client;
    if (!clientId) {
      const projectDoc = await Project.findById(project);
      if (projectDoc) {
        clientId = projectDoc.client;
      }
    }

    const isPaid = status === 'paid';

    const payment = new ClientPayment({
      project,
      client: clientId,
      amount: Number(amount),
      paymentDate: isPaid ? (paymentDate ? new Date(paymentDate) : new Date()) : undefined,
      dueDate: new Date(dueDate),
      paymentMethod: paymentMethod || 'bank_transfer',
      transactionId,
      status: status || 'pending',
      notes,
    });

    await payment.save();

    const populatedPayment = await ClientPayment.findById(payment._id)
      .populate('project', 'name projectId projectValue status')
      .populate('client', 'name companyName email country');

    res.status(201).json({
      success: true,
      message: 'Client payment recorded successfully',
      payment: populatedPayment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment' });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await ClientPayment.findById(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    if (req.body.status === 'paid' && payment.status !== 'paid' && !req.body.paymentDate) {
      req.body.paymentDate = new Date();
    } else if (req.body.status === 'pending' || req.body.status === 'overdue') {
      req.body.paymentDate = null;
    }

    const updated = await ClientPayment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name projectId projectValue status')
      .populate('client', 'name companyName email country');

    res.json({ success: true, message: 'Payment updated successfully', payment: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update payment' });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await ClientPayment.findByIdAndDelete(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    res.json({ success: true, message: 'Payment record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete payment' });
  }
};
