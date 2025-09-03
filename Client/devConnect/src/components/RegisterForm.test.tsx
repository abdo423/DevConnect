import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import RegisterForm from '@/components/RegisterForm'
import * as authSlice from '@/features/Auth/authSlice.ts'

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders register form with all elements', () => {
    renderWithProviders(<RegisterForm />)
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('allows typing in all form fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(usernameInput, 'testuser123')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(usernameInput).toHaveValue('testuser123')
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('shows validation errors for short inputs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Try to submit without filling in fields
    await user.click(submitButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/string must contain at least 8 character/i)).toBeInTheDocument()
    })
  })

  it('dispatches register action with correct data', async () => {
    const user = userEvent.setup()
    const mockThunkAction = {
      unwrap: vi.fn().mockResolvedValue({ message: 'Registration successful' })
    }
    const mockRegisterThunk = vi.fn().mockReturnValue(mockThunkAction)
    vi.spyOn(authSlice, 'register').mockReturnValue(mockRegisterThunk as any)
    
    renderWithProviders(<RegisterForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(usernameInput, 'testuser123')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(authSlice.register).toHaveBeenCalledWith({
        username: 'testuser123',
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('shows success message on successful registration', async () => {
    const user = userEvent.setup()
    const mockThunkAction = {
      unwrap: vi.fn().mockResolvedValue({ message: 'Registration successful' })
    }
    const mockRegisterThunk = vi.fn().mockReturnValue(mockThunkAction)
    vi.spyOn(authSlice, 'register').mockReturnValue(mockRegisterThunk as any)
    
    renderWithProviders(<RegisterForm />)
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(usernameInput, 'testuser123')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Registration successful')).toBeInTheDocument()
    })
  })

  it('disables form when loading', () => {
    const preloadedState = {
      auth: createMockAuthState({ loading: true }),
    }
    
    renderWithProviders(<RegisterForm />, { preloadedState })
    
    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    expect(usernameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})