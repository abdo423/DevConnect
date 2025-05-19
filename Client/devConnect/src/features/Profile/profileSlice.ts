import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {followUser, getProfile, getProfileById} from '@/features/Profile/profileApi.ts'; // Your API service

// Define the profile state type
interface ProfileState {
    profile: {
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
}

// Initial state
const initialState: ProfileState = {
    profile: null,
    loading: false,
    error: null,
};

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {

            const response = await getProfile();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch profile');
        }
    }
);

export const getProfileByIdThunk = createAsyncThunk(
    'profile/getProfileById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await getProfileById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch profile');
        }
    }
)
export const followUserThunk = createAsyncThunk(
    'profile/followUser',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await followUser(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch profile');
        }
    }
)
// Create the slice
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        // Optional synchronous reducers
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            }).addCase(getProfileByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
        }).addCase(getProfileByIdThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.profile = action.payload;
           // console.log(action.payload);
        }).addCase(getProfileByIdThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        }).addCase(followUserThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(followUserThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.profile = action.payload.user;
            console.log(action.payload);
        }).addCase(followUserThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    },
});

// Export actions
export const { clearProfile } = profileSlice.actions;


// Export the reducer
export default profileSlice.reducer;