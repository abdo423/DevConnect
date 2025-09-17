// src/__test__/Components/Navbar.test.tsx
import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import Navbar from "@/components/Navbar"
import type { RootState } from "@/app/store"
import user from "../../../Types/user.ts";

// Mock the components that might not be available in test environment
vi.mock("@/components/SearchBar", () => ({
    default: ({ className }: { className?: string }) => (
        <div data-testid="search-bar" className={className}>SearchBar</div>
    ),
}))

vi.mock("@/components/MobileNavbar", () => ({
    default: ({ isLoggedIn, user, filteredRoutes }: {isLoggedIn:boolean,user:user,filteredRoutes:string}) => (
        <div data-testid="mobile-nav">
            MobileNav - LoggedIn: {isLoggedIn ? "true" : "false"}
            {user && <span data-testid="mobile-nav-user">{user.username}</span>}
        </div>
    ),
}))

vi.mock("@/components/UserMenu", () => ({
    default: ({ user, filteredRoutes }: {isLoggedIn:boolean,user:user,filteredRoutes:string}) => (
        <div data-testid="user-menu">
            UserMenu - {user?.username || "No User"}
        </div>
    ),
}))

// Mock auth slice
vi.mock("@/features/Auth/authSlice", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/Auth/authSlice")>()
    return {
        ...actual,
        logout: vi.fn(() => ({ type: 'auth/logout' })),
        default: actual.default, // This is crucial - keeps the reducer
    }
})

// Mock the logo import
vi.mock("../assets/DevConnect.png", () => ({
    default: "mocked-logo.png",
}))

describe("Navbar", () => {
    const mockUser = {
        _id: "user123",
        username: "testuser",
        email: "test@example.com",
        avatar: "avatar.jpg",
        bio: "Test bio",
        posts:[],
        followers: [],
        following: [],
        createdAt: String(new Date()),
        updatedAt: String(new Date()),

    }

    describe("when user is not logged in", () => {
        const unauthenticatedState: Partial<RootState> = {
            auth: {
                user: null,
                isLoggedIn: false,
                loading: false,
                error: null
            }
        }

        it("renders logo and search bar", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: unauthenticatedState
            })

            expect(screen.getByAltText("logo")).toBeInTheDocument()
            expect(screen.getByTestId("search-bar")).toBeInTheDocument()
        })

        it("shows login and sign up buttons", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: unauthenticatedState
            })

            expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument()
            expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
        })

        it("does not show user menu", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: unauthenticatedState
            })

            expect(screen.queryByTestId("user-menu")).not.toBeInTheDocument()
        })

        it("shows mobile nav with logged out state", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: unauthenticatedState
            })

            const mobileNav = screen.getByTestId("mobile-nav")
            expect(mobileNav).toBeInTheDocument()
            expect(mobileNav).toHaveTextContent("LoggedIn: false")
        })
    })

    describe("when user is logged in", () => {
        const authenticatedState: Partial<RootState> = {
            auth: {
                user: mockUser,
                isLoggedIn: true,
                loading: false,
                error: null
            }
        }

        it("renders logo and search bar", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: authenticatedState
            })

            expect(screen.getByAltText("logo")).toBeInTheDocument()
            expect(screen.getByTestId("search-bar")).toBeInTheDocument()
        })

        it("shows user menu with user data", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: authenticatedState
            })

            const userMenu = screen.getByTestId("user-menu")
            expect(userMenu).toBeInTheDocument()
            expect(userMenu).toHaveTextContent(`UserMenu - ${mockUser.username}`)
        })

        it("does not show login/signup buttons", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: authenticatedState
            })

            expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument()
            expect(screen.queryByRole("link", { name: /sign up/i })).not.toBeInTheDocument()
        })

        it("shows mobile nav with logged in state", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: authenticatedState
            })

            const mobileNav = screen.getByTestId("mobile-nav")
            expect(mobileNav).toBeInTheDocument()
            expect(mobileNav).toHaveTextContent("LoggedIn: true")
        })
    })

    describe("responsive design", () => {
        it("hides search bar on mobile (has hidden md:block class)", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null }
                }
            })

            const searchBar = screen.getByTestId("search-bar")
            expect(searchBar).toHaveClass("hidden", "md:block")
        })

        it("hides login/signup buttons on mobile (has hidden md:flex class)", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null }
                }
            })

            const loginButton = screen.getByRole("link", { name: /log in/i }).closest("button")
            const signupButton = screen.getByRole("link", { name: /sign up/i }).closest("button")

            expect(loginButton).toHaveClass("hidden", "md:flex")
            expect(signupButton).toHaveClass("hidden", "md:flex")
        })
    })

    describe("navigation routes", () => {
        // Mock useLocation to test route filtering
        const mockUseLocation = vi.fn()

        beforeEach(() => {
            vi.doMock("react-router-dom", async () => {
                const actual = await vi.importActual("react-router-dom")
                return {
                    ...actual,
                    useLocation: mockUseLocation,
                    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
                        <a href={to}>{children}</a>
                    ),
                }
            })
        })

        it("filters out current route from navigation", () => {
            mockUseLocation.mockReturnValue({ pathname: "/profile" })

            renderWithProviders(<Navbar />, {
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isLoggedIn: true,
                        loading: false,
                        error: null
                    }
                }
            })

            expect(screen.getByTestId("user-menu")).toBeInTheDocument()
            expect(screen.getByTestId("mobile-nav")).toBeInTheDocument()
        })
    })

    describe("user data transformation", () => {
        it("passes correct user data to UserMenu", () => {
            const userWithAllFields = {
                ...mockUser,
                additionalField: "should not be passed"
            }

            renderWithProviders(<Navbar />, {
                preloadedState: {
                    auth: {
                        user: userWithAllFields as any,
                        isLoggedIn: true,
                        loading: false,
                        error: null
                    }
                }
            })

            // UserMenu should receive only the specific fields
            const userMenu = screen.getByTestId("user-menu")
            expect(userMenu).toBeInTheDocument()
            expect(userMenu).toHaveTextContent(mockUser.username)
        })
    })

    describe("edge cases", () => {
        it("handles user with missing optional fields", () => {
            const minimalUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com"
                // missing avatar and bio
            }

            renderWithProviders(<Navbar />, {
                preloadedState: {
                    auth: {
                        user: minimalUser as Omit<user, "posts followers following createdAt updatedAt">,
                        isLoggedIn: true,
                        loading: false,
                        error: null
                    }
                }
            })

            expect(screen.getByTestId("user-menu")).toBeInTheDocument()
        })

        it("handles inconsistent auth state (user exists but isLoggedIn is false)", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isLoggedIn: false,
                        loading: false,
                        error: null
                    }
                }
            })

            // Component logic checks for user first, so should show login buttons
            expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument()
            expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument()
        })
    })
})