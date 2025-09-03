import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostSkeletonLoad from '@/components/PostSkeletonLoad'

describe('PostSkeletonLoad', () => {
  it('renders skeleton loading component', () => {
    render(<PostSkeletonLoad />)
    
    // Check if the card is rendered
    const card = document.querySelector('.max-w-xl')
    expect(card).toBeInTheDocument()
  })

  it('has proper loading animation class', () => {
    render(<PostSkeletonLoad />)
    
    const card = document.querySelector('.animate-pulse')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('animate-pulse')
  })

  it('renders skeleton elements for avatar section', () => {
    render(<PostSkeletonLoad />)
    
    // Avatar skeleton
    const avatarSkeleton = document.querySelector('.bg-gray-300.rounded-full.h-10.w-10')
    expect(avatarSkeleton).toBeInTheDocument()
    
    // Username skeleton
    const usernameSkeleton = document.querySelector('.h-4.bg-gray-300.rounded.w-1\\/3')
    expect(usernameSkeleton).toBeInTheDocument()
    
    // Time skeleton
    const timeSkeleton = document.querySelector('.h-3.bg-gray-200.rounded.w-1\\/4')
    expect(timeSkeleton).toBeInTheDocument()
  })

  it('renders skeleton elements for content section', () => {
    render(<PostSkeletonLoad />)
    
    // Title skeleton
    const titleSkeleton = document.querySelector('.h-5.bg-gray-300.rounded.w-3\\/4')
    expect(titleSkeleton).toBeInTheDocument()
    
    // Content lines skeletons
    const contentLines = document.querySelectorAll('.h-3.bg-gray-200.rounded')
    expect(contentLines.length).toBeGreaterThan(0)
  })

  it('renders skeleton elements for footer section', () => {
    render(<PostSkeletonLoad />)
    
    // Action buttons skeletons
    const actionSkeletons = document.querySelectorAll('.h-5.w-10.bg-gray-200.rounded')
    expect(actionSkeletons).toHaveLength(2)
    
    // Date skeleton
    const dateSkeleton = document.querySelector('.h-3.w-16.bg-gray-200.rounded')
    expect(dateSkeleton).toBeInTheDocument()
  })

  it('has correct card structure with header, content, and footer', () => {
    render(<PostSkeletonLoad />)
    
    // Check for CardHeader, CardContent, and CardFooter
    const header = document.querySelector('[class*="CardHeader"]') || document.querySelector('.flex.flex-row.items-center')
    const content = document.querySelector('[class*="CardContent"]') || document.querySelector('.px-4.py-2.space-y-2')
    const footer = document.querySelector('[class*="CardFooter"]') || document.querySelector('.px-4.py-2.flex.justify-between')
    
    expect(header).toBeInTheDocument()
    expect(content).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })
})