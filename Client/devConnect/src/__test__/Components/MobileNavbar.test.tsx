// src/__test__/Components/MobileNavbar.test.tsx
import {beforeEach, describe, expect, it, vi} from "vitest"
import {fireEvent, screen, waitFor} from "@testing-library/react"
import {renderWithProviders} from "../test.util.tsx"
import MobileNavbar from "@/components/MobileNavbar"

// Mock dependencies
vi.mock("@/features/Auth/authSlice", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/Auth/authSlice")>()
    return {
        ...actual,
        logout: vi.fn(() => ({type: 'auth/logout/fulfilled'})),
        default: actual.default,
    }
})

vi.mock("../assets/DevConnect.png", () => ({
    default: "mocked-logo.png",
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({to, children, className}: { to: string; children: React.ReactNode; className?: string }) => (
            <a href={to} className={className}>{children}</a>
        ),
    }
})

describe("MobileNavbar", () => {
    const mockRoutes = [
        {path: "/", label: "Home", icon: <span>🏠</span>},
        {path: "/profile", label: "Profile", icon: <span>👤</span>},
        {path: "/messages", label: "Messages", icon: <span>💬</span>},
    ]

    const mockUser = {
        username: "testuser",
        email: "test@example.com",
        avatar: "avatar.jpg"
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("when user is not logged in", () => {
        it("renders menu trigger button", () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            expect(screen.getByRole("button")).toBeInTheDocument()
            expect(screen.getByText("Toggle menu")).toBeInTheDocument()
        })

        it("shows login and signup buttons in footer when sheet is opened", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByRole("link", {name: /log in/i})).toBeInTheDocument()
                expect(screen.getByRole("link", {name: /sign up/i})).toBeInTheDocument()
            })
        })

        it("shows search form when sheet is opened", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByPlaceholderText("Search posts...")).toBeInTheDocument()
                expect(screen.getByRole("button", {name: /search/i})).toBeInTheDocument()
            })
        })

        it("does not show navigation routes or user info", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.queryByText("Home")).not.toBeInTheDocument()
                expect(screen.queryByText("Profile")).not.toBeInTheDocument()
                expect(screen.queryByText("Logout")).not.toBeInTheDocument()
            })
        })
    })

    describe("when user is logged in", () => {
        it("shows navigation routes when sheet is opened", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByText("Home")).toBeInTheDocument()
                expect(screen.getByText("Profile")).toBeInTheDocument()
                expect(screen.getByText("Messages")).toBeInTheDocument()
            })
        })

        it("shows logout button when sheet is opened", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                const logoutElement = screen.queryByText("Logout") ||
                    screen.queryByRole("button", {name: /logout/i}) ||
                    screen.queryByText((content, element) =>
                        element?.textContent === "Logout"
                    )
                expect(logoutElement).toBeInTheDocument()
            })
        })

        it("shows user information in footer when sheet is opened", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByText(mockUser.username)).toBeInTheDocument()
                expect(screen.getByText(mockUser.email)).toBeInTheDocument()
            })
        })

        it("displays user avatar with fallback", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByText(mockUser.username)).toBeInTheDocument()
                expect(screen.getByText(mockUser.email)).toBeInTheDocument()
            }, {timeout: 3000})
        })

        it("shows user initial as fallback when no avatar", async () => {
            const userWithoutAvatar = {
                username: "testuser",
                email: "test@example.com"
            }

            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={userWithoutAvatar}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByText("testuser")).toBeInTheDocument()
                expect(screen.getByText("test@example.com")).toBeInTheDocument()
            })
        })

        it("renders avatar section when user is provided", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByText(mockUser.username)).toBeInTheDocument()
                expect(screen.getByText(mockUser.email)).toBeInTheDocument()
            })
        })

        it("handles logout when logout button is clicked", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                const logoutButton = screen.getByText("Logout")
                fireEvent.click(logoutButton)
            })

            expect(mockNavigate).toHaveBeenCalledWith("/")
        })

        it("does not show login/signup buttons", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={mockUser}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.queryByRole("link", {name: /log in/i})).not.toBeInTheDocument()
                expect(screen.queryByRole("link", {name: /sign up/i})).not.toBeInTheDocument()
            })
        })
    })

    describe("logo and branding", () => {
        it("displays logo in header when sheet is opened", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                const logo = screen.getByAltText("logo")
                expect(logo).toBeInTheDocument()
                expect(logo).toHaveAttribute('src')
            })
        })

        it("falls back to placeholder when logo is not available", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                const logo = screen.getByAltText("logo")
                expect(logo).toBeInTheDocument()
            })
        })
    })

    describe("search functionality", () => {
        it("renders search input and button", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(screen.getByPlaceholderText("Search posts...")).toBeInTheDocument()
                expect(screen.getByRole("button", {name: /search/i})).toBeInTheDocument()
            })
        })

        it("allows typing in search input", async () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText("Search posts...")
                fireEvent.change(searchInput, {target: {value: "test search"}})
                expect(searchInput).toHaveValue("test search")
            })
        })
    })

    describe("accessibility", () => {
        it("has proper screen reader text for menu toggle", () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            expect(screen.getByText("Toggle menu")).toBeInTheDocument()
        })

        it("has proper ARIA attributes on avatar fallback", async () => {
            const userWithoutAvatar = {
                username: "testuser",
                email: "test@example.com"
            }

            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={true}
                    user={userWithoutAvatar}
                    filteredRoutes={mockRoutes}
                />
            )

            fireEvent.click(screen.getByRole("button"))

            await waitFor(() => {
                expect(
                    screen.getByText((content) => content.startsWith("T"))
                ).toBeInTheDocument()
            })
        })
    })

    describe("responsive behavior", () => {
        it("only shows on mobile (has md:hidden class)", () => {
            renderWithProviders(
                <MobileNavbar
                    isLoggedIn={false}
                    filteredRoutes={mockRoutes}
                />
            )

            const menuButton = screen.getByRole("button")
            expect(menuButton).toHaveClass("md:hidden")
        })
    })
})
