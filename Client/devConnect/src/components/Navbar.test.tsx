import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import Navbar from '@/components/Navbar'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

describe('Navbar', () => {
  it('renders logo', () => {
    renderWithProviders(<Navbar />)
    
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders login and signup buttons when user is not logged in', () => {
    const preloadedState = {
      auth: createMockAuthState({ user: null, isLoggedIn: false }),
    }
    
    renderWithProviders(<Navbar />, { preloadedState })
    
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('renders user menu when user is logged in', () => {
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
    
    renderWithProviders(<Navbar />, { preloadedState })
    
    // Should render UserMenu component (which includes dropdown trigger)
    const dropdown = screen.getByRole('button')
    expect(dropdown).toBeInTheDocument()
  })

  it('has correct header styling classes', () => {
    renderWithProviders(<Navbar />)
    
    const header = document.querySelector('header')
    expect(header).toHaveClass('sticky', 'top-0', 'z-50', 'border-b', 'bg-background/95', 'backdrop-blur')
  })

  it('renders MobileNavbar component', () => {
    renderWithProviders(<Navbar />)
    
    // MobileNavbar should render a button 
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders search bar on desktop', () => {
    renderWithProviders(<Navbar />)
    
    // SearchBar should render search input
    const searchInput = screen.getByPlaceholderText('Search posts...')
    expect(searchInput).toBeInTheDocument()
  })

  it('renders with correct max width container', () => {
    renderWithProviders(<Navbar />)
    
    // Check for the container element
    const container = document.querySelector('div.flex.flex-row')
    expect(container).toBeInTheDocument()
  })
})