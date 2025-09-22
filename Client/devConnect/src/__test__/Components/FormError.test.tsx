// src/__test__/Components/FormError.test.tsx
import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import FormError from "@/components/FormError.tsx"

// Mock radix icons
vi.mock("@radix-ui/react-icons", () => ({
    ExclamationTriangleIcon: ({ className }: { className?: string }) => (
        <div data-testid="error-icon" className={className}>Error Icon</div>
    ),
}))

describe("FormError", () => {
    it("renders error message when message prop is provided", () => {
        const errorMessage = "This is an error message"
        renderWithProviders(<FormError message={errorMessage} />)

        // Check that the error container is rendered
        const errorContainer = screen.getByTestId("form-error")
        expect(errorContainer).toBeInTheDocument()

        // Check that the error icon is rendered
        expect(screen.getByTestId("error-icon")).toBeInTheDocument()

        // Check that the error message is rendered
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it("does not render when message prop is undefined", () => {
        renderWithProviders(<FormError />)

        expect(screen.queryByTestId("form-error")).not.toBeInTheDocument()
        expect(screen.queryByTestId("error-icon")).not.toBeInTheDocument()
    })

    it("does not render when message prop is empty string", () => {
        renderWithProviders(<FormError message="" />)

        expect(screen.queryByTestId("form-error")).not.toBeInTheDocument()
        expect(screen.queryByTestId("error-icon")).not.toBeInTheDocument()
    })

    it("applies correct CSS classes to error container", () => {
        renderWithProviders(<FormError message="Error" />)

        const errorContainer = screen.getByTestId("form-error")
        expect(errorContainer).toHaveClass(
            "bg-destructive/35",
            "p-3",
            "rounded-md",
            "flex",
            "items-center",
            "gap-x-2",
            "text-sm",
            "text-destructive"
        )
    })

    it("applies correct CSS classes to error icon", () => {
        renderWithProviders(<FormError message="Error" />)

        const errorIcon = screen.getByTestId("error-icon")
        expect(errorIcon).toHaveClass("w-4", "h-4")
    })

    it("renders message within a span element", () => {
        const errorMessage = "Custom error message"
        renderWithProviders(<FormError message={errorMessage} />)

        const messageSpan = screen.getByText(errorMessage)
        expect(messageSpan.tagName).toBe("SPAN")
    })

    it("handles long error messages", () => {
        const longErrorMessage = "This is a very long error message that should still be rendered correctly without breaking the component layout or functionality"
        renderWithProviders(<FormError message={longErrorMessage} />)

        expect(screen.getByText(longErrorMessage)).toBeInTheDocument()
        expect(screen.getByTestId("form-error")).toBeInTheDocument()
    })

    it("handles special characters in error message", () => {
        const specialCharMessage = "Error: <>&'\"123!@#$%^&*()"
        renderWithProviders(<FormError message={specialCharMessage} />)

        expect(screen.getByText(specialCharMessage)).toBeInTheDocument()
    })

    it("maintains proper DOM structure", () => {
        const errorMessage = "Test error"
        renderWithProviders(<FormError message={errorMessage} />)

        const errorContainer = screen.getByTestId("form-error")
        const errorIcon = screen.getByTestId("error-icon")
        const messageSpan = screen.getByText(errorMessage)

        // Check that icon and message are children of the container
        expect(errorContainer).toContainElement(errorIcon)
        expect(errorContainer).toContainElement(messageSpan)

        // Check that the div has exactly two children (icon and span)
        expect(errorContainer.children).toHaveLength(2)
    })

    describe("edge cases", () => {
        it("handles null message", () => {
            renderWithProviders(<FormError message={null as any} />)

            expect(screen.queryByTestId("form-error")).not.toBeInTheDocument()
        })

        it("handles whitespace-only message", () => {
            renderWithProviders(<FormError message="   " />)

            // Component should render for whitespace (truthy string)
            expect(screen.getByTestId("form-error")).toBeInTheDocument()
            // Just check that the span element exists - whitespace normalization makes exact matching tricky
            expect(screen.getByTestId("form-error").querySelector("span")).toBeInTheDocument()
        })

        it("handles numeric message (converted to string)", () => {
            renderWithProviders(<FormError message={0 as any} />)

            // 0 is falsy, so should not render
            expect(screen.queryByTestId("form-error")).not.toBeInTheDocument()
        })
    })
})