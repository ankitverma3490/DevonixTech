import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import clientReducer from './slices/clientSlice.js';
import projectReducer from './slices/projectSlice.js';
import taskReducer from './slices/taskSlice.js';
import teamReducer from './slices/teamSlice.js';
import payrollReducer from './slices/payrollSlice.js';
import paymentReducer from './slices/paymentSlice.js';
import expenseReducer from './slices/expenseSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import reportReducer from './slices/reportSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    projects: projectReducer,
    tasks: taskReducer,
    team: teamReducer,
    payroll: payrollReducer,
    payments: paymentReducer,
    expenses: expenseReducer,
    dashboard: dashboardReducer,
    reports: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
