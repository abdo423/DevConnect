import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import PrivateRoutes from '@/components/PrivateRoutes'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
    Outlet: () => <div data-testid="outlet">Protected Content</div>,
  }
})

describe('PrivateRoutes', () => {
  it('renders loading state when auth is loading', () => {
    const preloadedState = {
      auth: createMockAuthState({ loading: true, user: null, isLoggedIn: false }),
    }
    
    renderWithProviders(<PrivateRoutes />, { preloadedState })
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    const preloadedState = {
      auth: createMockAuthState({ user: null, isLoggedIn: false, loading: false }),
    }
    
    renderWithProviders(<PrivateRoutes />, { preloadedState })
    
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/login')
  })

  it('redirects to login when there is an error', () => {
    const preloadedState = {
      auth: createMockAuthState({ 
        user: null, 
        isLoggedIn: false, 
        loading: false, 
        error: 'Authentication failed' 
      }),
    }
    
    renderWithProviders(<PrivateRoutes />, { preloadedState })
    
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/login')
  })

  it('renders protected content when user is authenticated', () => {
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
        isLoggedIn: true, 
        loading: false, 
        error: null 
      }),
    }
    
    renderWithProviders(<PrivateRoutes />, { preloadedState })
    
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('does not render loading or redirect when user is authenticated', () => {
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
        isLoggedIn: true, 
        loading: false, 
        error: null 
      }),
    }
    
    renderWithProviders(<PrivateRoutes />, { preloadedState })
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('prioritizes loading state over error state', () => {
    const preloadedState = {
      auth: createMockAuthState({ 
        user: null, 
        isLoggedIn: false, 
        loading: true, 
        error: 'Some error' 
      }),
    }
    
    renderWithProviders(<PrivateRoutes />, { preloadedState })
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })
})