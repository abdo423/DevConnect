import {configureStore} from '@reduxjs/toolkit'
import authSlice from '@/features/Auth/authSlice.ts'
import postsSlice from "@/features/Posts/postsSlice.ts";
import ProfileSlice from "@/features/Profile/profileSlice.ts";
import messageSlice from "@/features/Message/messageSlice.ts";
import followingSlice from "@/features/Following/followingSlice.ts";
import commentsSlice from "@/features/Commments/commentsSlice.ts";
export const store = configureStore({
    reducer: {
        auth: authSlice,
        post: postsSlice,
        profile:ProfileSlice,
        message:messageSlice,
        following:followingSlice,
        comments: commentsSlice,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch