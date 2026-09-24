export type UserRole = 'admin' | 'project_manager' | 'team_member';
export type UserStatus = 'active' | 'inactive';

export type ClientStatus = 'active' | 'inactive';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type PaymentType = 'fixed' | 'percentage' | 'per_task' | 'hourly';
export type MilestoneStatus = 'pending' | 'paid' | 'overdue';
export type ClientPaymentStatus = 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled';

export type Currency = 'INR' | 'USD';

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
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  whatsapp?: string;
  skills: string[];
  joiningDate?: string;
  status: UserStatus;
  notes?: string;
  avatarUrl?: string;
  projectCount?: number;
  totalAgreedEarnings?: number;
  totalPaid?: number;
  pendingPayments?: number;
  assignedTasksCount?: number;
  completedTasksCount?: number;
}

export interface IClient {
  _id: string;
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
  projectCount?: number;
  totalProjectValue?: number;
  totalReceived?: number;
  totalPending?: number;
  projects?: IProject[];
  payments?: IClientPayment[];
}

export interface IProjectFinances {
  projectId: string;
  projectMongoId: string;
  projectName: string;
  currency: Currency;
  estimatedExchangeRate: number;
  contractValue: number; // Value in original currency
  estimatedInrValue: number; // In base INR
  clientReceived: number; // In original currency
  clientReceivedInr: number; // In base INR
  clientPending: number; // In original currency
  clientPendingInr: number; // In base INR
  teamPayrollCommitted: number; // Always in INR
  teamPayrollPaid: number; // Always in INR
  teamPayrollPending: number; // Always in INR
  expenses: number; // Always in INR
  totalCost: number; // Always in INR
  expectedProfit: number; // In INR
  profitMargin: number; // %
  actualCashProfit: number; // In INR
  actualCashMargin: number; // %
  cashReceived: number; // In original currency
  cashReceivedInr: number; // In INR
  cashPaidOut: number; // In INR
  netCashPosition: number; // In INR
}

export interface IProject {
  _id: string;
  name: string;
  projectId: string;
  client: IClient | string;
  description?: string;
  projectType: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  currency: Currency;
  projectValue: number; // In original currency
  estimatedExchangeRate: number; // Rate for USD, 1 for INR
  estimatedInrValue: number; // In base INR
  projectManager: IUser | string;
  technologies: string[];
  notes?: string;
  progress?: number;
  finances?: IProjectFinances;
  tasks?: ITask[];
  team?: IPayroll[];
  milestones?: IPayrollMilestone[];
  payments?: IClientPayment[];
  expenses?: IExpense[];
  taskCount?: number;
  completedTaskCount?: number;
  taskProgress?: number;
}

export interface IPayroll {
  _id: string;
  project: IProject | string;
  teamMember: IUser | string;
  role: string;
  currency?: 'INR';
  agreedAmount: number; // Always in INR
  paymentType: PaymentType;
  totalPaid: number; // Always in INR
  pendingAmount: number; // Always in INR
  status: 'pending' | 'partially_paid' | 'paid';
  milestones?: IPayrollMilestone[];
  assignedTasksCount?: number;
  completedTasksCount?: number;
}

export interface IPayrollMilestone {
  _id: string;
  payroll: string;
  project: IProject | string;
  teamMember: IUser | string;
  title: string;
  currency?: 'INR';
  amount: number; // Always in INR
  dueDate: string;
  paidDate?: string;
  status: MilestoneStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export interface ITask {
  _id: string;
  project: IProject | string;
  title: string;
  description?: string;
  assignedTo?: IUser | string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate?: string;
  createdAt?: string;
}

export interface IClientPayment {
  _id: string;
  project: IProject | string;
  client: IClient | string;
  currency: Currency;
  amount: number; // Original currency amount
  exchangeRate: number; // Stored transaction rate (1 for INR, e.g. 88 for USD)
  inrAmount: number; // Converted INR amount
  requiresExchangeRateUpdate?: boolean;
  paymentDate?: string;
  dueDate: string;
  paymentMethod?: string;
  transactionId?: string;
  status: ClientPaymentStatus;
  notes?: string;
}

export interface IExpense {
  _id: string;
  project?: IProject | string;
  name: string;
  category: ExpenseCategory;
  currency?: 'INR';
  amount: number; // Always in INR
  date: string;
  paymentMethod?: string;
  description?: string;
  receipt?: string;
}

export interface IDashboardSummary {
  role: UserRole;
  cards?: {
    currency?: string;
    totalClients: number;
    activeProjects: number;
    completedProjects: number;
    teamMembers: number;
    totalRevenue: number;
    totalContractValue: number;
    totalClientPending: number;
    teamPayroll: number;
    teamPayrollCommitted: number;
    teamPayrollPaid: number;
    teamPayrollPending: number;
    expenses: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    accrualProfit: number;
    currencyBreakdown?: {
      usdRevenue: number;
      inrDirectRevenue: number;
      totalInrRevenue: number;
    };
  };
  summary?: any;
  upcomingMilestones?: IPayrollMilestone[];
  recentTasks?: ITask[];
  recentProjects?: IProject[];
}
