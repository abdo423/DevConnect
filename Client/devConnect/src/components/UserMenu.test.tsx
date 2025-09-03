import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import UserMenu from '@/components/UserMenu'
import * as authSlice from '@/features/Auth/authSlice'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

describe('UserMenu', () => {
  const mockUser = {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'test-avatar.jpg',
    bio: 'Test bio',
  }

  const mockRoutes = [
    {
      path: '/profile',
      label: 'Profile',
      icon: <span>👤</span>,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <span>⚙️</span>,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when user is not provided', () => {
    const { container } = renderWithProviders(
      <UserMenu user={null as any} filteredRoutes={mockRoutes} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders user avatar and username', () => {
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Check if avatar fallback is rendered (since image may not load in test)
    const avatarFallback = screen.getByText('t') // First letter of 'testuser'
    expect(avatarFallback).toBeInTheDocument()
  })

  it('renders route links in dropdown menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Click to open dropdown
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    // Check if route links are rendered
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders logout button', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Click to open dropdown
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    // Check if logout button is rendered
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('dispatches logout action when logout is clicked', async () => {
    const user = userEvent.setup()
    const mockLogoutThunk = vi.fn().mockResolvedValue({})
    vi.spyOn(authSlice, 'logout').mockReturnValue(mockLogoutThunk as any)
    
    const { store } = renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Click to open dropdown
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    // Click logout
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    // Verify logout action was dispatched
    expect(authSlice.logout).toHaveBeenCalled()
  })

  it('calls logout action when logout is clicked', async () => {
    const user = userEvent.setup()
    const mockThunkAction = {
      unwrap: vi.fn().mockResolvedValue({})
    }
    const mockLogoutThunk = vi.fn().mockReturnValue(mockThunkAction)
    vi.spyOn(authSlice, 'logout').mockReturnValue(mockLogoutThunk as any)
    
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Click to open dropdown
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    // Click logout
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    // Verify logout action was dispatched
    expect(authSlice.logout).toHaveBeenCalled()
  })

  it('handles logout error gracefully', async () => {
    const user = userEvent.setup()
    const mockThunkAction = {
      unwrap: vi.fn().mockRejectedValue(new Error('Logout failed'))
    }
    const mockLogoutThunk = vi.fn().mockReturnValue(mockThunkAction)
    vi.spyOn(authSlice, 'logout').mockReturnValue(mockLogoutThunk as any)
    
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Click to open dropdown
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    // Click logout
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    // Should not navigate if logout fails
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('has correct CSS classes for desktop visibility', () => {
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    const container = document.querySelector('.hidden.md\\:block')
    expect(container).toBeInTheDocument()
  })

  it('displays user avatar fallback when username is available', () => {
    renderWithProviders(
      <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    const fallback = screen.getByText('t') // First letter of 'testuser'
    expect(fallback).toBeInTheDocument()
  })
})