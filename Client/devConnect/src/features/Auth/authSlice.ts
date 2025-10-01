import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  checkLogin,
  loginUser,
  logoutUser,
  registerUser,
} from '@/features/Auth/authApi.ts';
import { updateProfileThunk } from '@/features/Profile/profileSlice.ts';
import User from 'Types/user.ts';

interface APIError {
  message: string;
}
export const login = createAsyncThunk(
  'Auth/login',
  async (
    credentials: {
      email: string;
      password: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await loginUser(credentials);

      return response;
    } catch (err: unknown) {
      const error = err as APIError;
      return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
export const register = createAsyncThunk(
  'Auth/register',
  async (
    credentials: {
      email: string;
      password: string;
      username: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await registerUser(credentials);
      return response;
    } catch (err: unknown) {
      const error = err as APIError;
      return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
    }
  }
);
//logout
export const logout = createAsyncThunk('Auth/logout', async (_, thunkAPI) => {
  try {
    const response = await logoutUser();

    return response;
  } catch (err: unknown) {
    const error = err as APIError;
    return thunkAPI.rejectWithValue(error.message || 'Something went wrong');
  }
});

export const fetchCurrentUser = createAsyncThunk(
  'Auth/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const user = await checkLogin();
      return user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  }
);

interface AuthState {
  user: User | null; // 👈 the actual user
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isLoggedIn = false; // Ensuring the loggedIn state is updated
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Something went wrong';

        state.isLoggedIn = false;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
        state.isLoggedIn = true; // Mark as logged in after registration
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isLoggedIn = false;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        // Update user data when profile is updated
        if (action.payload.user) {
          state.user = action.payload.user;
          state.loading = false;
          state.error = null;
        }
      });
  },
});
export const { updateUser } = authSlice.actions;
// Mark as logged in
export default authSlice.reducer;
