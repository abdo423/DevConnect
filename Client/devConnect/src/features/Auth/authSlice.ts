import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {loginUser, registerUser, logoutUser, checkLogin} from "@/features/Auth/authApi.ts";
import {updateProfileThunk} from "@/features/Profile/profileSlice.ts";
interface User {
    user: {
        _id: string;
        username: string;
        email: string;
        avatar: string;
        bio: string;
        posts: Array<{
            _id: string;
            title: string;
            content: string;
            author_id: string;
            image: string;
            likes: Array<{
                user: string;
                createdAt: string;
            }>;
            comments: Array<any>;
            createdAt: string;
            updatedAt: string;
        }>;
        followers: string[];
        following: string[];
        createdAt: string;
        updatedAt: string;
    } | null;
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
}
export const login = createAsyncThunk('Auth/login', async (credentials: {
    email: string,
    password: string
}, thunkAPI) => {
    try {
        const response = await loginUser(credentials)

        return response
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message  || "Something went wrong")
    }
})
export const register = createAsyncThunk('Auth/register', async (credentials: {
    email: string,
    password: string,
    username: string,


}, thunkAPI) => {
    try {
        const response = await registerUser(credentials);
        return response;
    } catch (error: any) {

        return thunkAPI.rejectWithValue(error.message|| "Something went wrong")
    }
})
//logout
export const logout = createAsyncThunk('Auth/logout', async (_, thunkAPI) => {
    try {
        const response = await logoutUser();

        return response;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message || "Something went wrong");
    }
})

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




const initialState: User = {
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
                state.isLoggedIn = false;  // Ensuring the loggedIn state is updated
            }, updateUser: (state, action) => {
                state.user = action.payload;
            },
        },
        extraReducers: (builder) => {
            builder.addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            }).addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.loading = false;
                state.error = null;
                state.isLoggedIn = true;
            }).addCase(login.rejected, (state, action) => {
                state.loading = false;
                    state.error =  action.error?.message || "Something went wrong";

                state.isLoggedIn = false;
            }).addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            }).addCase(register.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
                state.error = null;
                state.isLoggedIn = true; // Mark as logged in after registration
            }).addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isLoggedIn = false;
            }).addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;

            }).addCase(logout.fulfilled, (state) => {
                state.isLoggedIn = false;
                state.user = null;
                state.loading = false;
                state.error = null;
            }).addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            }).addCase(fetchCurrentUser.pending, (state) => {
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

                }).addCase(updateProfileThunk.pending, (state) => {
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
    })
;


export const {updateUser} = authSlice.actions
// Mark as logged in
export default authSlice.reducer