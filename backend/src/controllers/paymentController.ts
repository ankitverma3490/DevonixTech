import { Response } from 'express';
import { ClientPayment } from '../models/ClientPayment.js';
import { Project } from '../models/Project.js';
import { AuthRequest, Currency } from '../types/index.js';

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project, client, status, currency } = req.query;
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
    if (currency && currency !== 'all') {
      filter.currency = currency;
    }

    const payments = await ClientPayment.find(filter)
      .populate('project', 'name projectId projectValue status currency estimatedExchangeRate estimatedInrValue')
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
      .populate('project', 'name projectId projectValue status currency estimatedExchangeRate estimatedInrValue')
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
    const {
      project,
      client,
      currency,
      amount,
      exchangeRate,
      paymentDate,
      dueDate,
      paymentMethod,
      transactionId,
      status,
      notes,
    } = req.body;

    if (!project || amount === undefined || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Project, amount, and due date are required.',
      });
      return;
    }

    let clientId = client;
    let projectCurrency: Currency = 'INR';
    let projectEstimatedRate = 88;

    const projectDoc = await Project.findById(project);
    if (projectDoc) {
      if (!clientId) {
        clientId = projectDoc.client;
      }
      projectCurrency = projectDoc.currency || 'INR';
      projectEstimatedRate = projectDoc.estimatedExchangeRate || 88;
    }

    const paymentCurrency: Currency = currency || projectCurrency || 'INR';
    const rate = paymentCurrency === 'INR' ? 1 : Number(exchangeRate) || projectEstimatedRate || 88;
    const amt = Number(amount);
    const inrAmt = paymentCurrency === 'INR' ? amt : Math.round(amt * rate * 100) / 100;

    const isPaid = status === 'paid';

    const payment = new ClientPayment({
      project,
      client: clientId,
      currency: paymentCurrency,
      amount: amt,
      exchangeRate: rate,
      inrAmount: inrAmt,
      requiresExchangeRateUpdate: false,
      paymentDate: isPaid ? (paymentDate ? new Date(paymentDate) : new Date()) : undefined,
      dueDate: new Date(dueDate),
      paymentMethod: paymentMethod || 'bank_transfer',
      transactionId,
      status: status || 'pending',
      notes,
    });

    await payment.save();

    const populatedPayment = await ClientPayment.findById(payment._id)
      .populate('project', 'name projectId projectValue status currency estimatedExchangeRate estimatedInrValue')
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

    // Handle currency, amount and exchange rate
    if (req.body.currency !== undefined) {
      payment.currency = req.body.currency === 'USD' ? 'USD' : 'INR';
    }
    if (req.body.amount !== undefined) {
      payment.amount = Number(req.body.amount);
    }
    if (req.body.exchangeRate !== undefined) {
      payment.exchangeRate = payment.currency === 'INR' ? 1 : Number(req.body.exchangeRate) || 88;
    } else if (payment.currency === 'INR') {
      payment.exchangeRate = 1;
    }

    payment.inrAmount =
      payment.currency === 'INR'
        ? payment.amount
        : Math.round(payment.amount * (payment.exchangeRate || 88) * 100) / 100;

    payment.requiresExchangeRateUpdate = false;

    if (req.body.status !== undefined) {
      payment.status = req.body.status;
      if (req.body.status === 'paid' && !payment.paymentDate) {
        payment.paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
      } else if (req.body.status === 'pending' || req.body.status === 'overdue') {
        payment.paymentDate = undefined;
      }
    }

    if (req.body.paymentDate !== undefined && req.body.status === 'paid') {
      payment.paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
    }
    if (req.body.dueDate) payment.dueDate = new Date(req.body.dueDate);
    if (req.body.paymentMethod) payment.paymentMethod = req.body.paymentMethod;
    if (req.body.transactionId !== undefined) payment.transactionId = req.body.transactionId;
    if (req.body.notes !== undefined) payment.notes = req.body.notes;

    await payment.save();

    const updated = await ClientPayment.findById(id)
      .populate('project', 'name projectId projectValue status currency estimatedExchangeRate estimatedInrValue')
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
