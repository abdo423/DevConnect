// src/__test__/Components/Post.test.tsx
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import Post from "@/components/Post"
import { PostProps } from "../../Types/post"

// Mock the dependencies
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock("date-fns", () => ({
    formatDistanceToNow: vi.fn(() => "2 hours ago"),
}))

vi.mock("lucide-react", () => ({
    Heart: ({ className }: { className?: string }) => (
        <div data-testid="heart-icon" className={className}>Heart</div>
    ),
    MoreHorizontal: ({ className }: { className?: string }) => (
        <div data-testid="more-horizontal-icon" className={className}>MoreHorizontal</div>
    ),
}))

vi.mock("@/features/Posts/postsSlice", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/Posts/postsSlice")>()
    return {
        ...actual,
        erasePost: vi.fn(() => ({
            type: "posts/deletePost",
            payload: {},
        })),
        likesPost: vi.fn(() => ({
            type: "posts/likePost",
            payload: {},
            unwrap: vi.fn(() => Promise.resolve({})),
        })),
    }
})

vi.mock("@/features/Comments/commentsSlice.ts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/Comments/commentsSlice")>()
    return {
        ...actual,
        fetchComments: vi.fn(() => ({
            type: "comments/fetchComments",
            payload: {},
        })),
    }
})

vi.mock("@/components/ui/avatar", () => ({
    Avatar: ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
        <div data-testid="avatar" onClick={onClick}>{children}</div>
    ),
    AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
        <img data-testid="avatar-image" src={src} alt={alt} />
    ),
    AvatarFallback: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="avatar-fallback">{children}</div>
    ),
}))

vi.mock("@/components/ui/button", () => ({
    Button: ({ 
        children, 
        onClick, 
        variant, 
        size, 
        className 
    }: { 
        children: React.ReactNode
        onClick?: () => void
        variant?: string
        size?: string
        className?: string
    }) => (
        <button
            data-testid="button"
            onClick={onClick}
            data-variant={variant}
            data-size={size}
            className={className}
        >
            {children}
        </button>
    ),
}))

vi.mock("@/components/ui/card", () => ({
    Card: ({ className, children }: { className?: string; children: React.ReactNode }) => (
        <div data-testid="card" className={className}>{children}</div>
    ),
    CardHeader: ({ className, children }: { className?: string; children: React.ReactNode }) => (
        <div data-testid="card-header" className={className}>{children}</div>
    ),
    CardContent: ({ className, children }: { className?: string; children: React.ReactNode }) => (
        <div data-testid="card-content" className={className}>{children}</div>
    ),
    CardFooter: ({ className, children }: { className?: string; children: React.ReactNode }) => (
        <div data-testid="card-footer" className={className}>{children}</div>
    ),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-menu">{children}</div>
    ),
    DropdownMenuTrigger: ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => (
        <div data-testid="dropdown-menu-trigger">{children}</div>
    ),
    DropdownMenuContent: ({ align, children }: { align?: string; children: React.ReactNode }) => (
        <div data-testid="dropdown-menu-content" data-align={align}>{children}</div>
    ),
    DropdownMenuItem: ({ onClick, className, children }: { onClick?: () => void; className?: string; children: React.ReactNode }) => (
        <div data-testid="dropdown-menu-item" onClick={onClick} className={className}>{children}</div>
    ),
}))

vi.mock("@/components/PostSkeletonLoad.tsx", () => ({
    default: () => <div data-testid="post-skeleton">Loading...</div>
}))

vi.mock("@/components/UpdatePostForm.tsx", () => ({
    default: ({ post }: { post: { id: string; title: string; content: string; image: string } }) => (
        <div data-testid="update-post-modal" data-post-id={post.id}>Update Post Modal</div>
    )
}))

vi.mock("@/components/CommentsPopUp.tsx", () => ({
    default: ({ 
        isLoggedIn, 
        onNavigateToLogin, 
        postData 
    }: { 
        isLoggedIn: boolean
        onNavigateToLogin: () => void
        postData: {
            _id: string
            title: string
            author: string
            authorAvatar?: string
            image?: string
            date: Date | string
            likes: number
            commentCount: number
        }
    }) => (
        <div 
            data-testid="comments-popup" 
            data-logged-in={isLoggedIn}
            data-post-id={postData._id}
            onClick={onNavigateToLogin}
        >
            Comments ({postData.commentCount})
        </div>
    )
}))

describe("Post", () => {
    const mockPost: PostProps["post"] = {
        _id: "post123",
        title: "Test Post Title",
        content: "This is a test post content that should be displayed properly in the component.",
        image: "https://example.com/test-image.jpg",
        likes: ["user1", "user2"],
        comments: ["comment1", "comment2"],
        author_id: {
            _id: "author123",
            email: "author@example.com",
            username: "testauthor",
            avatar: "https://example.com/avatar.jpg"
        },
        createdAt: new Date("2023-01-01T12:00:00Z"),
        updatedAt: new Date("2023-01-01T12:00:00Z")
    }

    const mockUser: PostProps["user"] = {
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        avatar: "https://example.com/user-avatar.jpg",
        bio: "Test user bio"
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockNavigate.mockClear()
    })

    describe("when loading", () => {
        it("renders skeleton when loading is true", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: true, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            expect(screen.getByTestId("post-skeleton")).toBeInTheDocument()
            expect(screen.queryByTestId("card")).not.toBeInTheDocument()
        })
    })

    describe("when loaded", () => {
        const defaultState = {
            auth: { user: null, isLoggedIn: false, loading: false, error: null },
            post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
        }

        it("renders post content correctly", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: defaultState
            })

            expect(screen.getByTestId("card")).toBeInTheDocument()
            expect(screen.getByText(mockPost.title)).toBeInTheDocument()
            expect(screen.getByText(mockPost.content)).toBeInTheDocument()
            expect(screen.getByText("2 hours ago")).toBeInTheDocument()
        })

        it("renders post image when provided", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: defaultState
            })

            const image = screen.getByAltText("Post")
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute("src", mockPost.image)
        })

        it("does not render image when not provided", () => {
            const postWithoutImage = { ...mockPost, image: undefined }
            renderWithProviders(<Post post={postWithoutImage} user={mockUser} />, {
                preloadedState: defaultState
            })

            expect(screen.queryByAltText("Post")).not.toBeInTheDocument()
        })

        it("renders author information correctly", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: defaultState
            })

            // The component shows user?.username || author.username, so it should show mockUser.username
            expect(screen.getByText(mockUser.username!)).toBeInTheDocument()
            
            // Check for avatar
            expect(screen.getByTestId("avatar")).toBeInTheDocument()
            expect(screen.getByTestId("avatar-image")).toBeInTheDocument()
        })

        it("handles string author_id correctly", () => {
            const postWithStringAuthor = { ...mockPost, author_id: "string-author-id" }
            renderWithProviders(<Post post={postWithStringAuthor} user={mockUser} />, {
                preloadedState: defaultState
            })

            // Component still shows user?.username since user prop takes precedence
            expect(screen.getByText(mockUser.username!)).toBeInTheDocument()
            expect(screen.getByTestId("card")).toBeInTheDocument()
        })
    })

    describe("text expansion", () => {
        const longContent = "A".repeat(200) // Content longer than 150 characters

        it("truncates long content and shows 'Show more' button", () => {
            const postWithLongContent = { ...mockPost, content: longContent }
            renderWithProviders(<Post post={postWithLongContent} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            expect(screen.getByText(longContent.substring(0, 150) + "...")).toBeInTheDocument()
            expect(screen.getByText("Show more")).toBeInTheDocument()
        })

        it("expands content when 'Show more' is clicked", () => {
            const postWithLongContent = { ...mockPost, content: longContent }
            renderWithProviders(<Post post={postWithLongContent} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            const showMoreButton = screen.getByText("Show more")
            fireEvent.click(showMoreButton)

            expect(screen.getByText(longContent)).toBeInTheDocument()
            expect(screen.getByText("Show less")).toBeInTheDocument()
        })
    })

    describe("like functionality", () => {
        it("displays correct like count", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            expect(screen.getByText("2")).toBeInTheDocument() // 2 likes from mockPost
        })

        it("redirects to login when not logged in and like is clicked", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            const likeButton = screen.getAllByTestId("button").find(button => 
                button.querySelector('[data-testid="heart-icon"]')
            )
            
            if (likeButton) {
                fireEvent.click(likeButton)
                expect(mockNavigate).toHaveBeenCalledWith("/login")
            }
        })
    })

    describe("authenticated user interactions", () => {
        const authenticatedState = {
            auth: { 
                user: { 
                    _id: "author123", 
                    username: "testauthor", 
                    email: "author@example.com", 
                    avatar: "avatar.jpg", 
                    bio: "Bio",
                    posts: [],
                    followers: [],
                    following: [],
                    createdAt: "2023-01-01",
                    updatedAt: "2023-01-01"
                }, 
                isLoggedIn: true, 
                loading: false, 
                error: null 
            },
            post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
        }

        it("shows edit option when user is post author", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: authenticatedState
            })

            expect(screen.getByTestId("update-post-modal")).toBeInTheDocument()
        })

        it("shows delete option when user is post author", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: authenticatedState
            })

            expect(screen.getByText("Delete post")).toBeInTheDocument()
        })

        it("navigates to profile when avatar is clicked and user is logged in", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: authenticatedState
            })

            const avatar = screen.getByTestId("avatar")
            fireEvent.click(avatar)
            
            expect(mockNavigate).toHaveBeenCalledWith("/profile/author123")
        })
    })

    describe("dropdown menu", () => {
        it("renders dropdown menu with correct structure", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument()
            expect(screen.getByTestId("dropdown-menu-trigger")).toBeInTheDocument()
            expect(screen.getByTestId("dropdown-menu-content")).toBeInTheDocument()
            expect(screen.getByText("Save post")).toBeInTheDocument()
        })
    })

    describe("comments integration", () => {
        it("renders comments popup with correct props", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            const commentsPopup = screen.getByTestId("comments-popup")
            expect(commentsPopup).toBeInTheDocument()
            expect(commentsPopup).toHaveAttribute("data-logged-in", "false")
            expect(commentsPopup).toHaveAttribute("data-post-id", "post123")
        })
    })

    describe("responsive design", () => {
        it("applies correct CSS classes for responsive layout", () => {
            renderWithProviders(<Post post={mockPost} user={mockUser} />, {
                preloadedState: {
                    auth: { user: null, isLoggedIn: false, loading: false, error: null },
                    post: { posts: [], loading: false, error: null, postCreated: false, postDeleted: false, postUpdated: false, currentPost: null }
                }
            })

            const card = screen.getByTestId("card")
            expect(card).toHaveClass("max-w-xl", "mx-auto", "overflow-hidden")
        })
    })
})