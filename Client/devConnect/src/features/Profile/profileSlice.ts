import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {followUser, getProfile, getProfileById, updateProfile} from '@/features/Profile/profileApi.ts'; // Your API service
import ProfileState from "../../../Types/profile.ts";
interface APIError {

    message: string;

}
// Define the profile state type

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
        } catch (err: unknown) {
            const error = err as APIError;
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
        }catch (err: unknown) {
            const error = err as APIError;
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
        } catch (err: unknown) {
            const error = err as APIError;
            return rejectWithValue(error.message || 'Failed to fetch profile');
        }
    }
)
export const updateProfileThunk = createAsyncThunk(
    'profile/updateProfile',
    async ({id,profile}:{id:string;profile:{username:string,bio:string,avatar?:string,}}, { rejectWithValue }) => {
        try {
            const response = await updateProfile(id,profile);

            return response;
        }catch (err: unknown) {
            const error = err as APIError;
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

        }).addCase(getProfileByIdThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        }).addCase(followUserThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(followUserThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.profile = action.payload.user;

        }).addCase(followUserThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        }).addCase(updateProfileThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        }).addCase(updateProfileThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.profile = action.payload.user;

        }).addCase(updateProfileThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    },
});

// Export actions
export const { clearProfile } = profileSlice.actions;


// Export the reducer
export default profileSlice.reducer;