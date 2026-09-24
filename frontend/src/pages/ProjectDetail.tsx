import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Briefcase,
  Users,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  Receipt,
  CreditCard,
  Building,
  UserCheck,
  LayoutGrid,
  List,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import { fetchProjectById } from '../store/slices/projectSlice.js';
import { fetchTeam } from '../store/slices/teamSlice.js';
import { createTask, updateTask, deleteTask } from '../store/slices/taskSlice.js';
import {
  createPayroll,
  updatePayroll,
  deletePayroll,
  addMilestone,
  updateMilestone,
} from '../store/slices/payrollSlice.js';
import { createPayment, updatePayment, deletePayment } from '../store/slices/paymentSlice.js';
import { createExpense, deleteExpense } from '../store/slices/expenseSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { KanbanBoard } from '../components/kanban/KanbanBoard.js';
import { CurrencySelector } from '../components/common/CurrencySelector.js';
import { ExchangeRateInput } from '../components/common/ExchangeRateInput.js';
import { INRAmountDisplay } from '../components/common/INRAmountDisplay.js';
import { MoneyDisplay } from '../components/common/MoneyDisplay.js';
import {
  formatCurrency,
  formatINR,
  formatUSD,
  formatExchangeRate,
  formatMoneyWithOriginal,
  formatDate,
  formatPercentage,
} from '../utils/formatters.js';
import { ITask, TaskStatus, Currency, ClientPaymentStatus } from '../types/index.js';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProject: project, isLoading } = useSelector((state: RootState) => state.projects);
  const { team: allTeamMembers } = useSelector((state: RootState) => state.team);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'finances'>('overview');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');

  // Task Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as any,
    status: 'todo' as TaskStatus,
    dueDate: '',
  });

  // Assign Team Member & Payroll Modal (Payroll is ALWAYS INR)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    teamMember: '',
    role: '',
    agreedAmount: 80000,
    paymentType: 'fixed' as any,
  });

  // Add Milestone Modal (Milestones are ALWAYS INR)
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedPayrollForMilestone, setSelectedPayrollForMilestone] = useState<string>('');
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '',
    amount: 25000,
    dueDate: new Date().toISOString().slice(0, 10),
    status: 'pending' as any,
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
  });

  // Mark Milestone as Paid Modal
  const [payingMilestone, setPayingMilestone] = useState<any | null>(null);
  const [payFormData, setPayFormData] = useState({
    paidDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
  });

  // Add Client Payment Modal (Supports INR or USD with exchange rate)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<{
    amount: number;
    currency: Currency;
    exchangeRate: number;
    dueDate: string;
    paymentDate: string;
    status: ClientPaymentStatus;
    paymentMethod: string;
    transactionId: string;
    notes: string;
  }>({
    amount: 1000,
    currency: 'USD',
    exchangeRate: 88,
    dueDate: new Date().toISOString().slice(0, 10),
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
    paymentMethod: 'stripe',
    transactionId: '',
    notes: '',
  });

  // Add Expense Modal (Always INR)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    name: '',
    category: 'hosting' as any,
    amount: 5000,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'credit_card',
    description: '',
  });

  const reloadWorkspace = () => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
  };

  useEffect(() => {
    reloadWorkspace();
    dispatch(fetchTeam({}));
  }, [dispatch, id]);

  if (isLoading || !project) {
    return <LoadingSpinner message="Loading project workspace..." />;
  }

  const clientObj = typeof project.client === 'object' ? project.client : null;
  const pmObj = typeof project.projectManager === 'object' ? project.projectManager : null;
  const finances = project.finances;
  const tasks = project.tasks || [];
  const teamMembers = project.team || [];
  const milestones = project.milestones || [];
  const payments = project.payments || [];
  const expenses = project.expenses || [];

  const projectCurrency: Currency = project.currency || 'USD';
  const estimatedRate = project.estimatedExchangeRate || (projectCurrency === 'USD' ? 88 : 1);
  const estimatedInr =
    project.estimatedInrValue ||
    (projectCurrency === 'USD' ? project.projectValue * estimatedRate : project.projectValue);

  const isAdmin = user?.role === 'admin';
  const isPM = user?.role === 'project_manager';

  // Task actions
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await dispatch(updateTask({ id: taskId, data: { status: newStatus } }));
    reloadWorkspace();
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      createTask({
        project: project._id,
        title: taskFormData.title,
        description: taskFormData.description,
        assignedTo: taskFormData.assignedTo || undefined,
        priority: taskFormData.priority,
        status: taskFormData.status,
        dueDate: taskFormData.dueDate || undefined,
      })
    );
    setIsTaskModalOpen(false);
    reloadWorkspace();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      await dispatch(deleteTask(taskId));
      reloadWorkspace();
    }
  };

  // Team & Payroll actions (Always INR)
  const handleAssignTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      createPayroll({
        project: project._id,
        teamMember: assignFormData.teamMember,
        role: assignFormData.role,
        agreedAmount: Number(assignFormData.agreedAmount),
        paymentType: assignFormData.paymentType,
        currency: 'INR',
      })
    );
    setIsAssignModalOpen(false);
    reloadWorkspace();
  };

  const handleRemoveMember = async (payrollId: string) => {
    if (window.confirm('Remove this team member from the project and delete linked payroll records?')) {
      await dispatch(deletePayroll(payrollId));
      reloadWorkspace();
    }
  };

  const handleOpenAddMilestone = (payrollId: string) => {
    setSelectedPayrollForMilestone(payrollId);
    setMilestoneFormData({
      title: '',
      amount: 25000,
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
      paymentMethod: 'bank_transfer',
      transactionId: '',
      notes: '',
    });
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      addMilestone({
        payrollId: selectedPayrollForMilestone,
        data: {
          ...milestoneFormData,
          amount: Number(milestoneFormData.amount),
          currency: 'INR',
        },
      })
    );
    setIsMilestoneModalOpen(false);
    reloadWorkspace();
  };

  const handleMarkMilestonePaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingMilestone) return;
    await dispatch(
      updateMilestone({
        id: payingMilestone._id,
        data: {
          status: 'paid',
          paidDate: payFormData.paidDate,
          paymentMethod: payFormData.paymentMethod,
          transactionId: payFormData.transactionId,
          notes: payFormData.notes,
        },
      })
    );
    setPayingMilestone(null);
    reloadWorkspace();
  };

  const handleOpenPaymentModal = () => {
    const pCurr: Currency = project.currency || 'USD';
    const defaultRate = pCurr === 'INR' ? 1 : project.estimatedExchangeRate || 88;
    setPaymentFormData({
      amount: project ? Math.max(1, (project.projectValue || 0) - (finances?.clientReceived || 0)) : 1000,
      currency: pCurr,
      exchangeRate: defaultRate,
      dueDate: new Date().toISOString().slice(0, 10),
      paymentDate: new Date().toISOString().slice(0, 10),
      status: 'paid',
      paymentMethod: pCurr === 'USD' ? 'wire' : 'bank_transfer',
      transactionId: '',
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  // Client Payment actions
  const handleSaveClientPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = paymentFormData.currency === 'INR' ? 1 : Number(paymentFormData.exchangeRate || 1);
    const inrAmt = Number(paymentFormData.amount) * rate;

    await dispatch(
      createPayment({
        project: project._id,
        client: (clientObj as any)?._id || (project.client as string),
        amount: Number(paymentFormData.amount),
        currency: paymentFormData.currency,
        exchangeRate: rate,
        inrAmount: inrAmt,
        dueDate: paymentFormData.dueDate,
        paymentDate: paymentFormData.status === 'paid' ? paymentFormData.paymentDate : undefined,
        status: paymentFormData.status,
        paymentMethod: paymentFormData.paymentMethod,
        transactionId: paymentFormData.transactionId,
        notes: paymentFormData.notes,
      })
    );
    setIsPaymentModalOpen(false);
    reloadWorkspace();
  };

  // Expense actions (Always INR)
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      createExpense({
        project: project._id,
        name: expenseFormData.name,
        category: expenseFormData.category,
        amount: Number(expenseFormData.amount),
        currency: 'INR',
        date: expenseFormData.date,
        paymentMethod: expenseFormData.paymentMethod,
        description: expenseFormData.description,
      })
    );
    setIsExpenseModalOpen(false);
    reloadWorkspace();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Delete this project expense?')) {
      await dispatch(deleteExpense(expenseId));
      reloadWorkspace();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects Directory
        </Link>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                {project.projectId}
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h2>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                  projectCurrency === 'USD'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}
              >
                {projectCurrency} Project
              </span>
              <Badge variant="status" status={project.status}>
                {project.status}
              </Badge>
              <Badge variant="priority" status={project.priority}>
                {project.priority}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
              <span className="text-slate-300 font-semibold">{clientObj?.companyName || 'Client'}</span>
              <span>•</span>
              <span>Manager: {pmObj?.name || 'Project Manager'}</span>
              <span>•</span>
              <span>
                Timeline: {formatDate(project.startDate)} → {formatDate(project.expectedEndDate)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5 text-indigo-400" />}
                onClick={() => {
                  setAssignFormData({
                    teamMember: allTeamMembers[0]?._id || '',
                    role: 'Lead Developer',
                    agreedAmount: 80000,
                    paymentType: 'fixed',
                  });
                  setIsAssignModalOpen(true);
                }}
              >
                Assign Member
              </Button>
            )}
            {(isAdmin || isPM) && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setTaskFormData({
                    title: '',
                    description: '',
                    assignedTo: teamMembers[0] ? (teamMembers[0].teamMember as any)?._id : '',
                    priority: 'medium',
                    status: 'todo',
                    dueDate: '',
                  });
                  setIsTaskModalOpen(true);
                }}
              >
                Add Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Tabs Header */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'team'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team & Payroll in INR ({teamMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'finances'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Finances & Profitability (INR Base)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border-l-4 border-l-blue-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Contract Value ({projectCurrency})
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(project.projectValue, projectCurrency)}
              </div>
              <div className="text-[11px] text-slate-300 font-semibold mt-2">
                {projectCurrency === 'USD' ? (
                  <>
                    Est. INR: <span className="text-indigo-400 font-bold">{formatINR(estimatedInr)}</span>
                  </>
                ) : (
                  <>
                    Received: <span className="text-emerald-400">{formatINR(finances?.clientReceived || 0)}</span>
                  </>
                )}
              </div>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Payroll (INR)
              </span>
              <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                {formatINR(finances?.teamPayrollCommitted || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {formatINR(finances?.teamPayrollPaid || 0)} settled
              </div>
            </Card>

            <Card className="border-l-4 border-l-rose-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Project Expenses (INR)
              </span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatINR(finances?.expenses || 0)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2">{expenses.length} receipts logged</div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expected Profit (INR)
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatINR(finances?.expectedProfit || 0)}
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-2">
                {formatPercentage(finances?.profitMargin || 0)} margin
              </div>
            </Card>
          </div>

          {/* Scope and Deliverables Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Project Scope & Architecture">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {project.description || 'No detailed scope description provided.'}
                </p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Technology Stack
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 text-xs font-medium border border-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Task Completion Progress */}
              <Card title="Delivery & Task Progress">
                <ProgressBar progress={project.progress || 0} showLabel size="lg" />
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800 text-center">
                  <div>
                    <span className="text-xs text-slate-400">Total Tasks</span>
                    <div className="text-lg font-extrabold text-white mt-0.5">{tasks.length}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">In Progress</span>
                    <div className="text-lg font-extrabold text-indigo-400 mt-0.5">
                      {tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Completed</span>
                    <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
                      {tasks.filter((t) => t.status === 'completed').length}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Stakeholders Details */}
            <div className="space-y-6">
              <Card title="Client Stakeholder">
                {clientObj ? (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-slate-100 text-sm">{clientObj.companyName}</div>
                    <div className="text-slate-300 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{clientObj.name}</span>
                    </div>
                    <div className="text-slate-400">Email: {clientObj.email}</div>
                    <div className="text-slate-400">Country: {clientObj.country}</div>
                    <div className="pt-2">
                      <Link
                        to={`/clients/${clientObj._id}`}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                      >
                        View Client Dossier →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No client details linked.</p>
                )}
              </Card>

              <Card title="Project Manager">
                {pmObj ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        pmObj.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${pmObj.name}`
                      }
                      alt={pmObj.name}
                      className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-indigo-500/30"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{pmObj.name}</div>
                      <div className="text-[11px] text-indigo-400 capitalize">{pmObj.role?.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-400">{pmObj.email}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No PM assigned.</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS (Kanban & List View) */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTaskViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taskViewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setTaskViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  taskViewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            {(isAdmin || isPM) && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setTaskFormData({
                    title: '',
                    description: '',
                    assignedTo: teamMembers[0] ? (teamMembers[0].teamMember as any)?._id : '',
                    priority: 'medium',
                    status: 'todo',
                    dueDate: '',
                  });
                  setIsTaskModalOpen(true);
                }}
              >
                Add Task
              </Button>
            )}
          </div>

          {taskViewMode === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onAddTask={(status) => {
                setTaskFormData({
                  title: '',
                  description: '',
                  assignedTo: teamMembers[0] ? (teamMembers[0].teamMember as any)?._id : '',
                  priority: 'medium',
                  status,
                  dueDate: '',
                });
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={isAdmin || isPM ? handleDeleteTask : undefined}
            />
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-6">Task Title</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Due Date</th>
                      {(isAdmin || isPM) && <th className="py-3 px-6 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tasks.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-6 font-bold text-slate-200">{t.title}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {(t.assignedTo as any)?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="priority" status={t.priority} size="sm">
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t._id, e.target.value as TaskStatus)}
                            className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(t.dueDate)}</td>
                        {(isAdmin || isPM) && (
                          <td className="py-3 px-6 text-right">
                            <button
                              onClick={() => handleDeleteTask(t._id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: TEAM & PROJECT PAYROLL (ALWAYS INR) */}
      {activeTab === 'team' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Project Assigned Team & Compensation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Always Paid in INR (₹)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Team members are compensated in INR with agreed project milestones and payouts
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setAssignFormData({
                    teamMember: allTeamMembers[0]?._id || '',
                    role: 'Developer',
                    agreedAmount: 80000,
                    paymentType: 'fixed',
                  });
                  setIsAssignModalOpen(true);
                }}
              >
                Assign Member
              </Button>
            )}
          </div>

          {/* Team Members Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teamMembers.map((member: any) => {
              const u = member.teamMember || {};
              const memberMilestones = milestones.filter(
                (m: any) => (m.teamMember as any)?._id?.toString() === u._id?.toString()
              );

              return (
                <Card key={member._id} className="border-l-4 border-l-indigo-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name || 'User'}`
                        }
                        alt={u.name}
                        className="w-11 h-11 rounded-full bg-slate-800 object-cover border border-indigo-500/30"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{u.name}</h4>
                        <span className="text-xs font-semibold text-indigo-400 block">{member.role}</span>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Financial Agreed vs Paid vs Pending in INR */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Agreed (INR)</span>
                      <div className="text-sm font-extrabold text-white mt-0.5">
                        {formatINR(member.agreedAmount)}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Paid (INR)</span>
                      <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                        {formatINR(member.totalPaid)}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Pending (INR)</span>
                      <div className="text-sm font-extrabold text-amber-400 mt-0.5">
                        {formatINR(member.pendingAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Milestones list under member */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Milestones ({memberMilestones.length})
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenAddMilestone(member._id)}
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Milestone
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {memberMilestones.map((ms: any) => (
                        <div
                          key={ms._id}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{ms.title}</span>
                            <span className="text-[10px] text-slate-400 block">
                              Due: {formatDate(ms.dueDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-200">
                              {formatINR(ms.amount)}
                            </span>
                            <Badge variant="status" status={ms.status} size="sm">
                              {ms.status}
                            </Badge>
                            {isAdmin && ms.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setPayingMilestone(ms);
                                  setPayFormData({
                                    paidDate: new Date().toISOString().slice(0, 10),
                                    paymentMethod: 'bank_transfer',
                                    transactionId: `TXN-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
                                    notes: 'Approved and settled project milestone',
                                  });
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: FINANCES & PROFITABILITY (INR BASE REPORTING) */}
      {activeTab === 'finances' && (
        <div className="space-y-8">
          {/* Dual Financial Comparison: Contract Position vs Cash Position */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Contract Financial Position" subtitle="Accrual-based profitability with INR base">
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Total Project Value</span>
                    {projectCurrency === 'USD' && (
                      <span className="text-[11px] text-slate-400">
                        Original: {formatUSD(project.projectValue)} (Rate: ₹{estimatedRate}/USD)
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-100 text-base">
                      {projectCurrency === 'USD'
                        ? formatINR(estimatedInr)
                        : formatINR(project.projectValue)}
                    </span>
                    {projectCurrency === 'USD' && (
                      <span className="text-[10px] text-slate-400 block">Est. Base INR</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Client Payments Received</span>
                    {projectCurrency === 'USD' && (
                      <span className="text-[11px] text-emerald-400/80">
                        Received: {formatUSD(finances?.clientReceived || 0)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm">
                      {formatINR(finances?.clientReceivedInr || 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Actual INR from stored rates</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Client Pending Balance</span>
                    {projectCurrency === 'USD' && (
                      <span className="text-[11px] text-amber-400/80">
                        Pending: {formatUSD(finances?.clientPending || 0)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400 text-sm">
                      {formatINR(finances?.clientPendingInr || 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Est. INR pending</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Committed Team Payroll</span>
                    <span className="text-[10px] text-slate-400">All developers paid in INR</span>
                  </div>
                  <span className="font-bold text-indigo-400 text-sm">
                    - {formatINR(finances?.teamPayrollCommitted || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Total Project Expenses</span>
                    <span className="text-[10px] text-slate-400">Logged expenses in INR</span>
                  </div>
                  <span className="font-bold text-rose-400 text-sm">
                    - {formatINR(finances?.expenses || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 font-extrabold text-sm bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-200 block text-xs uppercase tracking-wider">
                      Expected Net Profit (INR)
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Based on Project Value (INR) - Payroll - Expenses
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 text-base font-extrabold block">
                      {formatINR(finances?.expectedProfit || 0)}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {formatPercentage(finances?.profitMargin || 0)} margin
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Current Cash Flow Position" subtitle="Actual cash collected & settled in INR">
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Actual INR Cash Received</span>
                    <span className="text-[10px] text-slate-400">
                      Calculated from exact payment exchange rates
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm">
                      + {formatINR(finances?.cashReceivedInr || finances?.clientReceivedInr || 0)}
                    </span>
                    {projectCurrency === 'USD' && (
                      <span className="text-[10px] text-slate-400 block">
                        ({formatUSD(finances?.cashReceived || finances?.clientReceived || 0)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Team Payroll Paid Out</span>
                    <span className="text-[10px] text-slate-400">Settled milestones in INR</span>
                  </div>
                  <span className="font-bold text-indigo-400 text-sm">
                    - {formatINR(finances?.teamPayrollPaid || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <div>
                    <span className="text-slate-300 font-semibold block">Expenses Settled</span>
                    <span className="text-[10px] text-slate-400">Total logged INR expenses</span>
                  </div>
                  <span className="font-bold text-rose-400 text-sm">
                    - {formatINR(finances?.expenses || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-5 font-extrabold text-sm bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-200 block text-xs uppercase tracking-wider">
                      Net Cash In Hand (INR)
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Actual INR Received - Payroll Paid - Expenses
                    </span>
                  </div>
                  <span className="text-emerald-400 text-base font-extrabold">
                    {formatINR(finances?.netCashPosition || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Client Payments Schedule Section */}
          <Card
            title="Client Payment Schedule & Invoices"
            action={
              isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleOpenPaymentModal}
                >
                  Record Client Payment
                </Button>
              )
            }
          >
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No client payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="pb-3 pr-4">Original Amount</th>
                      <th className="pb-3 px-3">Currency</th>
                      <th className="pb-3 px-3">Exchange Rate</th>
                      <th className="pb-3 px-4">INR Equivalent</th>
                      <th className="pb-3 px-4">Due Date</th>
                      <th className="pb-3 px-4">Payment Date</th>
                      <th className="pb-3 px-4">Method & Transaction</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.map((p: any) => {
                      const pCurrency = p.currency || 'USD';
                      const pRate = p.exchangeRate || 1;
                      const pInr = p.inrAmount ?? (pCurrency === 'USD' ? p.amount * pRate : p.amount);

                      return (
                        <tr key={p._id} className="hover:bg-slate-800/40">
                          <td className="py-3 pr-4 font-extrabold text-white text-sm">
                            {formatCurrency(p.amount, pCurrency)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pCurrency === 'USD'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}
                            >
                              {pCurrency}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                            {pCurrency === 'USD' ? formatExchangeRate(pRate) : '1.00 (Base)'}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                            {formatINR(pInr)}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{formatDate(p.dueDate)}</td>
                          <td className="py-3 px-4 text-slate-300">{formatDate(p.paymentDate)}</td>
                          <td className="py-3 px-4">
                            <span className="capitalize text-slate-200">
                              {p.paymentMethod?.replace('_', ' ')}
                            </span>
                            {p.transactionId && (
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {p.transactionId}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="status" status={p.status} size="sm">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="py-3 pl-4 text-right text-slate-400">{p.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Project Expenses Section (Always INR) */}
          <Card
            title="Project Expenses (INR)"
            action={
              isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5 text-rose-400" />}
                  onClick={() => setIsExpenseModalOpen(true)}
                >
                  Add Expense
                </Button>
              )
            }
          >
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No project expenses logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="pb-3 pr-4">Expense Name</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 px-4">Amount (INR)</th>
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4">Payment Method</th>
                      {isAdmin && <th className="pb-3 pl-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expenses.map((e: any) => (
                      <tr key={e._id} className="hover:bg-slate-800/40">
                        <td className="py-3 pr-4 font-bold text-slate-200">{e.name}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-400">
                          {formatINR(e.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(e.date)}</td>
                        <td className="py-3 px-4 text-slate-300 capitalize">
                          {e.paymentMethod?.replace('_', ' ')}
                        </td>
                        {isAdmin && (
                          <td className="py-3 pl-4 text-right">
                            <button
                              onClick={() => handleDeleteExpense(e._id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create Project Task"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
            placeholder="e.g. Implement Payment Gateway webhook listener"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned To"
              value={taskFormData.assignedTo}
              onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
              options={teamMembers.map((m: any) => ({
                value: m.teamMember?._id,
                label: `${m.teamMember?.name} (${m.role})`,
              }))}
              placeholder="Select Assigned Member"
            />
            <Select
              label="Priority"
              value={taskFormData.priority}
              onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={taskFormData.status}
              onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as any })}
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={taskFormData.dueDate}
              onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              placeholder="Task acceptance criteria and details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN TEAM MEMBER MODAL (ALWAYS INR) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Team Member to Project"
        maxWidth="lg"
      >
        <form onSubmit={handleAssignTeamMember} className="space-y-4">
          <Select
            label="Select Team Member"
            required
            value={assignFormData.teamMember}
            onChange={(e) => setAssignFormData({ ...assignFormData, teamMember: e.target.value })}
            options={allTeamMembers.map((m) => ({
              value: m._id,
              label: `${m.name} (${m.role?.replace('_', ' ')})`,
            }))}
            placeholder="Choose Member"
          />

          <Input
            label="Project Role"
            required
            value={assignFormData.role}
            onChange={(e) => setAssignFormData({ ...assignFormData, role: e.target.value })}
            placeholder="e.g. Lead Frontend Developer / UI Designer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Agreed Project Payment (₹ INR)"
              type="number"
              required
              min={0}
              value={assignFormData.agreedAmount}
              onChange={(e) =>
                setAssignFormData({ ...assignFormData, agreedAmount: Number(e.target.value) })
              }
            />
            <Select
              label="Payment Type"
              value={assignFormData.paymentType}
              onChange={(e) => setAssignFormData({ ...assignFormData, paymentType: e.target.value as any })}
              options={[
                { value: 'fixed', label: 'Fixed Project Amount' },
                { value: 'percentage', label: 'Percentage' },
                { value: 'per_task', label: 'Per Task' },
                { value: 'hourly', label: 'Hourly' },
              ]}
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Team compensation is always denominated and settled in INR (₹). You can break this into milestones next.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign & Configure Payroll (INR)
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD MILESTONE MODAL (ALWAYS INR) */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title="Add Project Payroll Milestone (INR)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveMilestone} className="space-y-4">
          <Input
            label="Milestone Title"
            required
            value={milestoneFormData.title}
            onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
            placeholder="e.g. Milestone 1: Beta UI & Integration"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Milestone Amount (₹ INR)"
              type="number"
              required
              min={0}
              value={milestoneFormData.amount}
              onChange={(e) =>
                setMilestoneFormData({ ...milestoneFormData, amount: Number(e.target.value) })
              }
            />
            <Input
              label="Due Date"
              type="date"
              required
              value={milestoneFormData.dueDate}
              onChange={(e) => setMilestoneFormData({ ...milestoneFormData, dueDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsMilestoneModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Milestone
            </Button>
          </div>
        </form>
      </Modal>

      {/* MARK MILESTONE AS PAID MODAL */}
      <Modal
        isOpen={!!payingMilestone}
        onClose={() => setPayingMilestone(null)}
        title={`Settle Milestone: ${payingMilestone?.title || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleMarkMilestonePaid} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-400">Payout Amount (INR)</span>
            <span className="text-base font-extrabold text-emerald-400">
              {formatINR(payingMilestone?.amount)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payment Date"
              type="date"
              required
              value={payFormData.paidDate}
              onChange={(e) => setPayFormData({ ...payFormData, paidDate: e.target.value })}
            />
            <Select
              label="Payment Method"
              value={payFormData.paymentMethod}
              onChange={(e) => setPayFormData({ ...payFormData, paymentMethod: e.target.value })}
              options={[
                { value: 'bank_transfer', label: 'Bank Transfer (NEFT/IMPS/UPI)' },
                { value: 'stripe', label: 'Stripe' },
                { value: 'wise', label: 'Wise' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'cash', label: 'Cash' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <Input
            label="Transaction ID / Receipt Reference"
            value={payFormData.transactionId}
            onChange={(e) => setPayFormData({ ...payFormData, transactionId: e.target.value })}
            placeholder="e.g. UTR-BANK-99210"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setPayingMilestone(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Mark as Paid
            </Button>
          </div>
        </form>
      </Modal>

      {/* RECORD CLIENT PAYMENT MODAL (MULTI-CURRENCY WITH STORED EXCHANGE RATE) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Client Inflow Payment"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClientPayment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CurrencySelector
              value={paymentFormData.currency}
              onChange={(cur) => {
                setPaymentFormData({
                  ...paymentFormData,
                  currency: cur,
                  exchangeRate: cur === 'INR' ? 1 : 88,
                });
              }}
              label="Payment Currency"
            />
            <Input
              label={`Payment Amount (${paymentFormData.currency})`}
              type="number"
              required
              min={0}
              value={paymentFormData.amount}
              onChange={(e) =>
                setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })
              }
            />
          </div>

          {paymentFormData.currency === 'USD' && (
            <div className="space-y-3">
              <ExchangeRateInput
                value={paymentFormData.exchangeRate}
                onChange={(rate) => setPaymentFormData({ ...paymentFormData, exchangeRate: rate })}
                originalAmount={paymentFormData.amount}
                label="Transaction Exchange Rate (USD → INR)"
                helperText="Permanent historical rate for this payment. It will NOT fluctuate later."
              />
              <INRAmountDisplay
                inrAmount={paymentFormData.amount * paymentFormData.exchangeRate}
                originalAmount={paymentFormData.amount}
                originalCurrency="USD"
                exchangeRate={paymentFormData.exchangeRate}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={paymentFormData.status}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, status: e.target.value as any })}
              options={[
                { value: 'paid', label: 'Paid / Received' },
                { value: 'pending', label: 'Pending Invoice' },
              ]}
            />
            <Select
              label="Payment Method"
              value={paymentFormData.paymentMethod}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
              options={[
                { value: 'stripe', label: 'Stripe' },
                { value: 'wire', label: 'Wire Transfer / Swift' },
                { value: 'bank_transfer', label: 'Bank Transfer (NEFT/IMPS/UPI)' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'card', label: 'Credit Card' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              required
              value={paymentFormData.dueDate}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, dueDate: e.target.value })}
            />
            <Input
              label="Payment Received Date"
              type="date"
              value={paymentFormData.paymentDate}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
            />
          </div>

          <Input
            label="Transaction ID / Wire Reference"
            value={paymentFormData.transactionId}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionId: e.target.value })}
            placeholder="INV-PAID-001"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record Inflow Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* RECORD EXPENSE MODAL (ALWAYS INR) */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Add Project Expense (INR)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <Input
            label="Expense Name"
            required
            value={expenseFormData.name}
            onChange={(e) => setExpenseFormData({ ...expenseFormData, name: e.target.value })}
            placeholder="e.g. AWS Cloud Infrastructure / Maps API"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={expenseFormData.category}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value as any })}
              options={[
                { value: 'hosting', label: 'Hosting & Cloud' },
                { value: 'domain', label: 'Domain' },
                { value: 'api', label: 'Third-Party API' },
                { value: 'software', label: 'Software / Licenses' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'travel', label: 'Travel' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Amount (₹ INR)"
              type="number"
              required
              min={0}
              value={expenseFormData.amount}
              onChange={(e) =>
                setExpenseFormData({ ...expenseFormData, amount: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={expenseFormData.date}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
            />
            <Select
              label="Payment Method"
              value={expenseFormData.paymentMethod}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMethod: e.target.value })}
              options={[
                { value: 'credit_card', label: 'Corporate Card' },
                { value: 'bank_transfer', label: 'Bank Transfer / UPI' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'cash', label: 'Cash' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Expense (INR)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
