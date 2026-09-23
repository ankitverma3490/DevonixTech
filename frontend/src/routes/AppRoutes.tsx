import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.js';
import { DashboardLayout } from '../components/layout/DashboardLayout.js';
import { ProtectedRoute } from './ProtectedRoute.js';

import { Login } from '../pages/Login.js';
import { ForgotPassword } from '../pages/ForgotPassword.js';
import { ResetPassword } from '../pages/ResetPassword.js';

import { Dashboard } from '../pages/Dashboard.js';
import { Clients } from '../pages/Clients.js';
import { ClientDetail } from '../pages/ClientDetail.js';
import { Projects } from '../pages/Projects.js';
import { ProjectDetail } from '../pages/ProjectDetail.js';
import { Tasks } from '../pages/Tasks.js';
import { Team } from '../pages/Team.js';
import { TeamDetail } from '../pages/TeamDetail.js';
import { Payroll } from '../pages/Payroll.js';
import { Payments } from '../pages/Payments.js';
import { Expenses } from '../pages/Expenses.js';
import { Reports } from '../pages/Reports.js';
import { Settings } from '../pages/Settings.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Clients (Admin & Project Manager) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'project_manager']} />}>
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
          </Route>

          {/* Projects & Details (All roles filtered internally) */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />

          {/* Tasks & Team (All roles) */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<TeamDetail />} />

          {/* Payroll (All roles: Admin full, PM project team, Team Member self) */}
          <Route path="/payroll" element={<Payroll />} />

          {/* Payments & Expenses (Admin & PM) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'project_manager']} />}>
            <Route path="/payments" element={<Payments />} />
            <Route path="/expenses" element={<Expenses />} />
          </Route>

          {/* Reports (Admin Only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Default redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
