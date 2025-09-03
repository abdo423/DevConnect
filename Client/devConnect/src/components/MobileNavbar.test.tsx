import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import MobileNavbar from '@/components/MobileNavbar'
import * as authSlice from '@/features/Auth/authSlice.ts'

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

describe('MobileNavbar', () => {
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

  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'test-avatar.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders menu trigger button', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()
    expect(screen.getByText('Toggle menu')).toBeInTheDocument()
  })

  it('renders search form', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for search elements
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('renders login and signup buttons when not logged in', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for login/signup buttons
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('renders navigation routes when logged in', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for navigation routes
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders logout button when logged in', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for logout button
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('renders user information when logged in', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for user information
    expect(screen.getByText(mockUser.username)).toBeInTheDocument()
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
  })

  it('displays avatar fallback when logged in', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for avatar fallback (first letter of username)
    expect(screen.getByText('t')).toBeInTheDocument() // First letter of 'testuser'
  })

  it('dispatches logout action when logout is clicked', async () => {
    const user = userEvent.setup()
    const mockLogoutAction = vi.fn()
    vi.spyOn(authSlice, 'logout').mockReturnValue(mockLogoutAction as any)
    
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Click logout
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    // Verify logout action was dispatched
    expect(authSlice.logout).toHaveBeenCalled()
  })

  it('has correct CSS classes for mobile visibility', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    const menuButton = screen.getByRole('button')
    expect(menuButton).toHaveClass('md:hidden')
  })

  it('renders logo in header', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    // Open the sheet
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    // Check for logo
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
  })
})