import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import {createComment, getComments} from "@/features/Commments/CommentApi.ts";



interface User {
    _id: string;
    username: string;
    avatar: string;
}

interface Comment {
    _id: string;
    user: User;
    post: string;
    content: string;
    createdAt: string;
    __v: number;
}

interface CommentsState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

const initialState: CommentsState = {
    comments: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchComments = createAsyncThunk(
    'comments/fetchComments',
    async (postId: string, { rejectWithValue }) => {
        try {
            const token = Cookies.get('auth-token');
            if (!token) {
                throw new Error('Not authenticated');
            }
            const response = getComments(postId);
            console.log(
                'response',
                response
            )
            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const addComment = createAsyncThunk(
    'comments/addComment',
    async (commentData: { post: string; content: string }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('auth-token');
            if (!token) {
                throw new Error('Not authenticated');
            }
            const response =  createComment(commentData);
            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

const commentsSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        clearComments: (state) => {
            state.comments = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Comments
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.comments;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Add Comment
            .addCase(addComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.unshift(action.payload.comment);
            })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;