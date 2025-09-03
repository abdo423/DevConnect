import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { configureStore, PreloadedState } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

// Import your slices
import authSlice from '@/features/Auth/authSlice.ts'
import postsSlice from '@/features/Posts/postsSlice.ts'
import ProfileSlice from '@/features/Profile/profileSlice.ts'
import messageSlice from '@/features/Message/messageSlice.ts'
import followingSlice from '@/features/Following/followingSlice.ts'
import commentsSlice from '@/features/Comments/commentsSlice.ts'
import { RootState } from '@/app/store'

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState<RootState>
  store?: ReturnType<typeof setupStore>
}

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      auth: authSlice,
      post: postsSlice,
      profile: ProfileSlice,
      message: messageSlice,
      following: followingSlice,
      comments: commentsSlice,
    },
    preloadedState,
  })
}

export type AppStore = ReturnType<typeof setupStore>

function AllTheProviders({ children, store }: { children: React.ReactNode; store: AppStore }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): RenderResult & { store: AppStore } {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders store={store}>{children}</AllTheProviders>
  )

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Create mock store states for testing
export const createMockAuthState = (overrides = {}) => ({
  user: {
    _id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatar: 'test-avatar.jpg',
    followers: [],
    following: [],
    posts: [],
  },
  loading: false,
  error: null,
  isLoggedIn: true,
  ...overrides,
})

export const createMockProfileState = (overrides = {}) => ({
  profile: {
    _id: 'test-profile-id',
    username: 'testprofile',
    email: 'profile@example.com',
    bio: 'Test profile bio',
    avatar: 'profile-avatar.jpg',
    followers: [],
    following: [],
    posts: [],
  },
  loading: false,
  error: null,
  ...overrides,
})

export const createMockPostsState = (overrides = {}) => ({
  posts: [],
  loading: false,
  error: null,
  ...overrides,
})

export const createMockPost = (overrides = {}) => ({
  _id: 'test-post-id',
  title: 'Test Post Title',
  content: 'Test post content',
  author: 'test-author-id',
  likes: [],
  comments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// Re-export everything
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'