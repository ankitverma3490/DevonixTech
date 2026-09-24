import { Response } from 'express';
import { Client } from '../models/Client.js';
import { Project } from '../models/Project.js';
import { ClientPayment } from '../models/ClientPayment.js';
import { AuthRequest } from '../types/index.js';

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { companyName: searchRegex },
        { email: searchRegex },
        { country: searchRegex },
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });

    // Aggregate financial metrics for each client
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const projects = await Project.find({ client: client._id });
        const payments = await ClientPayment.find({ client: client._id });

        const totalProjectValueInr = projects.reduce((sum, p) => {
          if (p.estimatedInrValue) return sum + p.estimatedInrValue;
          const rate = p.estimatedExchangeRate || (p.currency === 'USD' ? 88 : 1);
          return sum + (p.currency === 'USD' ? Math.round(p.projectValue * rate) : p.projectValue);
        }, 0);

        const totalReceivedInr = payments
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => {
            if (p.inrAmount !== undefined && p.inrAmount !== null) return sum + p.inrAmount;
            const rate = p.exchangeRate || (p.currency === 'USD' ? 88 : 1);
            return sum + (p.currency === 'USD' ? Math.round(p.amount * rate) : p.amount);
          }, 0);

        const totalPendingInr = Math.max(0, totalProjectValueInr - totalReceivedInr);

        return {
          ...client.toObject(),
          projectCount: projects.length,
          totalProjectValue: totalProjectValueInr,
          totalReceived: totalReceivedInr,
          totalPending: totalPendingInr,
        };
      })
    );

    res.json({ success: true, clients: enrichedClients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch clients' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);

    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    const projects = await Project.find({ client: client._id })
      .populate('projectManager', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    const payments = await ClientPayment.find({ client: client._id })
      .populate('project', 'name projectId')
      .sort({ paymentDate: -1, createdAt: -1 });

    const totalProjectValueInr = projects.reduce((sum, p) => {
      if (p.estimatedInrValue) return sum + p.estimatedInrValue;
      const rate = p.estimatedExchangeRate || (p.currency === 'USD' ? 88 : 1);
      return sum + (p.currency === 'USD' ? Math.round(p.projectValue * rate) : p.projectValue);
    }, 0);

    const totalReceivedInr = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => {
        if (p.inrAmount !== undefined && p.inrAmount !== null) return sum + p.inrAmount;
        const rate = p.exchangeRate || (p.currency === 'USD' ? 88 : 1);
        return sum + (p.currency === 'USD' ? Math.round(p.amount * rate) : p.amount);
      }, 0);

    const totalPendingInr = Math.max(0, totalProjectValueInr - totalReceivedInr);

    res.json({
      success: true,
      client: {
        ...client.toObject(),
        projects,
        payments,
        totalProjectValue: totalProjectValueInr,
        totalReceived: totalReceivedInr,
        totalPending: totalPendingInr,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch client' });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, companyName, email, phone, whatsapp, country, address, website, notes, status } =
      req.body;

    if (!name || !companyName || !email || !country) {
      res.status(400).json({
        success: false,
        message: 'Name, company name, email, and country are required.',
      });
      return;
    }

    const client = new Client({
      name,
      companyName,
      email,
      phone,
      whatsapp,
      country,
      address,
      website,
      notes,
      status: status || 'active',
    });

    await client.save();
    res.status(201).json({ success: true, message: 'Client created successfully', client });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create client' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    res.json({ success: true, message: 'Client updated successfully', client });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update client' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const associatedProjects = await Project.countDocuments({ client: id });

    if (associatedProjects > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete client. There are ${associatedProjects} active project(s) linked to this client.`,
      });
      return;
    }

    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete client' });
  }
};
