// src/__test__/Components/PrivateRoutes.test.tsx
import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import PrivateRoutes from "@/components/PrivateRoutes"

// Mock react-router-dom with inline components
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual,
        Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
            <div data-testid="navigate-redirect" data-redirect-to={to} data-replace={replace}>
                Redirecting to {to}
            </div>
        ),
        Outlet: () => <div data-testid="protected-content">Protected Content</div>,
    }
})

describe("PrivateRoutes", () => {
    describe("when user is authenticated", () => {
        it("renders protected content when user exists and not loading", () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                avatar: "avatar.jpg",
                bio: "Test bio",
                posts: [],
                followers: [],
                following: [],
                createdAt: "2023-01-01",
                updatedAt: "2023-01-01",
            }
            
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isLoggedIn: true,
                        loading: false,
                        error: null
                    }
                }
            })
            
            expect(screen.getByTestId("protected-content")).toBeInTheDocument()
            expect(screen.queryByTestId("navigate-redirect")).not.toBeInTheDocument()
        })

        it("renders protected content even when isLoggedIn is false if user exists", () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                avatar: "avatar.jpg",
                bio: "Test bio",
                posts: [],
                followers: [],
                following: [],
                createdAt: "2023-01-01",
                updatedAt: "2023-01-01",
            }
            
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isLoggedIn: false, // This doesn't matter, only user existence matters
                        loading: false,
                        error: null
                    }
                }
            })
            
            expect(screen.getByTestId("protected-content")).toBeInTheDocument()
            expect(screen.queryByTestId("navigate-redirect")).not.toBeInTheDocument()
        })
    })

    describe("when user is not authenticated", () => {
        it("redirects to login when user is null", () => {
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isLoggedIn: false,
                        loading: false,
                        error: null
                    }
                }
            })
            
            const redirect = screen.getByTestId("navigate-redirect")
            expect(redirect).toBeInTheDocument()
            expect(redirect).toHaveAttribute("data-redirect-to", "/login")
            expect(redirect).toHaveAttribute("data-replace", "true")
            expect(redirect).toHaveTextContent("Redirecting to /login")
            expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
        })

        it("redirects to login when user is undefined", () => {
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: undefined as any,
                        isLoggedIn: false,
                        loading: false,
                        error: null
                    }
                }
            })
            
            expect(screen.getByTestId("navigate-redirect")).toBeInTheDocument()
            expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
        })
    })

    describe("loading state", () => {
        it("shows loading message when auth is loading", () => {
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isLoggedIn: false,
                        loading: true,
                        error: null
                    }
                }
            })
            
            expect(screen.getByText("Loading...")).toBeInTheDocument()
            expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
            expect(screen.queryByTestId("navigate-redirect")).not.toBeInTheDocument()
        })

        it("prioritizes loading state over user check", () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                avatar: "avatar.jpg",
                bio: "Test bio",
                posts: [],
                followers: [],
                following: [],
                createdAt: "2023-01-01",
                updatedAt: "2023-01-01",
            }
            
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isLoggedIn: true,
                        loading: true, // Loading takes precedence
                        error: null
                    }
                }
            })
            
            expect(screen.getByText("Loading...")).toBeInTheDocument()
            expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
        })
    })

    describe("error state", () => {
        it("redirects to login when there is an auth error", () => {
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isLoggedIn: false,
                        loading: false,
                        error: "Authentication failed"
                    }
                }
            })
            
            expect(screen.getByTestId("navigate-redirect")).toBeInTheDocument()
            expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
        })

        it("redirects to login when there is error even with user", () => {
            const mockUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com",
                avatar: "avatar.jpg",
                bio: "Test bio",
                posts: [],
                followers: [],
                following: [],
                createdAt: "2023-01-01",
                updatedAt: "2023-01-01",
            }
            
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isLoggedIn: true,
                        loading: false,
                        error: "Token expired" // Error takes precedence over user
                    }
                }
            })
            
            expect(screen.getByTestId("navigate-redirect")).toBeInTheDocument()
            expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument()
        })

        it("uses replace navigation for error redirects", () => {
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isLoggedIn: false,
                        loading: false,
                        error: "Auth error"
                    }
                }
            })
            
            const redirect = screen.getByTestId("navigate-redirect")
            expect(redirect).toHaveAttribute("data-replace", "true")
        })
    })

    describe("edge cases", () => {
        it("handles partial user object", () => {
            const partialUser = {
                _id: "user123",
                username: "testuser",
                email: "test@example.com"
                // Missing other fields but should still be considered authenticated
            } as any
            
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: partialUser,
                        isLoggedIn: true,
                        loading: false,
                        error: null
                    }
                }
            })
            
            expect(screen.getByTestId("protected-content")).toBeInTheDocument()
        })

        it("handles empty user object", () => {
            const emptyUser = {} as any
            
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: emptyUser,
                        isLoggedIn: true,
                        loading: false,
                        error: null
                    }
                }
            })
            
            // Empty object is still truthy, so should allow access
            expect(screen.getByTestId("protected-content")).toBeInTheDocument()
        })

        it("prioritizes error and loading checks in correct order", () => {
            renderWithProviders(<PrivateRoutes />, {
                preloadedState: {
                    auth: {
                        user: null,
                        isLoggedIn: false,
                        loading: true,
                        error: "Some error"
                    }
                }
            })
            
            // Loading should be checked first, before error
            expect(screen.getByText("Loading...")).toBeInTheDocument()
            expect(screen.queryByTestId("navigate-redirect")).not.toBeInTheDocument()
        })
    })
})