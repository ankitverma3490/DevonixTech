import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { IUser } from '../../types/index.js';

interface TeamState {
  team: IUser[];
  selectedMember: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  team: [],
  selectedMember: null,
  isLoading: false,
  error: null,
};

export const fetchTeam = createAsyncThunk<IUser[], any | void>(
  'team/fetchTeam',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/team', { params: params || {} });
      return response.data.team;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team');
    }
  }
);

export const fetchTeamMemberById = createAsyncThunk(
  'team/fetchTeamMemberById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/team/${id}`);
      return response.data.teamMember;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch member details');
    }
  }
);

export const createTeamMember = createAsyncThunk(
  'team/createTeamMember',
  async (data: Partial<IUser>, { rejectWithValue }) => {
    try {
      const response = await api.post('/team', data);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team member');
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  'team/updateTeamMember',
  async ({ id, data }: { id: string; data: Partial<IUser> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/team/${id}`, data);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update team member');
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  'team/deleteTeamMember',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/team/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete team member');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearSelectedMember: (state) => {
      state.selectedMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.team = action.payload;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTeamMemberById.fulfilled, (state, action) => {
        state.selectedMember = action.payload;
      })
      .addCase(createTeamMember.fulfilled, (state, action) => {
        state.team.unshift(action.payload);
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.team.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.team[index] = { ...state.team[index], ...action.payload };
        }
        if (state.selectedMember?._id === action.payload._id) {
          state.selectedMember = { ...state.selectedMember, ...action.payload };
        }
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.team = state.team.filter((u) => u._id !== action.payload);
      });
  },
});

export const { clearSelectedMember } = teamSlice.actions;
export default teamSlice.reducer;
