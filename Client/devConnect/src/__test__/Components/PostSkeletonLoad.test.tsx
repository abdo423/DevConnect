// src/__test__/Components/PostSkeletonLoad.test.tsx
import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import PostSkeletonLoad from "@/components/PostSkeletonLoad"

// Mock the UI components
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

vi.mock("@radix-ui/react-avatar", () => ({
    Avatar: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="avatar">{children}</div>
    ),
}))

describe("PostSkeletonLoad", () => {
    it("renders all skeleton elements correctly", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        // Check main card structure
        expect(screen.getByTestId("card")).toBeInTheDocument()
        expect(screen.getByTestId("card-header")).toBeInTheDocument()
        expect(screen.getByTestId("card-content")).toBeInTheDocument()
        expect(screen.getByTestId("card-footer")).toBeInTheDocument()
        
        // Check avatar placeholder
        expect(screen.getByTestId("avatar")).toBeInTheDocument()
    })

    it("applies correct CSS classes to main card", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const card = screen.getByTestId("card")
        expect(card).toHaveClass("max-w-xl", "mx-auto", "overflow-hidden", "animate-pulse")
    })

    it("applies correct CSS classes to card header", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const cardHeader = screen.getByTestId("card-header")
        expect(cardHeader).toHaveClass("flex", "flex-row", "items-center", "space-y-0", "gap-3")
    })

    it("applies correct CSS classes to card content", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const cardContent = screen.getByTestId("card-content")
        expect(cardContent).toHaveClass("px-4", "py-2", "space-y-2")
    })

    it("applies correct CSS classes to card footer", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const cardFooter = screen.getByTestId("card-footer")
        expect(cardFooter).toHaveClass("px-4", "py-2", "flex", "justify-between", "items-center")
    })

    it("renders skeleton avatar element", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        // Check avatar container
        const avatar = screen.getByTestId("avatar")
        expect(avatar).toBeInTheDocument()
        
        // Check avatar skeleton div more specifically
        const avatarSkeletonDiv = avatar.querySelector("div")
        expect(avatarSkeletonDiv).toBeInTheDocument()
        expect(avatarSkeletonDiv).toHaveClass("bg-gray-300", "rounded-full", "h-10", "w-10")
    })

    it("renders skeleton text elements in header", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const cardHeader = screen.getByTestId("card-header")
        
        // Check for skeleton text divs in header
        const headerSkeletons = cardHeader.querySelectorAll("div")
        expect(headerSkeletons.length).toBeGreaterThan(0)
        
        // Should have elements with gray background classes
        const grayElements = cardHeader.querySelectorAll("div[class*='bg-gray']")
        expect(grayElements.length).toBeGreaterThan(0)
    })

    it("renders skeleton text elements in content", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const cardContent = screen.getByTestId("card-content")
        
        // Should have skeleton text elements with gray backgrounds
        const grayElements = cardContent.querySelectorAll("div[class*='bg-gray']")
        expect(grayElements.length).toBe(3) // Three skeleton text lines
    })

    it("renders skeleton elements in footer", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const cardFooter = screen.getByTestId("card-footer")
        
        // Should have skeleton elements for buttons and timestamp
        const grayElements = cardFooter.querySelectorAll("div[class*='bg-gray']")
        expect(grayElements.length).toBe(3) // Two action buttons + timestamp
    })

    it("uses different gray shades for visual hierarchy", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        // Should use bg-gray-300 for primary elements
        const gray300Elements = document.querySelectorAll(".bg-gray-300")
        expect(gray300Elements.length).toBeGreaterThan(0)
        
        // Should use bg-gray-200 for secondary elements
        const gray200Elements = document.querySelectorAll(".bg-gray-200")
        expect(gray200Elements.length).toBeGreaterThan(0)
    })

    it("maintains consistent structure with actual Post component", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        // Check that structure matches expected Post layout
        const card = screen.getByTestId("card")
        const header = screen.getByTestId("card-header")
        const content = screen.getByTestId("card-content")
        const footer = screen.getByTestId("card-footer")
        
        // Verify nesting structure
        expect(card).toContainElement(header)
        expect(card).toContainElement(content)
        expect(card).toContainElement(footer)
    })

    it("renders without any props", () => {
        // Component should not take any props and render successfully
        renderWithProviders(<PostSkeletonLoad />)
        
        expect(screen.getByTestId("card")).toBeInTheDocument()
    })

    it("has proper responsive design classes", () => {
        renderWithProviders(<PostSkeletonLoad />)
        
        const card = screen.getByTestId("card")
        // Should have max-width and centering for responsive design
        expect(card).toHaveClass("max-w-xl", "mx-auto")
    })
})