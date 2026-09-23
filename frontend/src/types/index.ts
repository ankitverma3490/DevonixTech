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
  contractValue: number;
  clientReceived: number;
  clientPending: number;
  teamPayrollCommitted: number;
  teamPayrollPaid: number;
  teamPayrollPending: number;
  expenses: number;
  totalCost: number;
  expectedProfit: number;
  profitMargin: number;
  cashReceived: number;
  cashPaidOut: number;
  netCashPosition: number;
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
  projectValue: number;
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
  agreedAmount: number;
  paymentType: PaymentType;
  totalPaid: number;
  pendingAmount: number;
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
  amount: number;
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
  amount: number;
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
  amount: number;
  date: string;
  paymentMethod?: string;
  description?: string;
  receipt?: string;
}

export interface IDashboardSummary {
  role: UserRole;
  cards?: {
    totalClients: number;
    activeProjects: number;
    completedProjects: number;
    teamMembers: number;
    totalRevenue: number;
    totalContractValue: number;
    totalClientPending: number;
    teamPayroll: number;
    teamPayrollCommitted: number;
    teamPayrollPending: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
    accrualProfit: number;
    accrualMargin: number;
  };
  summary?: any;
  recentProjects?: IProject[];
  payrolls?: IPayroll[];
  upcomingMilestones?: IPayrollMilestone[];
  recentTasks?: ITask[];
}
