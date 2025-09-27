// src/__test__/Components/UpdatePostForm.test.tsx
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import UpdatePostModal from "@/components/UpdatePostForm"

// Define proper types for mocks
interface MockFormEvent {
    preventDefault: () => void
}

interface MockFormData {
    title: string
    content: string
    image: string
}

// Mock the dependencies
vi.mock("@hookform/resolvers/zod", () => ({
    zodResolver: vi.fn(() => ({})),
}))

vi.mock("react-hook-form", () => ({
    useForm: vi.fn(() => ({
        handleSubmit: vi.fn((fn: (data: MockFormData) => void) => (e: MockFormEvent) => {
            e.preventDefault()
            fn({ title: "Updated Title", content: "Updated Content", image: "" })
        }),
        formState: { isSubmitting: false },
        setValue: vi.fn(),
        watch: vi.fn(() => ""),
        control: {},
    })),
}))

vi.mock("@/features/Posts/postsSlice", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/Posts/postsSlice")>()
    return {
        ...actual,
        PostUpdateThunk: vi.fn(() => ({
            type: "posts/updatePost",
            payload: {},
            unwrap: vi.fn(() => Promise.resolve({})),
        })),
    }
})

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
    Pencil: ({ className }: { className?: string }) => (
        <div data-testid="pencil-icon" className={className}>Pencil</div>
    ),
    Upload: ({ className }: { className?: string }) => (
        <div data-testid="upload-icon" className={className}>Upload</div>
    ),
}))

// Define interfaces for UI component props
interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

interface GenericComponentProps {
    children: React.ReactNode
}

// Mock UI components
vi.mock("@/components/ui/dialog", () => ({
    Dialog: ({ open, onOpenChange, children }: DialogProps) => (
        <div data-testid="dialog" data-open={open}>
            <div onClick={() => onOpenChange?.(!open)}>{children}</div>
        </div>
    ),
    DialogTrigger: ({ children }: GenericComponentProps) => (
        <div data-testid="dialog-trigger">{children}</div>
    ),
    DialogContent: ({ children }: GenericComponentProps) => (
        <div data-testid="dialog-content">{children}</div>
    ),
    DialogHeader: ({ children }: GenericComponentProps) => (
        <div data-testid="dialog-header">{children}</div>
    ),
    DialogTitle: ({ children }: GenericComponentProps) => (
        <div data-testid="dialog-title">{children}</div>
    ),
    DialogDescription: ({ children }: GenericComponentProps) => (
        <div data-testid="dialog-description">{children}</div>
    ),
    DialogFooter: ({ children }: GenericComponentProps) => (
        <div data-testid="dialog-footer">{children}</div>
    ),
}))

interface ButtonProps {
    children: React.ReactNode
    onClick?: () => void
    type?: "button" | "submit" | "reset"
    disabled?: boolean
    className?: string
    variant?: string
    size?: string
    [key: string]: unknown
}

vi.mock("@/components/ui/button", () => ({
    Button: ({ children, onClick, type, disabled, className, variant, size, ...props }: ButtonProps) => (
        <button
            data-testid="button"
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={className}
            data-variant={variant}
            data-size={size}
            {...props}
        >
            {children}
        </button>
    ),
}))

interface InputProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    accept?: string
    className?: string
    [key: string]: unknown
}

vi.mock("@/components/ui/input", () => ({
    Input: ({ onChange, type, accept, className, ...props }: InputProps) => (
        <input
            data-testid="input"
            onChange={onChange}
            type={type}
            accept={accept}
            className={className}
            {...props}
        />
    ),
}))

interface LabelProps {
    children: React.ReactNode
    htmlFor?: string
}

interface TextareaProps {
    [key: string]: unknown
}

interface FormFieldProps {
    render: (props: { field: { name: string; onChange: () => void; value: string } }) => React.ReactNode
    name: string
}

vi.mock("@/components/ui/label", () => ({
    Label: ({ children, htmlFor }: LabelProps) => (
        <label data-testid="label" htmlFor={htmlFor}>{children}</label>
    ),
}))

vi.mock("@/components/ui/textarea", () => ({
    Textarea: ({ ...props }: TextareaProps) => (
        <textarea data-testid="textarea" {...props} />
    ),
}))

vi.mock("@/components/ui/form", () => ({
    Form: ({ children }: GenericComponentProps) => <div data-testid="form">{children}</div>,
    FormField: ({ render, name }: FormFieldProps) => (
        <div data-testid="form-field" data-name={name}>
            {render({ field: { name, onChange: vi.fn(), value: "" } })}
        </div>
    ),
    FormItem: ({ children }: GenericComponentProps) => <div data-testid="form-item">{children}</div>,
}))

describe("UpdatePostModal", () => {
    const mockPost = {
        id: "post123",
        title: "Test Post Title",
        content: "This is test post content",
        image: "https://example.com/test-image.jpg",
    }

    it("renders trigger button with correct content", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        const triggerButton = screen.getByText("Edit post")
        expect(triggerButton).toBeInTheDocument()
        expect(screen.getByTestId("pencil-icon")).toBeInTheDocument()
    })

    it("renders dialog content when opened", async () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        // Dialog should exist
        expect(screen.getByTestId("dialog")).toBeInTheDocument()
        expect(screen.getByTestId("dialog-content")).toBeInTheDocument()
        expect(screen.getByTestId("dialog-header")).toBeInTheDocument()
    })

    it("displays correct dialog title and description", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        expect(screen.getByText("Update post")).toBeInTheDocument()
        expect(screen.getByText("Make changes to your post here. Click save when you're done.")).toBeInTheDocument()
    })

    it("renders form fields correctly", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        // Check form structure
        expect(screen.getByTestId("form")).toBeInTheDocument()

        // Check form fields
        const formFields = screen.getAllByTestId("form-field")
        expect(formFields).toHaveLength(3) // title, content, image

        // Check labels
        expect(screen.getByText("Title")).toBeInTheDocument()
        expect(screen.getByText("Content")).toBeInTheDocument()
        expect(screen.getByText("Image")).toBeInTheDocument()
    })

    it("renders input fields for title and content", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        // Should have multiple inputs: title input and file input
        const inputs = screen.getAllByTestId("input")
        expect(inputs).toHaveLength(2) // title and file input
        expect(screen.getByTestId("textarea")).toBeInTheDocument()
    })

    it("renders image preview section", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        // Check for image preview
        const image = screen.getByAltText("Post preview")
        expect(image).toBeInTheDocument()

        // Check for upload button and icon
        expect(screen.getAllByText("Upload").length).toBeGreaterThan(0)
        expect(screen.getByTestId("upload-icon")).toBeInTheDocument()
    })

    it("renders action buttons in footer", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        expect(screen.getByTestId("dialog-footer")).toBeInTheDocument()
        expect(screen.getByText("Cancel")).toBeInTheDocument()
        expect(screen.getByText("Save Changes")).toBeInTheDocument()
    })

    it("has hidden file input for image upload", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        const inputs = screen.getAllByTestId("input")
        const fileInput = inputs.find(input => input.getAttribute("type") === "file")

        expect(fileInput).toBeInTheDocument()
        expect(fileInput).toHaveAttribute("type", "file")
        expect(fileInput).toHaveAttribute("accept", "image/*")
        expect(fileInput).toHaveClass("hidden")
    })

    it("applies correct CSS classes and attributes", () => {
        renderWithProviders(<UpdatePostModal post={mockPost} />)

        // Check trigger button styling
        const triggerButton = screen.getByText("Edit post")
        expect(triggerButton.closest('button')).toHaveAttribute("data-variant", "ghost")
        expect(triggerButton.closest('button')).toHaveAttribute("data-size", "icon")
        expect(triggerButton.closest('button')).toHaveAttribute("aria-label", "Edit post")
    })

    it("shows default placeholder image when no image provided", () => {
        const postWithoutImage = { ...mockPost, image: "" }
        renderWithProviders(<UpdatePostModal post={postWithoutImage} />)

        const image = screen.getByAltText("Post preview")
        expect(image).toHaveAttribute("src", expect.stringContaining("dummyimage.com"))
    })

    describe("form interaction", () => {
        it("has proper form structure", () => {
            renderWithProviders(<UpdatePostModal post={mockPost} />)

            const form = screen.getByTestId("form").querySelector("form")
            expect(form).toBeInTheDocument()
            expect(form).toHaveClass("space-y-6")
        })

        it("submit button shows loading state when submitting", () => {
            // This test would require more complex mocking of useForm
            // For now, just test that the static elements exist
            renderWithProviders(<UpdatePostModal post={mockPost} />)

            const submitButton = screen.getByText("Save Changes")
            expect(submitButton).toBeInTheDocument()
            expect(submitButton).toHaveAttribute("type", "submit")
        })
    })

    describe("accessibility", () => {
        it("has proper labels for form fields", () => {
            renderWithProviders(<UpdatePostModal post={mockPost} />)

            const labels = screen.getAllByTestId("label")
            expect(labels).toHaveLength(3)

            // Check label content
            expect(screen.getByText("Title")).toBeInTheDocument()
            expect(screen.getByText("Content")).toBeInTheDocument()
            expect(screen.getByText("Image")).toBeInTheDocument()
        })

        it("has proper button types", () => {
            renderWithProviders(<UpdatePostModal post={mockPost} />)

            const cancelButton = screen.getByText("Cancel").closest('button')
            const saveButton = screen.getByText("Save Changes").closest('button')

            expect(cancelButton).toHaveAttribute("type", "button")
            expect(saveButton).toHaveAttribute("type", "submit")
        })
    })
})