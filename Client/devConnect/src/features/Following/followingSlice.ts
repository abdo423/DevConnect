// features/Following/followingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFollowings, getUserMessages } from '@/features/Following/followingApi.ts';

interface User {
    _id: string;
    username: string;  // changed from name to username to match backend?
    avatar?: string;
}
interface APIError {
    message: string;
}
interface FollowingState {
    following: User[] | null;
    unfollowedMessageSenders: User[]; // NEW FIELD
    loading: boolean;
    error: string | null;
    lastFetchedUserId: string | null;
}

const initialState: FollowingState = {
    following: null,
    unfollowedMessageSenders: [],
    loading: false,
    error: null,
    lastFetchedUserId: null,
};

// Fetch followings by user ID
export const fetchFollowings = createAsyncThunk<
    { following: User[]; userId: string },
    string,
    { rejectValue: string }
>(
    'following/fetchFollowings',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await getFollowings(userId);
            return {
                following: response.following,
                userId,
            };
        } catch (err: unknown) {
           const error = err as APIError;
            return rejectWithValue(error.message || 'Failed to fetch followings');
        }
    }
);

// Fetch users who sent messages but are NOT followed by current user
export const fetchUnfollowedMessageSenders = createAsyncThunk<
    User[],
    void,
    { state: { following: FollowingState }; rejectValue: string }
>(
    'following/fetchUnfollowedMessageSenders',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const followingIds = state.following.following?.map(user => user._id) || [];

            const response = await getUserMessages();

            // Filter senders not followed yet
            const unfollowedSenders = response.senders?.filter((sender: User) =>
                !followingIds.includes(sender._id)
            ) || [];

            return unfollowedSenders;
        } catch (err: unknown) {
            const error = err as APIError;
            return rejectWithValue(error.message || 'Failed to fetch followings');
        }
    }
);

const followingSlice = createSlice({
    name: 'following',
    initialState,
    reducers: {
        clearFollowings: (state) => {
            state.following = null;
            state.unfollowedMessageSenders = [];
            state.error = null;
            state.lastFetchedUserId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch followings
            .addCase(fetchFollowings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFollowings.fulfilled, (state, action) => {
                state.loading = false;
                state.following = action.payload.following;
                state.lastFetchedUserId = action.payload.userId;
            })
            .addCase(fetchFollowings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to fetch followings';
            })

            // Fetch unfollowed message senders
            .addCase(fetchUnfollowedMessageSenders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnfollowedMessageSenders.fulfilled, (state, action) => {
                state.loading = false;
                state.unfollowedMessageSenders = action.payload;
            })
            .addCase(fetchUnfollowedMessageSenders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to fetch unfollowed message senders';
            });
    },
});

// Actions
export const { clearFollowings } = followingSlice.actions;

// Reducer
export default followingSlice.reducer;
