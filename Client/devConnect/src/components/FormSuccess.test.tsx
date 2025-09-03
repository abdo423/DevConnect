import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormSuccess from '@/components/FormSuccess'

describe('FormSuccess', () => {
  it('renders success message when message is provided', () => {
    const successMessage = 'Operation completed successfully'
    render(<FormSuccess message={successMessage} />)
    
    expect(screen.getByText(successMessage)).toBeInTheDocument()
    // Check for SVG icon
    const svgIcon = document.querySelector('svg')
    expect(svgIcon).toBeInTheDocument()
  })

  it('does not render when message is not provided', () => {
    const { container } = render(<FormSuccess />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render when message is empty string', () => {
    const { container } = render(<FormSuccess message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies correct CSS classes for success styling', () => {
    const successMessage = 'Success!'
    render(<FormSuccess message={successMessage} />)
    
    const successDiv = screen.getByText(successMessage).parentElement
    expect(successDiv).toHaveClass('bg-emerald-500/15', 'p-3', 'rounded-md', 'flex', 'items-center', 'gap-x-2', 'text-sm', 'text-emerald-500')
  })

  it('renders CheckCircledIcon with correct classes', () => {
    render(<FormSuccess message="Success" />)
    
    const svgIcon = document.querySelector('svg')
    expect(svgIcon).toHaveClass('w-4', 'h-4')
  })
})