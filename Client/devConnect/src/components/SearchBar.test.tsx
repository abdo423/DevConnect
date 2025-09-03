import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/SearchBar'

describe('SearchBar', () => {
  it('renders search input and button', () => {
    render(<SearchBar />)
    
    expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('renders search icon', () => {
    render(<SearchBar />)
    
    const searchIcon = document.querySelector('.lucide-search')
    expect(searchIcon || document.querySelector('svg')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'my-custom-class'
    render(<SearchBar className={customClass} />)
    
    const form = document.querySelector('form')
    expect(form).toHaveClass(customClass)
  })

  it('applies custom button className when provided', () => {
    const customButtonClass = 'my-button-class'
    render(<SearchBar button={customButtonClass} />)
    
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toHaveClass(customButtonClass)
  })

  it('has correct form structure', () => {
    render(<SearchBar />)
    
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveClass('relative', 'w-full', 'max-w-md', 'border-2', 'border-input/30', 'rounded-md')
  })

  it('has correct input attributes', () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search posts...')
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveClass('w-full', 'pl-9', 'pr-12', 'pt-2', 'pb-2')
  })

  it('allows typing in search input', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search posts...')
    await user.type(input, 'test search query')
    
    expect(input).toHaveValue('test search query')
  })

  it('button has correct positioning classes', () => {
    render(<SearchBar />)
    
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toHaveClass('absolute', 'right-0', 'top-0', 'h-full', 'px-3')
  })
})