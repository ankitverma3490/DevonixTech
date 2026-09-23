import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { IPayroll, IPayrollMilestone } from '../../types/index.js';

interface PayrollState {
  payrolls: IPayroll[];
  selectedPayroll: IPayroll | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PayrollState = {
  payrolls: [],
  selectedPayroll: null,
  isLoading: false,
  error: null,
};

export const fetchPayrolls = createAsyncThunk(
  'payroll/fetchPayrolls',
  async (params: any | void, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll', { params: params || {} });
      return response.data.payrolls;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll');
    }
  }
);

export const createPayroll = createAsyncThunk(
  'payroll/createPayroll',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/payroll', data);
      return response.data.payroll;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign team member');
    }
  }
);

export const updatePayroll = createAsyncThunk(
  'payroll/updatePayroll',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payroll/${id}`, data);
      return response.data.payroll;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payroll');
    }
  }
);

export const deletePayroll = createAsyncThunk(
  'payroll/deletePayroll',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/payroll/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete assignment');
    }
  }
);

export const addMilestone = createAsyncThunk(
  'payroll/addMilestone',
  async ({ payrollId, data }: { payrollId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payroll/${payrollId}/milestones`, data);
      return { payrollId, milestone: response.data.milestone };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add milestone');
    }
  }
);

export const updateMilestone = createAsyncThunk(
  'payroll/updateMilestone',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payroll/milestones/${id}`, data);
      return response.data.milestone;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update milestone');
    }
  }
);

export const deleteMilestone = createAsyncThunk(
  'payroll/deleteMilestone',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/payroll/milestones/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete milestone');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payrolls = action.payload;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPayroll.fulfilled, (state, action) => {
        state.payrolls.unshift(action.payload);
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const index = state.payrolls.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.payrolls[index] = { ...state.payrolls[index], ...action.payload };
        }
      })
      .addCase(deletePayroll.fulfilled, (state, action) => {
        state.payrolls = state.payrolls.filter((p) => p._id !== action.payload);
      });
  },
});

export default payrollSlice.reducer;
