import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {loginUser} from "@/features/auth/authApi.ts";

//import type { PayloadAction } from '@reduxjs/toolkit'

export const login = createAsyncThunk('auth/login', async (credentials: {
    username: string,
    password: string
}, thunkAPI) => {
    try {
        const response = await loginUser(credentials)
        return response
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response.data.message || "Something went wrong")
    }
})

interface AuthState {
    user: any;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
};
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
        },
    }, extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;

        }).addCase(login.fulfilled, (state, action) => {
            state.user = action.payload;
            state.loading = false;
            state.error = null;
        }).addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    }

})
export const {} = authSlice.actions

export default authSlice.reducer