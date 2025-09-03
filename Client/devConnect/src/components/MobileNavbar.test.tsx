import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import MobileNavbar from '@/components/MobileNavbar'

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

  it('has correct CSS classes for mobile visibility', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    const menuButton = screen.getByRole('button')
    expect(menuButton).toHaveClass('md:hidden')
  })

  it('renders with logged out state correctly', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={[]} />
    )
    
    // Should render the trigger button
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with logged in state correctly', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Should render the trigger button
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with routes provided', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Component should render without errors when routes are provided
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with user provided', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={true} user={mockUser} filteredRoutes={mockRoutes} />
    )
    
    // Component should render without errors when user is provided
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles missing user gracefully', () => {
    renderWithProviders(
      <MobileNavbar isLoggedIn={false} filteredRoutes={mockRoutes} />
    )
    
    // Should still render the trigger button even without user
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})