import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  ArrowUpRight,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../store/slices/projectSlice.js';
import { fetchClients } from '../store/slices/clientSlice.js';
import { fetchTeam } from '../store/slices/teamSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters.js';
import { IProject } from '../types/index.js';

export const Projects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, isLoading } = useSelector((state: RootState) => state.projects);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { team } = useSelector((state: RootState) => state.team);
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    client: '',
    description: '',
    projectType: 'Web Application',
    startDate: new Date().toISOString().slice(0, 10),
    expectedEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'planning',
    priority: 'medium',
    projectValue: 10000,
    projectManager: '',
    technologies: 'React, TypeScript, Node.js',
    notes: '',
  });

  useEffect(() => {
    dispatch(
      fetchProjects({
        search,
        status: statusFilter,
        priority: priorityFilter,
        client: clientFilter,
      })
    );
    dispatch(fetchClients({}));
    dispatch(fetchTeam({}));
  }, [dispatch, search, statusFilter, priorityFilter, clientFilter]);

  const pms = team.filter((m) => m.role === 'project_manager' || m.role === 'admin');

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      projectId: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      client: clients[0]?._id || '',
      description: '',
      projectType: 'Web Application',
      startDate: new Date().toISOString().slice(0, 10),
      expectedEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'planning',
      priority: 'medium',
      projectValue: 10000,
      projectManager: pms[0]?._id || user?._id || '',
      technologies: 'React, TypeScript, Node.js',
      notes: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (project: IProject) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      projectId: project.projectId,
      client: (project.client as any)?._id || (project.client as string),
      description: project.description || '',
      projectType: project.projectType || 'Web Application',
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
      expectedEndDate: project.expectedEndDate
        ? new Date(project.expectedEndDate).toISOString().slice(0, 10)
        : '',
      status: project.status,
      priority: project.priority,
      projectValue: project.projectValue,
      projectManager:
        (project.projectManager as any)?._id || (project.projectManager as string) || '',
      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(', ')
        : project.technologies || '',
      notes: project.notes || '',
    });
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...formData,
      projectValue: Number(formData.projectValue),
      technologies: formData.technologies.split(',').map((t) => t.trim()),
    };
    const res = await dispatch(createProject(payload));
    if (createProject.fulfilled.match(res)) {
      setIsCreateOpen(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const payload: any = {
      ...formData,
      projectValue: Number(formData.projectValue),
      technologies: formData.technologies.split(',').map((t) => t.trim()),
    };
    const res = await dispatch(updateProject({ id: editingProject._id, data: payload }));
    if (updateProject.fulfilled.match(res)) {
      setEditingProject(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await dispatch(deleteProject(deletingId));
    setDeletingId(null);
  };

  const isAdmin = user?.role === 'admin';
  const isPM = user?.role === 'project_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Project Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track client scopes, agreed budgets, team payroll commitments, and profitability
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Create New Project
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search by project name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Clients' },
              ...clients.map((c) => ({ value: c._id, label: c.companyName })),
            ]}
          />
        </div>
      </Card>

      {/* Projects Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-indigo-400" />}
          title="No projects found"
          description={search ? 'No projects match your filter criteria.' : 'Create your first client project.'}
          actionText={isAdmin ? 'Create New Project' : undefined}
          onAction={isAdmin ? handleOpenCreate : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Project & Client</th>
                  <th className="py-3.5 px-4">Manager</th>
                  <th className="py-3.5 px-4">Status & Priority</th>
                  <th className="py-3.5 px-4 text-right">Contract Value</th>
                  <th className="py-3.5 px-4 text-right">Team Payroll</th>
                  <th className="py-3.5 px-4 text-right">Expected Profit</th>
                  <th className="py-3.5 px-4 w-32">Progress</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p) => {
                  const clientObj = typeof p.client === 'object' ? p.client : null;
                  const pmObj = typeof p.projectManager === 'object' ? p.projectManager : null;
                  const finances = p.finances;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-100 text-sm">{p.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {p.projectId}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {clientObj?.companyName || 'Client'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              pmObj?.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${pmObj?.name || 'PM'}`
                            }
                            alt={pmObj?.name}
                            className="w-5 h-5 rounded-full bg-slate-800 object-cover shrink-0"
                          />
                          <span className="font-medium text-xs">{pmObj?.name || 'Assigned PM'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div>
                          <Badge variant="status" status={p.status} size="sm">
                            {p.status}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant="priority" status={p.priority} size="sm">
                            {p.priority}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-extrabold text-slate-200">
                          {formatCurrency(p.projectValue)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          {formatCurrency(finances?.clientReceived || 0)} received
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-extrabold text-indigo-400">
                          {formatCurrency(finances?.teamPayrollCommitted || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatCurrency(finances?.teamPayrollPaid || 0)} paid
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="font-extrabold text-emerald-400">
                          {formatCurrency(finances?.expectedProfit || 0)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formatPercentage(finances?.profitMargin || 0)} margin
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <ProgressBar progress={p.taskProgress || 0} showLabel size="sm" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/projects/${p._id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                            title="Open Project Workspace"
                          >
                            <span>Workspace</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                          {(isAdmin || isPM) && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingId(p._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingProject}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project Details' : 'Create New Project'}
        maxWidth="2xl"
      >
        <form onSubmit={editingProject ? handleSaveEdit : handleSaveCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. NextGen Web & Mobile App"
            />
            <Input
              label="Project ID"
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              placeholder="e.g. PRJ-101"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Client"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              options={clients.map((c) => ({ value: c._id, label: `${c.companyName} (${c.name})` }))}
              placeholder="Select Client"
            />
            <Select
              label="Project Manager"
              required
              value={formData.projectManager}
              onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
              options={pms.map((m) => ({ value: m._id, label: `${m.name} (${m.role})` }))}
              placeholder="Select Manager"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contract Value ($)"
              type="number"
              required
              min={0}
              value={formData.projectValue}
              onChange={(e) => setFormData({ ...formData, projectValue: Number(e.target.value) })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'planning', label: 'Planning' },
                { value: 'active', label: 'Active' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="Expected End Date"
              type="date"
              required
              value={formData.expectedEndDate}
              onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
            />
          </div>

          <Input
            label="Technologies (comma separated)"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="React, TypeScript, Node.js, PostgreSQL, AWS"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Project Scope & Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High level objectives, key tranches, and delivery specifications..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProject(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProject ? 'Save Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks, team payroll records, milestone payouts, client invoices, and expenses will also be permanently deleted."
        confirmText="Delete Project"
      />
    </div>
  );
};
