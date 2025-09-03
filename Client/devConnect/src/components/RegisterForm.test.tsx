import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders, createAuthPreloadedState } from '@/test/test-utils'
import RegisterForm from '@/components/RegisterForm'
import * as authSlice from '@/features/Auth/authSlice.ts'

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders register form with all elements', () => {
    renderWithProviders(<RegisterForm />)
    
    // Check that both title and button exist with "Register" text
    const registerElements = screen.getAllByText('Register')
    expect(registerElements).toHaveLength(2) // Title and button
    
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('allows typing in all form fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)
    
    const usernameInput = screen.getByPlaceholderText('Enter your username')
    const emailInput = screen.getByPlaceholderText('Enter your Email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
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
    
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    // Try to submit without filling in fields
    await user.click(submitButton)
    
    // Should show validation errors (multiple fields with same error)
    await waitFor(() => {
      expect(screen.getAllByText(/string must contain at least 8 character/i)).toHaveLength(2)
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
    
    const usernameInput = screen.getByPlaceholderText('Enter your username')
    const emailInput = screen.getByPlaceholderText('Enter your Email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
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
    
    const usernameInput = screen.getByPlaceholderText('Enter your username')
    const emailInput = screen.getByPlaceholderText('Enter your Email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    await user.type(usernameInput, 'testuser123')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Registration successful')).toBeInTheDocument()
    })
  })

  it('disables form when loading', () => {
    const preloadedState = createAuthPreloadedState({ loading: true })
    
    renderWithProviders(<RegisterForm />, { preloadedState })
    
    const usernameInput = screen.getByPlaceholderText('Enter your username')
    const emailInput = screen.getByPlaceholderText('Enter your Email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: /register/i })
    
    expect(usernameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})