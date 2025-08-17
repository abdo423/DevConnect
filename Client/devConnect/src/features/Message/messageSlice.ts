import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createMessage as apiCreateMessage,getMessagesBetweenUsers as getMessagesBetweenUsersApi  } from '../Message/messageApi.ts';
import ApiError from "../../../Types/apiError.ts";

// ---- Define Types ----
interface User {
    _id: string;
    username: string;
    avatar: string;
}

interface Message {
    _id: string;
    text: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

interface MessageState {
    messages: Message[];
    users: User[];
    loading: boolean;
    success: boolean;
    error: string | null;
}

// ---- Initial State ----
const initialState: MessageState = {
    messages: [],
    users: [],
    loading: false,
    success: false,
    error: null,
};

// ---- Async Thunk ----
export const createMessage = createAsyncThunk(
    'message/createMessage',
    async (messageData: { content: string; receiverId: string }, { rejectWithValue }) => {
        try {
            const response = await apiCreateMessage(messageData);
            return response; // Should include messages, users, count
        } catch (err: unknown) {
            const error = err as ApiError;
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);
export const getMessagesBetweenUsers = createAsyncThunk(
    'message/getMessagesBetweenUsers',
    async (id:string, { rejectWithValue }) => {
        try {
            const response = await getMessagesBetweenUsersApi(id);
            return response;
        } catch (err: unknown) {
            const error = err as ApiError;
            return rejectWithValue(error.message || 'Failed to fetch messages');
        }
    }
);
// ---- Slice ----
const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        resetMessageState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createMessage.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(createMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.error = null;

                // Save new messages & users from API response
                state.messages.push(action.payload.data)
                //state.users = action.payload.users;
            })
            .addCase(createMessage.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload as string;
            }).addCase(getMessagesBetweenUsers.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
        }).addCase(getMessagesBetweenUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = null;
            state.messages = action.payload.messages;
            state.users = action.payload.users;
        }).addCase(getMessagesBetweenUsers.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload as string;
        })
    }
});

// ---- Exports ----
export const { resetMessageState } = messageSlice.actions;
export default messageSlice.reducer;
