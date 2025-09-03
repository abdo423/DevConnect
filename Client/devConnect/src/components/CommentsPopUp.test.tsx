import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, createMockAuthState } from '@/test/test-utils'
import CommentsPopUp from '@/components/CommentsPopUp'

describe('CommentsPopUp', () => {
  const mockPostData = {
    _id: 'test-post-id',
    title: 'Test Post Title',
    author: 'Test Author',
    authorAvatar: 'test-avatar.jpg',
    image: 'test-image.jpg',
    date: new Date(),
    likes: [],
    comments: []
  }

  it('renders comments dialog trigger', () => {
    renderWithProviders(
      <CommentsPopUp 
        isLoggedIn={true} 
        postData={mockPostData} 
        onNavigateToLogin={vi.fn()} 
      />
    )
    
    // Should render trigger button for comments
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })

  it('renders with logged out state', () => {
    renderWithProviders(
      <CommentsPopUp 
        isLoggedIn={false} 
        postData={mockPostData} 
        onNavigateToLogin={vi.fn()} 
      />
    )
    
    // Should still render the component
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })

  it('renders with post data', () => {
    renderWithProviders(
      <CommentsPopUp 
        isLoggedIn={true} 
        postData={mockPostData} 
        onNavigateToLogin={vi.fn()} 
      />
    )
    
    // Component should render without errors with post data
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles missing post data gracefully', () => {
    renderWithProviders(
      <CommentsPopUp 
        isLoggedIn={true} 
        onNavigateToLogin={vi.fn()} 
      />
    )
    
    // Should still render even without post data
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })

  it('renders with Redux state', () => {
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
      comments: {
        comments: [],
        loading: false,
        error: null,
      }
    }
    
    renderWithProviders(
      <CommentsPopUp 
        isLoggedIn={true} 
        postData={mockPostData} 
        onNavigateToLogin={vi.fn()} 
      />, 
      { preloadedState }
    )
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})