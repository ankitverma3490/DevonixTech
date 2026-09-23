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
  projectValue: number;
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
  agreedAmount: number;
  paymentType: PaymentType;
  totalPaid: number;
  pendingAmount: number;
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
  amount: number;
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
  amount: number;
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
  amount: number;
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
