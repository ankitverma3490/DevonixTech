import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users2,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Eye,
  Briefcase,
  DollarSign,
  CheckSquare,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import {
  fetchTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../store/slices/teamSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { Modal } from '../components/common/Modal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { Badge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatCurrency } from '../utils/formatters.js';
import { IUser } from '../types/index.js';

export const Team: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { team, isLoading } = useSelector((state: RootState) => state.team);
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<IUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team_member' as any,
    phone: '',
    whatsapp: '',
    skills: 'React, TypeScript, Node.js',
    status: 'active' as any,
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchTeam({ search, role: roleFilter, status: statusFilter }));
  }, [dispatch, search, roleFilter, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Agency@1234',
      role: 'team_member',
      phone: '',
      whatsapp: '',
      skills: 'React, TypeScript, Node.js',
      status: 'active',
      notes: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (member: IUser) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
      phone: member.phone || '',
      whatsapp: member.whatsapp || '',
      skills: Array.isArray(member.skills) ? member.skills.join(', ') : '',
      status: member.status,
      notes: member.notes || '',
    });
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(
      createTeamMember({
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()),
      })
    );
    if (createTeamMember.fulfilled.match(res)) {
      setIsCreateOpen(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const payload: any = {
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()),
    };
    if (!payload.password) delete payload.password;

    const res = await dispatch(updateTeamMember({ id: editingMember._id, data: payload }));
    if (updateTeamMember.fulfilled.match(res)) {
      setEditingMember(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await dispatch(deleteTeamMember(deletingId));
    setDeletingId(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Team Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineers, designers, managers, and project-based compensation records
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Add Team Member
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            placeholder="Search by member name, email, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'project_manager', label: 'Project Manager' },
              { value: 'team_member', label: 'Team Member' },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Members' },
              { value: 'inactive', label: 'Inactive Members' },
            ]}
          />
        </div>
      </Card>

      {/* Team Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading team directory..." />
      ) : team.length === 0 ? (
        <EmptyState
          icon={<Users2 className="w-8 h-8 text-indigo-400" />}
          title="No team members found"
          description={search ? 'No members match your search.' : 'Add your agency team members.'}
          actionText={isAdmin ? 'Add Team Member' : undefined}
          onAction={isAdmin ? handleOpenCreate : undefined}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Skills</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Agreed Earnings</th>
                  <th className="py-3.5 px-4 text-right">Paid / Pending</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {team.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            m.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`
                          }
                          alt={m.name}
                          className="w-9 h-9 rounded-full bg-slate-800 object-cover border border-indigo-500/30"
                        />
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{m.name}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-indigo-400 capitalize">
                        {m.role.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {m.projectCount || 0} projects
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {m.skills?.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                        {m.skills?.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{m.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="status" status={m.status} size="sm">
                        {m.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-extrabold text-slate-200">
                      {formatCurrency(m.totalAgreedEarnings || 0)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-extrabold text-emerald-400">
                        {formatCurrency(m.totalPaid || 0)}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-400">
                        {formatCurrency(m.pendingPayments || 0)} pending
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/team/${m._id}`}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="View Profile & Earnings"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Member"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {m._id !== user?._id && (
                              <button
                                onClick={() => setDeletingId(m._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit Team Member Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingMember}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingMember(null);
        }}
        title={editingMember ? 'Edit Team Member' : 'Add New Team Member'}
        maxWidth="lg"
      >
        <form onSubmit={editingMember ? handleSaveEdit : handleSaveCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. David Chen"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="david.dev@agency.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              options={[
                { value: 'team_member', label: 'Team Member' },
                { value: 'project_manager', label: 'Project Manager' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <Input
              label={editingMember ? 'New Password (leave blank to keep)' : 'Password'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="WhatsApp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+15550000000"
            />
          </div>

          <Input
            label="Skills & Technologies (comma separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="React, TypeScript, Node.js, Next.js, GraphQL"
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Internal Notes / Specialization
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Senior specialist in real-time streaming architectures..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingMember(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingMember ? 'Save Changes' : 'Create Team Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member from the agency directory?"
        confirmText="Remove Member"
      />
    </div>
  );
};
