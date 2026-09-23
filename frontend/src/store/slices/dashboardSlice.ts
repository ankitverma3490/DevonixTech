import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { IDashboardSummary } from '../../types/index.js';

interface DashboardState {
  data: IDashboardSummary | null;
  revenueChart: any[];
  profitChart: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  revenueChart: [],
  profitChart: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchRevenueChart = createAsyncThunk(
  'dashboard/fetchRevenueChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/revenue');
      return response.data.chartData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue chart');
    }
  }
);

export const fetchProfitChart = createAsyncThunk(
  'dashboard/fetchProfitChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/profit');
      return response.data.projectProfits;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profit chart');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.revenueChart = action.payload;
      })
      .addCase(fetchProfitChart.fulfilled, (state, action) => {
        state.profitChart = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
