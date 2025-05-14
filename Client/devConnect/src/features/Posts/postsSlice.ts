import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {createPost, deletePost, getPosts, likePost} from './postsApi'

// Thunks
export const createPostThunk = createAsyncThunk(
    'posts/createPost',
    async (post: { title: string; content: string; image?: string }, thunkAPI) => {
        try {
            const response = await createPost(post)
            return response
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong')
        }
    }
)

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (_, thunkAPI) => {
        try {
            const response = await getPosts()
            return response
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong')
        }
    }
)

export const erasePost = createAsyncThunk(
    'posts/deletePost',
    async (id: string, thunkAPI) => {
        try {
            const response = await deletePost(id)
            return response
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong')
        }
    }
)
export const likesPost = createAsyncThunk(
    'posts/likesPost',
    async (id: string, thunkAPI) => {
        try {
            const response = await likePost(id)
            return response
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Something went wrong')
        }
    }
)
// Types
interface Post {
    _id: string
    title: string
    content: string
    image: string
    createdAt: Date
    updatedAt: Date
}

interface PostsState {
    posts: Post[]
    loading: boolean
    error: string | null
    isLoggedIn: boolean
    postCreated: boolean
    postDeleted: boolean
}

// Initial State
const initialState: PostsState = {
    posts: [],
    loading: false,
    error: null,
    isLoggedIn: false,
    postCreated: false,
    postDeleted: false
}

// Slice
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        resetPostFlags: (state) => {
            state.postCreated = false
            state.postDeleted = false
        }
    },
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(createPostThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createPostThunk.fulfilled, (state, action) => {
                state.posts.unshift(action.payload)
                state.loading = false
                state.error = null
                state.postCreated = true
            })
            .addCase(createPostThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Fetch
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.posts = action.payload
                state.loading = false
                state.error = null
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Delete
            .addCase(erasePost.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(erasePost.fulfilled, (state, action) => {
                state.posts = state.posts.filter(post => post._id !== action.payload._id)
                state.loading = false
                state.error = null
                state.postDeleted = true
            })
            .addCase(erasePost.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            }).addCase(likesPost.fulfilled, (state) => {
            state.loading = false;
            state.error = null;
        }).addCase(likesPost.rejected, (state,action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
    }
})

// Export actions and reducer
export const { resetPostFlags } = postsSlice.actions
export default postsSlice.reducer
