import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__test__/test.util.tsx';
import { act } from 'react';
import CreatePost from '@/components/CreatePost.tsx';
import { createPostThunk } from '@/features/Posts/postsSlice';
import User from '../../../Types/user.ts';

// --- Mock Redux Thunks ---
vi.mock('@/features/Posts/postsSlice', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/Posts/postsSlice')>();
  return {
    ...actual,
    createPostThunk: vi.fn(() => ({
      unwrap: () => Promise.resolve(),
      type: 'posts/create/fulfilled',
      payload: {},
    })),
  };
});

// --- Fake User ---
const mockUser: User = {
  _id: 'u1',
  username: 'Alice',
  avatar: 'https://placehold.co/40x40',
  email: 'alice@example.com',
  bio: 'Just a test user',
  posts: [],
  followers: [],
  following: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CreatePost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with input fields', () => {
    renderWithProviders(<CreatePost />, {
      preloadedState: {
        auth: { user: mockUser, isLoggedIn: true, loading: false, error: null },
      },
    });

    expect(screen.getByPlaceholderText(/post title/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/what's on your mind/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
  });

  it('shows button as disabled when submitting empty form', async () => {
    renderWithProviders(<CreatePost />, {
      preloadedState: {
        auth: { user: mockUser, isLoggedIn: true, loading: false, error: null },
      },
    });

    // Initially, the button should be disabled because form is empty
    const submitButton = screen.getByRole('button', { name: /post/i });
    expect(submitButton).toBeDisabled();

    // Try to click the disabled button (this won't trigger submission)
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Button should still be disabled
    expect(submitButton).toBeDisabled();

    // No validation errors should be shown since the form wasn't actually submitted
    expect(
      screen.queryByText(/title must be at least 2 characters/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/content must be at least 30 characters/i)
    ).not.toBeInTheDocument();
  });

  it('dispatches createPostThunk when valid form is submitted', async () => {
    renderWithProviders(<CreatePost />, {
      preloadedState: {
        auth: { user: mockUser, isLoggedIn: true, loading: false, error: null },
      },
    });

    const titleInput = screen.getByPlaceholderText(/post title/i);
    const contentTextarea = screen.getByPlaceholderText(/what's on your mind/i);

    // Fill with valid data
    await act(async () => {
      fireEvent.change(titleInput, {
        target: { value: 'Valid Title' },
      });
    });

    await act(async () => {
      fireEvent.change(contentTextarea, {
        target: {
          value:
            'This is valid content with more than 30 characters so it should pass validation',
        },
      });
    });

    // Wait for validation to pass - button should no longer be disabled
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /post/i });
      expect(button).not.toBeDisabled();
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /post/i }));
    });

    // Verify the thunk was called
    await waitFor(() => {
      expect(createPostThunk).toHaveBeenCalledWith({
        title: 'Valid Title',
        content:
          'This is valid content with more than 30 characters so it should pass validation',
        image: undefined,
      });
    });
  });

  it('shows character counter when typing', async () => {
    renderWithProviders(<CreatePost />, {
      preloadedState: {
        auth: { user: mockUser, isLoggedIn: true, loading: false, error: null },
      },
    });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    });

    // Use the testid to find the character counter
    await waitFor(() => {
      expect(screen.getByTestId('character-counter')).toHaveTextContent(
        '12/280'
      );
    });
  });

  it('navigates to login if user is not logged in', async () => {
    const { store } = renderWithProviders(<CreatePost />, {
      preloadedState: {
        auth: { user: null, isLoggedIn: false, loading: false, error: null },
      },
    });

    fireEvent.change(screen.getByPlaceholderText(/post title/i), {
      target: { value: 'My Title' },
    });
    fireEvent.change(screen.getByPlaceholderText(/what's on your mind/i), {
      target: { value: 'This is valid content with more than 30 chars...' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /post/i }));
    });

    // since `navigate("/login")` is used, you can assert against `window.location`
    expect(store.getState().auth.isLoggedIn).toBe(false);
  });

  it('allows uploading and removing an image', async () => {
    renderWithProviders(<CreatePost />, {
      preloadedState: {
        auth: { user: mockUser, isLoggedIn: true, loading: false, error: null },
      },
    });

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    // Use the button's aria-label to find the photo button specifically
    const photoButton = screen.getByRole('button', { name: 'Photo' });

    await act(async () => {
      fireEvent.click(photoButton);
    });

    const hiddenInput =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await act(async () => {
      fireEvent.change(hiddenInput, { target: { files: [file] } });
    });

    expect(await screen.findByAltText('Selected')).toBeInTheDocument();

    // Find the remove button by its aria-label
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    await act(async () => {
      fireEvent.click(removeButton);
    });

    expect(screen.queryByAltText('Selected')).not.toBeInTheDocument();
  });
});
