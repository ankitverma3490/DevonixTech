import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Users2,
  DollarSign,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store/index.js';
import { logout } from '../../store/slices/authSlice.js';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'project_manager', 'team_member'],
    },
    {
      label: 'Clients',
      path: '/clients',
      icon: <Users className="w-4 h-4" />,
      roles: ['admin', 'project_manager'],
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: <Briefcase className="w-4 h-4" />,
      roles: ['admin', 'project_manager', 'team_member'],
    },
    {
      label: 'Tasks',
      path: '/tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      roles: ['admin', 'project_manager', 'team_member'],
    },
    {
      label: 'Team',
      path: '/team',
      icon: <Users2 className="w-4 h-4" />,
      roles: ['admin', 'project_manager', 'team_member'],
    },
    {
      label: 'Project Payroll',
      path: '/payroll',
      icon: <DollarSign className="w-4 h-4" />,
      roles: ['admin', 'project_manager', 'team_member'],
    },
    {
      label: 'Client Payments',
      path: '/payments',
      icon: <CreditCard className="w-4 h-4" />,
      roles: ['admin', 'project_manager'],
    },
    {
      label: 'Expenses',
      path: '/expenses',
      icon: <Receipt className="w-4 h-4" />,
      roles: ['admin', 'project_manager'],
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin'],
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-4 h-4" />,
      roles: ['admin', 'project_manager', 'team_member'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            Agency<span className="text-indigo-400 font-black">Ops</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block -mt-0.5">
            Payroll & Project System
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="transition-transform group-hover:scale-110 duration-200">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
          </NavLink>
        ))}
      </div>

      {/* User Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full bg-slate-800 object-cover shrink-0 border border-indigo-500/30"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[10px] font-medium text-indigo-400 uppercase tracking-wide capitalize truncate">
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
