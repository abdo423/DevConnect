import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authSlice from '@/features/Auth/authSlice.ts'
import postsSlice from "@/features/Posts/postsSlice.ts"
import ProfileSlice from "@/features/Profile/profileSlice.ts"
import messageSlice from "@/features/Message/messageSlice.ts"
import followingSlice from "@/features/Following/followingSlice.ts"
import commentsSlice from "@/features/Comments/commentsSlice.ts"

// Create the root reducer independently to obtain the RootState type
const rootReducer = combineReducers({
    auth: authSlice,
    post: postsSlice,
    profile: ProfileSlice,
    message: messageSlice,
    following: followingSlice,
    comments: commentsSlice,
})

export function setupStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
        preloadedState,
    })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
