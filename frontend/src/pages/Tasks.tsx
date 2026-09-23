import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckSquare,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Calendar,
  Trash2,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice.js';
import { fetchProjects } from '../store/slices/projectSlice.js';
import { fetchTeam } from '../store/slices/teamSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { Badge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { KanbanBoard } from '../components/kanban/KanbanBoard.js';
import { formatDate } from '../utils/formatters.js';
import { ITask, TaskStatus } from '../types/index.js';

export const Tasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { team } = useSelector((state: RootState) => state.team);
  const { user } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Add Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    project: '',
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as any,
    status: 'todo' as TaskStatus,
    dueDate: '',
  });

  const loadTasks = () => {
    dispatch(
      fetchTasks({
        project: projectFilter !== 'all' ? projectFilter : undefined,
        assignedTo: assigneeFilter !== 'all' ? assigneeFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      })
    );
  };

  useEffect(() => {
    loadTasks();
    dispatch(fetchProjects({}));
    dispatch(fetchTeam({}));
  }, [dispatch, projectFilter, assigneeFilter, priorityFilter]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await dispatch(updateTask({ id: taskId, data: { status: newStatus } }));
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      createTask({
        project: formData.project,
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo || undefined,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
      })
    );
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      await dispatch(deleteTask(taskId));
    }
  };

  const isAdminOrPM = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Agency Task Board</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track sprints, deliverables, assignments, and ticket progress across active projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {isAdminOrPM && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setFormData({
                  project: projects[0]?._id || '',
                  title: '',
                  description: '',
                  assignedTo: team[0]?._id || '',
                  priority: 'medium',
                  status: 'todo',
                  dueDate: '',
                });
                setIsModalOpen(true);
              }}
            >
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Filter by Project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Projects' },
              ...projects.map((p) => ({ value: p._id, label: `${p.name} (${p.projectId})` })),
            ]}
          />
          <Select
            label="Filter by Assignee"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Team Members' },
              ...team.map((m) => ({ value: m._id, label: m.name })),
            ]}
          />
          <Select
            label="Filter by Priority"
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
        </div>
      </Card>

      {/* Tasks View */}
      {isLoading ? (
        <LoadingSpinner message="Loading task boards..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8 text-indigo-400" />}
          title="No tasks found"
          description="Create a task or change your filter selection."
          actionText={isAdminOrPM ? 'Add Task' : undefined}
          onAction={isAdminOrPM ? () => setIsModalOpen(true) : undefined}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onAddTask={
            isAdminOrPM
              ? (status) => {
                  setFormData({
                    project: projects[0]?._id || '',
                    title: '',
                    description: '',
                    assignedTo: team[0]?._id || '',
                    priority: 'medium',
                    status,
                    dueDate: '',
                  });
                  setIsModalOpen(true);
                }
              : undefined
          }
          onDeleteTask={isAdminOrPM ? handleDeleteTask : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-6">Task</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  {isAdminOrPM && <th className="py-3 px-6 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-100">{t.title}</td>
                    <td className="py-3 px-4 text-indigo-400 font-mono text-[11px]">
                      {(t.project as any)?.name || 'Project'}
                    </td>
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
                    {isAdminOrPM && (
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

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Agency Task"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Select
            label="Project"
            required
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            options={projects.map((p) => ({ value: p._id, label: `${p.name} (${p.projectId})` }))}
            placeholder="Select Project"
          />

          <Input
            label="Task Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Implement WebRTC video signaling server"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned To"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={team.map((m) => ({ value: m._id, label: `${m.name} (${m.role})` }))}
              placeholder="Select Team Member"
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
              label="Initial Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Acceptance criteria, endpoints, branch names..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
