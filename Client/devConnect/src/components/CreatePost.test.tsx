import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import CreatePost from '@/components/CreatePost'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreatePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create post form with all elements', () => {
    const preloadedState = {
      auth: createMockAuthState({ 
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
        isLoggedIn: true 
      }),
    }
    
    renderWithProviders(<CreatePost />, { preloadedState })
    
    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/write your thoughts/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument()
  })

  it('allows typing in title and content fields', async () => {
    const user = userEvent.setup()
    const preloadedState = {
      auth: createMockAuthState({ 
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
        isLoggedIn: true 
      }),
    }
    
    renderWithProviders(<CreatePost />, { preloadedState })
    
    const titleInput = screen.getByPlaceholderText(/what's on your mind/i)
    const contentInput = screen.getByPlaceholderText(/write your thoughts/i)
    
    await user.type(titleInput, 'Test Post Title')
    await user.type(contentInput, 'This is a test post content that is long enough to meet the minimum requirements')
    
    expect(titleInput).toHaveValue('Test Post Title')
    expect(contentInput).toHaveValue('This is a test post content that is long enough to meet the minimum requirements')
  })

  it('renders user avatar in the form', () => {
    const preloadedState = {
      auth: createMockAuthState({ 
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
        isLoggedIn: true 
      }),
    }
    
    renderWithProviders(<CreatePost />, { preloadedState })
    
    // Check for avatar fallback
    const avatarFallback = screen.getByText('t') // First letter of 'testuser'
    expect(avatarFallback).toBeInTheDocument()
  })

  it('has image upload functionality button', () => {
    const preloadedState = {
      auth: createMockAuthState({ 
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
        isLoggedIn: true 
      }),
    }
    
    renderWithProviders(<CreatePost />, { preloadedState })
    
    // Check for image upload button (ImagePlus icon button)
    const imageButton = screen.getByRole('button', { name: /image/i })
    expect(imageButton).toBeInTheDocument()
  })

  it('disables post button initially', () => {
    const preloadedState = {
      auth: createMockAuthState({ 
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
        isLoggedIn: true 
      }),
    }
    
    renderWithProviders(<CreatePost />, { preloadedState })
    
    const postButton = screen.getByRole('button', { name: /post/i })
    expect(postButton).toBeDisabled()
  })
})