import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  CheckSquare,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import { fetchTeamMemberById } from '../store/slices/teamSlice.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { formatINR, formatDate } from '../utils/formatters.js';

export const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedMember, isLoading } = useSelector((state: RootState) => state.team);

  useEffect(() => {
    if (id) {
      dispatch(fetchTeamMemberById(id));
    }
  }, [dispatch, id]);

  if (isLoading || !selectedMember) {
    return <LoadingSpinner message="Loading team member profile..." />;
  }

  const projects = selectedMember.projects || [];
  const milestones = selectedMember.milestones || [];
  const tasks = selectedMember.tasks || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to="/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Team Directory
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                selectedMember.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`
              }
              alt={selectedMember.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 object-cover border-2 border-indigo-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {selectedMember.name}
                </h2>
                <Badge variant="status" status={selectedMember.status}>
                  {selectedMember.status}
                </Badge>
              </div>
              <p className="text-xs text-indigo-400 font-semibold mt-1 capitalize flex items-center gap-2">
                <span>{selectedMember.role?.replace('_', ' ')}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Joined {formatDate(selectedMember.joiningDate)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">Paid in INR (₹)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial KPIs for Member (Strictly INR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-l-4 border-l-blue-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Agreed Earnings (INR)
          </span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {formatINR(selectedMember.totalAgreedEarnings || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">{projects.length} Assigned Projects</div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Paid Out (INR)
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {formatINR(selectedMember.totalPaid || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Settled project milestones</div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Payments (INR)
          </span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {formatINR(selectedMember.pendingPayments || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">To be settled upon completion</div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tasks Completed
          </span>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">
            {selectedMember.completedTasksCount || 0}{' '}
            <span className="text-xs font-normal text-slate-400">/ {tasks.length}</span>
          </div>
          <ProgressBar
            progress={
              tasks.length > 0
                ? ((selectedMember.completedTasksCount || 0) / tasks.length) * 100
                : 0
            }
            size="sm"
            className="mt-2"
          />
        </Card>
      </div>

      {/* Member Details & Skills */}
      <Card title="Member Contact & Skills Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Email Address</span>
            <div className="text-slate-200 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <a href={`mailto:${selectedMember.email}`} className="hover:underline">
                {selectedMember.email}
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Phone</span>
            <div className="text-slate-200 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>{selectedMember.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">WhatsApp</span>
            <div className="text-slate-200 font-medium">
              <span>{selectedMember.whatsapp || 'N/A'}</span>
            </div>
          </div>
        </div>

        {selectedMember.skills && selectedMember.skills.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Skills & Technical Expertise
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedMember.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 text-xs font-medium border border-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedMember.notes && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Internal Profile Notes
            </span>
            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {selectedMember.notes}
            </p>
          </div>
        )}
      </Card>

      {/* Assigned Projects Table */}
      <Card
        title="Assigned Projects & Agreed Compensation"
        subtitle="Individual project compensation breakdown and payout progress in INR (₹)"
      >
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No assigned projects.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">Project</th>
                  <th className="pb-3 px-4">Role in Project</th>
                  <th className="pb-3 px-4">Project Status</th>
                  <th className="pb-3 px-4 text-right">Agreed Payment (INR)</th>
                  <th className="pb-3 px-4 text-right">Paid Amount (INR)</th>
                  <th className="pb-3 px-4 text-right">Pending Amount (INR)</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p: any) => {
                  const prj = p.project || {};
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-slate-200">
                        <div>{prj.name || 'Project'}</div>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {prj.projectId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-300">{p.role}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="status" status={prj.status || 'active'} size="sm">
                          {prj.status || 'active'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-white">
                        {formatINR(p.agreedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatINR(p.totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                        {formatINR(p.pendingAmount)}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          to={`/projects/${prj._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                        >
                          Workspace <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Milestone Payment History */}
      <Card
        title="Milestone Settlement History"
        subtitle="Individual milestone tranches and disbursements in INR (₹)"
      >
        {milestones.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No milestone records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">Milestone Title</th>
                  <th className="pb-3 px-4">Project</th>
                  <th className="pb-3 px-4 text-right">Amount (INR)</th>
                  <th className="pb-3 px-4">Due Date</th>
                  <th className="pb-3 px-4">Paid Date</th>
                  <th className="pb-3 px-4">Method & Transaction</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {milestones.map((ms: any) => (
                  <tr key={ms._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-200">{ms.title}</td>
                    <td className="py-3.5 px-4 text-indigo-400 font-mono text-[11px]">
                      {ms.project?.name || 'Project'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                      {formatINR(ms.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(ms.dueDate)}</td>
                    <td className="py-3.5 px-4 text-slate-300">{formatDate(ms.paidDate)}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="capitalize font-medium">
                        {ms.paymentMethod?.replace('_', ' ')}
                      </span>
                      {ms.transactionId && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {ms.transactionId}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <Badge variant="status" status={ms.status} size="sm">
                        {ms.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
