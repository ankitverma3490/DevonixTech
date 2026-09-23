import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, RefreshCw } from 'lucide-react';
import { RootState, AppDispatch } from '../../store/index.js';
import { logout } from '../../store/slices/authSlice.js';
import { api } from '../../services/api.js';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data (clients, projects, tasks, payrolls, payments) back to original demo state?')) {
      try {
        setIsResetting(true);
        await api.post('/auth/reset-demo-data');
        window.location.reload();
      } catch (e) {
        alert('Failed to reset data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="h-16 px-8 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-300">
          Agency Workspace: <span className="text-indigo-400 font-bold capitalize">{user?.role?.replace('_', ' ')} Portal</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === 'admin' && (
          <button
            onClick={handleResetData}
            disabled={isResetting}
            title="Reset demo data"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Reset Demo DB</span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-indigo-500/40 bg-slate-800 object-cover"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-200">{user?.name}</div>
            <div className="text-[10px] text-slate-400">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
