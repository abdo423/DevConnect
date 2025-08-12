import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {createPost, deletePost, getPosts, likePost, updatePost} from './postsApi';

// Thunks
export const createPostThunk = createAsyncThunk(
    'posts/createPost',
    async (post: { title: string; content: string; image?: string }, thunkAPI) => {
        try {
            const response = await createPost(post);
            return response.post;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);



export const PostUpdateThunk = createAsyncThunk(
    'posts/updatePost',
    async (
        { id, post }: { id: string; post: { title: string; content: string; image?: string } },
        thunkAPI
    ) => {
        try {
            const response = await updatePost(id, post);
            return response.post;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (_, thunkAPI) => {
        try {
            const response = await getPosts();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

export const erasePost = createAsyncThunk(
    'posts/deletePost',
    async (id: string, thunkAPI) => {
        try {
            const response = await deletePost(id);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

export const likesPost = createAsyncThunk(
    'posts/likesPost',
    async (id: string, thunkAPI) => {
        try {
            const response = await likePost(id);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong');
        }
    }
);

// Types
interface Post {
    _id: string;
    title: string;
    content: string;
    image: string;
    likes: string[];
    comments: string[];
    author_id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface PostsState {
    posts: Post[];
    loading: boolean;
    error: string | null;
    postCreated: boolean;
    postDeleted: boolean;
    postUpdated: boolean;
    currentPost: Post | null;
}

// Initial State
const initialState: PostsState = {
    posts: [],
    loading: false,
    error: null,
    postCreated: false,
    postDeleted: false,
    postUpdated: false,
    currentPost: null,
};

// Slice
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        resetPostFlags: (state) => {
            state.postCreated = false;
            state.postDeleted = false;
            state.postUpdated = false;
            state.error = null;
        },
        setCurrentPost: (state, action) => {
            state.currentPost = action.payload;
        },
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Post
            .addCase(createPostThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPostThunk.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
                state.loading = false;
                state.error = null;
                state.postCreated = true;
            })
            .addCase(createPostThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Posts
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.posts = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete Post
            .addCase(erasePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(erasePost.fulfilled, (state, action) => {
                const deletedId = action.payload.post._id;
                state.posts = state.posts.filter(post => post._id !== deletedId);
                state.loading = false;
                state.error = null;
                state.postDeleted = true;
            })
            .addCase(erasePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            }).addCase(PostUpdateThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(PostUpdateThunk.fulfilled, (state, action) => {
                const updatedPost = action.payload;
                state.posts = state.posts.map(post =>
                    post._id === updatedPost._id ? updatedPost : post
                );
                if (state.currentPost?._id === updatedPost._id) {
                    state.currentPost = updatedPost;
                }
                state.loading = false;
                state.error = null;
                state.postUpdated = true;
            })

            .addCase(PostUpdateThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

// Export actions and reducer
export const {
    resetPostFlags,
    setCurrentPost,
    clearCurrentPost
} = postsSlice.actions;

export default postsSlice.reducer;