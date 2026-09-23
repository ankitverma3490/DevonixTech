import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Sparkles, UserCheck } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/index.js';
import { loginUser } from '../../store/slices/authSlice.js';

export const DemoRoleBanner: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const demoAccounts = [
    {
      role: 'admin',
      name: '👑 Admin (Alexander)',
      email: 'admin@agency.com',
      password: 'Agency@1234',
      badge: 'Full Access',
    },
    {
      role: 'project_manager',
      name: '💼 Project Manager (Sarah)',
      email: 'sarah.pm@agency.com',
      password: 'Agency@1234',
      badge: 'Assigned Projects',
    },
    {
      role: 'team_member',
      name: '💻 Dev Team (David)',
      email: 'david.dev@agency.com',
      password: 'Agency@1234',
      badge: 'Personal Earnings',
    },
  ];

  const handleSwitchRole = (email: string, pass: string) => {
    dispatch(loginUser({ email, password: pass }));
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Quick Switch:
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Test any role instantly:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {demoAccounts.map((acc) => {
          const isActive = user?.email === acc.email;
          return (
            <button
              key={acc.email}
              onClick={() => handleSwitchRole(acc.email, acc.password)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {isActive && <UserCheck className="w-3 h-3 text-emerald-300" />}
              <span>{acc.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'}`}>
                {acc.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
