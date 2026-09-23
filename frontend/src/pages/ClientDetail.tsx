import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  Briefcase,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import { fetchClientById } from '../store/slices/clientSlice.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedClient, isLoading } = useSelector((state: RootState) => state.clients);

  useEffect(() => {
    if (id) {
      dispatch(fetchClientById(id));
    }
  }, [dispatch, id]);

  if (isLoading || !selectedClient) {
    return <LoadingSpinner message="Loading client profile..." />;
  }

  const projects = selectedClient.projects || [];
  const payments = selectedClient.payments || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients List
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-indigo-500/20">
              {selectedClient.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {selectedClient.companyName}
                </h2>
                <Badge variant="status" status={selectedClient.status}>
                  {selectedClient.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Primary Contact: {selectedClient.name}</span>
                <span>•</span>
                <span>{selectedClient.country}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial KPIs for Client */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Project Value
              </p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(selectedClient.totalProjectValue || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">{projects.length} Total Projects</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Received
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(selectedClient.totalReceived || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Collected Revenue</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pending
              </p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(selectedClient.totalPending || 0)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Outstanding balance to be collected</p>
        </Card>
      </div>

      {/* Client Information Details Card */}
      <Card title="Client & Contact Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Email</span>
            <div className="text-slate-200 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <a href={`mailto:${selectedClient.email}`} className="hover:underline">
                {selectedClient.email}
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Phone</span>
            <div className="text-slate-200 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>{selectedClient.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">WhatsApp</span>
            <div className="text-slate-200 font-medium">
              <span>{selectedClient.whatsapp || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Website</span>
            <div className="text-slate-200 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              {selectedClient.website ? (
                <a
                  href={selectedClient.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  {selectedClient.website}
                </a>
              ) : (
                'N/A'
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Address</span>
            <div className="text-slate-200 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{selectedClient.address || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Country</span>
            <div className="text-slate-200 font-medium">{selectedClient.country}</div>
          </div>
        </div>

        {selectedClient.notes && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Internal Agency Notes
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {selectedClient.notes}
            </p>
          </div>
        )}
      </Card>

      {/* Projects for this client */}
      <Card
        title="Associated Projects"
        subtitle={`Total of ${projects.length} project(s) commissioned by this client`}
      >
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No projects for this client yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">Project</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Priority</th>
                  <th className="pb-3 px-4">Manager</th>
                  <th className="pb-3 px-4">Project Value</th>
                  <th className="pb-3 px-4">Timeline</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-200">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-indigo-400 font-mono">{p.projectId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="status" status={p.status} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="priority" status={p.priority} size="sm">
                        {p.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {p.projectManager?.name || 'Assigned PM'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-200">
                      {formatCurrency(p.projectValue)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(p.startDate)} → {formatDate(p.expectedEndDate)}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <Link
                        to={`/projects/${p._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                      >
                        Workspace <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Client Payment History */}
      <Card
        title="Client Payment Transactions"
        subtitle="Complete ledger of payments received and pending invoices"
      >
        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No payment history recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pr-4">Project</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Due Date</th>
                  <th className="pb-3 px-4">Payment Date</th>
                  <th className="pb-3 px-4">Method & Transaction</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((pm: any) => (
                  <tr key={pm._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-200">
                      {pm.project?.name || 'Project'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-sm">
                      {formatCurrency(pm.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(pm.dueDate)}</td>
                    <td className="py-3.5 px-4 text-slate-300">{formatDate(pm.paymentDate)}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-medium capitalize">{pm.paymentMethod?.replace('_', ' ')}</div>
                      {pm.transactionId && (
                        <div className="text-[10px] text-slate-400 font-mono">{pm.transactionId}</div>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <Badge variant="status" status={pm.status} size="sm">
                        {pm.status}
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
