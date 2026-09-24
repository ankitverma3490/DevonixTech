import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'admin' | 'project_manager' | 'team_member';
export type UserStatus = 'active' | 'inactive';

export type ClientStatus = 'active' | 'inactive';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type PaymentType = 'fixed' | 'percentage' | 'per_task' | 'hourly';
export type MilestoneStatus = 'pending' | 'paid' | 'overdue';
export type ClientPaymentStatus = 'pending' | 'paid' | 'overdue' | 'partially_paid';

export type ExpenseCategory =
  | 'hosting'
  | 'domain'
  | 'api'
  | 'software'
  | 'marketing'
  | 'equipment'
  | 'travel'
  | 'other';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  whatsapp?: string;
  skills: string[];
  joiningDate: Date;
  status: UserStatus;
  notes?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClient {
  _id: Types.ObjectId;
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country: string;
  address?: string;
  website?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type Currency = 'INR' | 'USD';

export interface IProject {
  _id: Types.ObjectId;
  name: string;
  projectId: string; // e.g. PRJ-101
  client: Types.ObjectId | IClient;
  description?: string;
  projectType: string;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  status: ProjectStatus;
  priority: PriorityLevel;
  currency: Currency;
  projectValue: number; // Value in original currency
  estimatedExchangeRate: number; // e.g. 88 for USD, 1 for INR
  estimatedInrValue: number; // projectValue * estimatedExchangeRate
  projectManager: Types.ObjectId | IUser;
  technologies: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayroll {
  _id: Types.ObjectId;
  project: Types.ObjectId | IProject;
  teamMember: Types.ObjectId | IUser;
  role: string;
  currency: 'INR';
  agreedAmount: number; // Always in INR
  paymentType: PaymentType;
  totalPaid: number; // Always in INR
  pendingAmount: number; // Always in INR
  status: 'pending' | 'partially_paid' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayrollMilestone {
  _id: Types.ObjectId;
  payroll: Types.ObjectId | IPayroll;
  project: Types.ObjectId | IProject;
  teamMember: Types.ObjectId | IUser;
  title: string;
  currency: 'INR';
  amount: number; // Always in INR
  dueDate: Date;
  paidDate?: Date;
  status: MilestoneStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: Types.ObjectId;
  project: Types.ObjectId | IProject;
  title: string;
  description?: string;
  assignedTo?: Types.ObjectId | IUser;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientPayment {
  _id: Types.ObjectId;
  project: Types.ObjectId | IProject;
  client: Types.ObjectId | IClient;
  currency: Currency;
  amount: number; // Amount in original currency (e.g. USD or INR)
  exchangeRate: number; // Stored transaction exchange rate (1 for INR, e.g. 88 for USD)
  inrAmount: number; // amount * exchangeRate
  requiresExchangeRateUpdate?: boolean; // Flag for legacy records requiring exchange rate review
  paymentDate?: Date;
  dueDate: Date;
  paymentMethod?: string;
  transactionId?: string;
  status: ClientPaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense {
  _id: Types.ObjectId;
  project?: Types.ObjectId | IProject;
  name: string;
  category: ExpenseCategory;
  currency: 'INR';
  amount: number; // Always in INR
  date: Date;
  paymentMethod?: string;
  description?: string;
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    name: string;
  };
}
