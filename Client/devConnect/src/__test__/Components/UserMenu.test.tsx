// Complete corrected test file
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test.util.tsx';
import UserMenu from '@/components/UserMenu';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: React.forwardRef<
      HTMLAnchorElement,
      { to: string; children: React.ReactNode; className?: string }
    >(({ to, children, className }, ref) => (
      <a href={to} className={className} ref={ref}>
        {children}
      </a>
    )),
  };
});

vi.mock('@/features/Auth/authSlice', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/Auth/authSlice')>();
  return {
    ...actual,
    logout: vi.fn(() => ({ type: 'auth/logout/pending' })),
    default: actual.default,
  };
});

describe('UserMenu', () => {
  const mockUser = {
    id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'avatar.jpg',
    bio: 'Test bio',
  };

  const mockRoutes = [
    { path: '/', label: 'Home', icon: <span data-testid="home-icon">🏠</span> },
    {
      path: '/profile',
      label: 'Profile',
      icon: <span data-testid="profile-icon">👤</span>,
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: <span data-testid="messages-icon">💬</span>,
    },
  ];

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    // Mock dispatch to return action with unwrap method
    const mockUnwrap = vi.fn().mockResolvedValue(undefined);
    mockDispatch.mockReturnValue({
      type: 'auth/logout/pending',
      payload: undefined,
      unwrap: mockUnwrap,
    });
  });

  describe('logout functionality', () => {
    it('dispatches logout action when logout is clicked', async () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      await user.click(screen.getByRole('button'));

      const logoutItem = await waitFor(
        () => {
          return screen.getByRole('menuitem', { name: /logout/i });
        },
        { timeout: 3000 }
      );

      await user.click(logoutItem);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth/logout/pending',
        })
      );
    });

    it('navigates to home page after successful logout', async () => {
      // Create a specific mock for this test
      const mockUnwrap = vi.fn().mockResolvedValue(undefined);
      mockDispatch.mockReturnValue({
        type: 'auth/logout/pending',
        payload: undefined,
        unwrap: mockUnwrap,
      });

      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      await user.click(screen.getByRole('button'));

      const logoutItem = await waitFor(
        () => {
          return screen.getByRole('menuitem', { name: /logout/i });
        },
        { timeout: 3000 }
      );

      await user.click(logoutItem);

      // Wait for dispatch to be called
      expect(mockDispatch).toHaveBeenCalled();

      // Wait for unwrap to be called
      await waitFor(() => {
        expect(mockUnwrap).toHaveBeenCalled();
      });

      // Wait for navigation
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/');
        },
        { timeout: 2000 }
      );
    });

    it('handles logout error gracefully', async () => {
      // Set up the mock to reject
      const mockUnwrap = vi.fn().mockRejectedValue(new Error('Logout failed'));
      mockDispatch.mockReturnValue({
        type: 'auth/logout/pending',
        payload: undefined,
        unwrap: mockUnwrap,
      });

      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      await user.click(screen.getByRole('button'));

      const logoutItem = await waitFor(
        () => {
          return screen.getByRole('menuitem', { name: /logout/i });
        },
        { timeout: 3000 }
      );

      await user.click(logoutItem);

      // Should dispatch the logout action
      expect(mockDispatch).toHaveBeenCalled();

      // Wait for unwrap to be called
      await waitFor(() => {
        expect(mockUnwrap).toHaveBeenCalled();
      });

      // Wait a bit to ensure navigation doesn't happen
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('renders user avatar and dropdown trigger', () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('t')).toBeInTheDocument();
    });

    it('shows user initial as fallback when no avatar', () => {
      const userWithoutAvatar = {
        ...mockUser,
        avatar: '',
      };

      renderWithProviders(
        <UserMenu user={userWithoutAvatar} filteredRoutes={mockRoutes} />
      );

      expect(screen.getByText('t')).toBeInTheDocument();
    });

    it("shows 'U' fallback when username is empty", () => {
      const userWithoutUsername = {
        ...mockUser,
        username: '',
      };

      renderWithProviders(
        <UserMenu user={userWithoutUsername} filteredRoutes={mockRoutes} />
      );

      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('returns null when user is not provided', () => {
      const { container } = renderWithProviders(
        <UserMenu user={null as any} filteredRoutes={mockRoutes} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('dropdown menu', () => {
    it('opens dropdown when trigger is clicked', async () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(
        () => {
          expect(
            screen.getByRole('link', { name: /home/i })
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(
        screen.getByRole('link', { name: /profile/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /messages/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /logout/i })
      ).toBeInTheDocument();
    });

    it('shows all filtered routes with icons', async () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      await user.click(screen.getByRole('button'));

      await waitFor(
        () => {
          expect(screen.getByTestId('home-icon')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
      expect(screen.getByTestId('messages-icon')).toBeInTheDocument();
    });

    it('creates proper links for each route', async () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      await user.click(screen.getByRole('button'));

      await waitFor(
        () => {
          const homeLink = screen.getByRole('link', { name: /home/i });
          expect(homeLink).toHaveAttribute('href', '/');
        },
        { timeout: 3000 }
      );

      expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
        'href',
        '/profile'
      );
      expect(screen.getByRole('link', { name: /messages/i })).toHaveAttribute(
        'href',
        '/messages'
      );
    });
  });

  describe('responsive behavior', () => {
    it('is hidden on mobile (has hidden md:block classes)', () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass('hidden', 'md:block');
    });
  });

  describe('accessibility', () => {
    it('has proper button role for dropdown trigger', () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows user avatar fallback correctly', () => {
      renderWithProviders(
        <UserMenu user={mockUser} filteredRoutes={mockRoutes} />
      );

      expect(screen.getByText('t')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty filteredRoutes array', async () => {
      renderWithProviders(<UserMenu user={mockUser} filteredRoutes={[]} />);

      await user.click(screen.getByRole('button'));

      await waitFor(
        () => {
          expect(
            screen.getByRole('menuitem', { name: /logout/i })
          ).toBeInTheDocument();
          expect(
            screen.queryByRole('link', { name: /home/i })
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('handles user with minimal fields', () => {
      const minimalUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        avatar: '',
        bio: '',
      };

      renderWithProviders(
        <UserMenu user={minimalUser} filteredRoutes={mockRoutes} />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('t')).toBeInTheDocument();
    });
  });
});
