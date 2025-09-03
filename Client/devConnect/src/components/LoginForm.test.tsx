import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import LoginForm from '@/components/LoginForm'
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all elements', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Log in to your account.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('allows typing in email and password fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('shows validation errors for invalid inputs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    // Try to submit without filling in fields
    await user.click(submitButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/string must contain at least 8 character/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('dispatches login action with correct credentials', async () => {
    const user = userEvent.setup()
    const mockLoginThunk = vi.fn().mockResolvedValue({ message: 'Login successful' })
    mockLoginThunk.unwrap = vi.fn().mockResolvedValue({ message: 'Login successful' })
    vi.spyOn(authSlice, 'login').mockReturnValue(mockLoginThunk as any)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(authSlice.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('shows success message on successful login', async () => {
    const user = userEvent.setup()
    const mockLoginThunk = vi.fn().mockResolvedValue({ message: 'Login successful' })
    mockLoginThunk.unwrap = vi.fn().mockResolvedValue({ message: 'Login successful' })
    vi.spyOn(authSlice, 'login').mockReturnValue(mockLoginThunk as any)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument()
    })
  })

  it('shows error message on failed login', async () => {
    const user = userEvent.setup()
    const mockLoginThunk = vi.fn().mockRejectedValue({ message: 'Invalid credentials' })
    mockLoginThunk.unwrap = vi.fn().mockRejectedValue({ message: 'Invalid credentials' })
    vi.spyOn(authSlice, 'login').mockReturnValue(mockLoginThunk as any)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('disables form fields when loading', () => {
    const preloadedState = {
      auth: createMockAuthState({ loading: true }),
    }
    
    renderWithProviders(<LoginForm />, { preloadedState })
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it('shows loading state on submit button when loading', () => {
    const preloadedState = {
      auth: createMockAuthState({ loading: true }),
    }
    
    renderWithProviders(<LoginForm />, { preloadedState })
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    expect(submitButton).toBeDisabled()
  })
})