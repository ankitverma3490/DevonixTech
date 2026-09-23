import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Mail, ArrowRight, Shield, UserCheck, Sparkles } from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import { loginUser } from '../store/slices/authSlice.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('admin@agency.com');
  const [password, setPassword] = useState('Agency@1234');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(res)) {
      navigate('/dashboard');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    dispatch(loginUser({ email: demoEmail, password: demoPass })).then((res) => {
      if (loginUser.fulfilled.match(res)) {
        navigate('/dashboard');
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">Sign In</h3>
        <p className="mt-1 text-xs text-slate-400">Enter your agency credentials to access your portal</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail className="w-4 h-4" />}
          placeholder="name@agency.com"
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <span />
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In to Workspace
        </Button>
      </form>

      {/* Quick Demo Logins Box */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant One-Click Demo Logins</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@agency.com', 'Agency@1234')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all text-left"
          >
            <div>
              <div className="text-xs font-bold text-slate-200">👑 Admin (Alexander Ross)</div>
              <div className="text-[10px] text-slate-400">Full agency finances, payroll & clients</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Admin
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('sarah.pm@agency.com', 'Agency@1234')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all text-left"
          >
            <div>
              <div className="text-xs font-bold text-slate-200">💼 Project Manager (Sarah)</div>
              <div className="text-[10px] text-slate-400">Assigned projects, tasks & delivery</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              PM
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('david.dev@agency.com', 'Agency@1234')}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all text-left"
          >
            <div>
              <div className="text-xs font-bold text-slate-200">💻 Dev Team (David Chen)</div>
              <div className="text-[10px] text-slate-400">Assigned tasks & project earnings</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Team
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
