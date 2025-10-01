import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  createComment,
  getComments,
  likeComment as likeCommentApi,
} from '@/features/Comments/CommentsApi.ts';

import { Comment } from '../../../Types/comment.ts';

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

// ✅ Fetch comments
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await getComments(postId);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// ✅ Add comment
export const addComment = createAsyncThunk(
  'comments/addComment',
  async (
    commentData: { post: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await createComment(commentData);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// ✅ Like comment
export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const response = await likeCommentApi(commentId);
      // should return { alreadyLiked: boolean, likes: [...] }
      return { commentId, ...response };
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
      // Fetch
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

      // Add
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
      })

      // 🔥 FIXED: Like comment handling
      .addCase(likeComment.pending, (state) => {
        // Optional: Add loading state for individual comment likes
        state.error = null;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, likes } = action.payload;

        const comment = state.comments.find((c) => c._id === commentId);
        if (comment) {
          comment.likes = likes; // ✅ Simple assignment now works!
        }
      })
      .addCase(likeComment.rejected, (state, action) => {
        // ✅ ADDED: Handle like errors
        state.error = action.payload as string;
      });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
