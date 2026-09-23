import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';

interface ReportState {
  revenueReport: any | null;
  payrollReport: any | null;
  profitReport: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  revenueReport: null,
  payrollReport: null,
  profitReport: null,
  isLoading: false,
  error: null,
};

export const fetchRevenueReport = createAsyncThunk(
  'reports/fetchRevenueReport',
  async (params: any | void, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/revenue', { params: params || {} });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue report');
    }
  }
);

export const fetchPayrollReport = createAsyncThunk(
  'reports/fetchPayrollReport',
  async (params: any | void, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/payroll', { params: params || {} });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll report');
    }
  }
);

export const fetchProfitReport = createAsyncThunk(
  'reports/fetchProfitReport',
  async (params: any | void, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/profit', { params: params || {} });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profit report');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueReport = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPayrollReport.fulfilled, (state, action) => {
        state.payrollReport = action.payload;
      })
      .addCase(fetchProfitReport.fulfilled, (state, action) => {
        state.profitReport = action.payload;
      });
  },
});

export default reportSlice.reducer;
