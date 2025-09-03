import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormError from '@/components/FormError'

describe('FormError', () => {
  it('renders error message when message is provided', () => {
    const errorMessage = 'This is an error message'
    render(<FormError message={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    // Check for SVG icon
    const svgIcon = document.querySelector('svg')
    expect(svgIcon).toBeInTheDocument()
  })

  it('does not render when message is not provided', () => {
    const { container } = render(<FormError />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render when message is empty string', () => {
    const { container } = render(<FormError message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies correct CSS classes for error styling', () => {
    const errorMessage = 'Error occurred'
    render(<FormError message={errorMessage} />)
    
    const errorDiv = screen.getByText(errorMessage).parentElement
    expect(errorDiv).toHaveClass('bg-destructive/35', 'p-3', 'rounded-md', 'flex', 'items-center', 'gap-x-2', 'text-sm', 'text-destructive')
  })

  it('renders ExclamationTriangleIcon with correct classes', () => {
    render(<FormError message="Error" />)
    
    const svgIcon = document.querySelector('svg')
    expect(svgIcon).toHaveClass('w-4', 'h-4')
  })
})