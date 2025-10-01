import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/__test__/test.util.tsx';
import CommentsPopUp from '@/components/CommentsPopUp.tsx';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { addComment, likeComment } from '@/features/Comments/commentsSlice';
import User from '../../../Types/user.ts';
import { act } from 'react';

// --- Mock Redux Thunks ---
vi.mock('@/features/Comments/commentsSlice', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/Comments/commentsSlice')>();
  return {
    ...actual,
    addComment: vi.fn(() => ({
      unwrap: () => Promise.resolve(),
      type: 'comments/add/fulfilled',
      payload: {},
    })),
    fetchComments: vi.fn(() => ({
      type: 'comments/fetch/fulfilled',
      payload: [],
    })),
    likeComment: vi.fn(() => ({
      type: 'comments/like/fulfilled',
      payload: {},
    })),
  };
});

// --- Fake Data ---
const mockPostData = {
  _id: 'post123',
  title: 'My Test Post',
  author: 'Jane Doe',
  authorAvatar: 'https://placehold.co/50x50',
  image: 'https://placehold.co/600x400',
  date: new Date().toISOString(),
  likes: 3,
  commentCount: 2,
};

const mockComments = [
  {
    _id: 'c1',
    content: 'This is the first comment',
    user: {
      _id: 'u1',
      username: 'Alice',
      avatar: 'https://placehold.co/40x40',
    },
    createdAt: new Date().toISOString(),
    likes: ['u2'],
    post: 'post123',
  },
  {
    _id: 'c2',
    content: 'Second comment here!',
    user: {
      _id: 'u2',
      username: 'Bob',
      avatar: 'https://placehold.co/40x40',
    },
    createdAt: new Date().toISOString(),
    likes: [],
    post: 'post123',
  },
];

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

describe('CommentsPopUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and opens dialog', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp
          isLoggedIn={true}
          postData={{ _id: '1', commentCount: 0 }}
        />
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/share your thoughts/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /post comment/i })
    ).toBeInTheDocument();
  });

  it('renders post and comments correctly', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: mockComments, loading: false, error: null },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText('My Test Post')).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment here!')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows login prompt when not logged in', async () => {
    const onNavigateToLogin = vi.fn();

    await act(async () => {
      renderWithProviders(
        <CommentsPopUp
          isLoggedIn={false}
          onNavigateToLogin={onNavigateToLogin}
          postData={mockPostData}
        />
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/please log in to leave a comment/i)
      ).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });

    expect(onNavigateToLogin).toHaveBeenCalled();
  });

  it('adds comment when clicking Post Comment', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: [], loading: false, error: null },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    const textarea = await waitFor(() =>
      screen.getByPlaceholderText(/share your thoughts/i)
    );

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'New Comment' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /post comment/i }));
    });

    expect(addComment).toHaveBeenCalledWith({
      post: mockPostData._id,
      content: 'New Comment',
    });
  });

  it('submits comment on Enter key', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: [], loading: false, error: null },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    const textarea = await waitFor(() =>
      screen.getByPlaceholderText(/share your thoughts/i)
    );

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Enter key comment' } });
    });

    await act(async () => {
      fireEvent.keyPress(textarea, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });
    });

    expect(addComment).toHaveBeenCalledWith({
      post: mockPostData._id,
      content: 'Enter key comment',
    });
  });

  it('shows loading state', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: [], loading: true, error: null },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: [], loading: false, error: 'Something bad' },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText(/error loading comments/i)).toBeInTheDocument();
    });
  });

  it('shows no comments state', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: [], loading: false, error: null },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
    });
  });

  it('likes a comment optimistically', async () => {
    await act(async () => {
      renderWithProviders(
        <CommentsPopUp isLoggedIn={true} postData={mockPostData} />,
        {
          preloadedState: {
            auth: {
              user: mockUser,
              loading: false,
              error: null,
              isLoggedIn: true,
            },
            comments: { comments: mockComments, loading: false, error: null },
          },
        }
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    const likeButton = await waitFor(
      () => screen.getAllByRole('button', { name: /like/i })[0]
    );

    await act(async () => {
      fireEvent.click(likeButton);
    });

    expect(likeComment).toHaveBeenCalledWith('c1');
  });
});
