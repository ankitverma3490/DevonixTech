import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { RootState, AppDispatch } from '../store/index.js';
import { setUser } from '../store/slices/authSlice.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { api } from '../services/api.js';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reset Demo DB
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    try {
      const response = await api.put(`/team/${user._id}`, {
        name,
        phone,
        whatsapp,
        skills: skills.split(',').map((s) => s.trim()),
      });
      dispatch(setUser(response.data.user));
      setProfileMessage('Profile information saved successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetDemoData = async () => {
    if (
      window.confirm(
        'Reset all database collections (clients, projects, tasks, payrolls, payments, expenses) to fresh initial agency data?'
      )
    ) {
      setIsResetting(true);
      setResetMessage(null);
      try {
        const response = await api.post('/auth/reset-demo-data');
        setResetMessage(response.data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to reset demo data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Account & System Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal profile, credentials, and agency workspace preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card title="Personal Profile Information">
        {profileMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input label="Email Address" disabled value={user?.email || ''} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+15550000000"
            />
          </div>

          <Input
            label="Skills / Specializations (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js, Go"
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingProfile}
              icon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card title="Change Password">
        {passwordMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{passwordMessage}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="secondary"
              isLoading={isChangingPassword}
              icon={<Lock className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Admin Demo Reset Card */}
      {user?.role === 'admin' && (
        <Card title="Database & Demo Dataset Management" className="border-rose-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Restore Demo Agency Data</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Resets all sample clients, active projects, tasks, milestones, payments, and expenses to their initial pre-configured state.
              </p>
              {resetMessage && (
                <p className="text-xs text-emerald-400 font-bold mt-2">{resetMessage}</p>
              )}
            </div>
            <Button
              type="button"
              variant="danger"
              isLoading={isResetting}
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetDemoData}
            >
              Reset Demo Database
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
