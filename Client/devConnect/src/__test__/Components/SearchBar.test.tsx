// src/__test__/Components/SearchBar.test.tsx
import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import { renderWithProviders } from "../test.util.tsx"
import SearchBar from "@/components/SearchBar"

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
    Search: ({ className }: { className?: string }) => (
        <div data-testid="search-icon" className={className}>Search Icon</div>
    ),
}))

describe("SearchBar", () => {
    it("renders search form with all elements", () => {
        renderWithProviders(<SearchBar />)
        
        // Check form element - use container query since form role is not always accessible
        const container = screen.getByRole("searchbox").closest("form")
        expect(container).toBeInTheDocument()
        
        // Check search icon
        expect(screen.getByTestId("search-icon")).toBeInTheDocument()
        
        // Check input field
        const searchInput = screen.getByPlaceholderText("Search posts...")
        expect(searchInput).toBeInTheDocument()
        expect(searchInput).toHaveAttribute("type", "search")
        
        // Check submit button
        expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument()
    })

    it("applies default classes correctly", () => {
        renderWithProviders(<SearchBar />)
        
        const form = screen.getByRole("searchbox").closest("form")!
        expect(form).toHaveClass("relative", "w-full", "max-w-md", "border-2", "border-input/30", "rounded-md")
        
        const searchIcon = screen.getByTestId("search-icon")
        expect(searchIcon).toHaveClass("absolute", "left-2.5", "top-2.5", "h-4", "w-4", "text-muted-foreground")
        
        const input = screen.getByPlaceholderText("Search posts...")
        expect(input).toHaveClass("w-full", "pl-9", "pr-12", "pt-2", "pb-2")
        
        const button = screen.getByRole("button", { name: /search/i })
        expect(button).toHaveClass("absolute", "right-0", "top-0", "h-full", "px-3", "cursor-pointer", "hover:bg-input/20")
    })

    it("accepts and applies custom className prop", () => {
        const customClass = "custom-search-class"
        renderWithProviders(<SearchBar className={customClass} />)
        
        const form = screen.getByRole("searchbox").closest("form")!
        expect(form).toHaveClass(customClass)
    })

    it("accepts and applies custom button className prop", () => {
        const customButtonClass = "custom-button-class"
        renderWithProviders(<SearchBar button={customButtonClass} />)
        
        const button = screen.getByRole("button", { name: /search/i })
        expect(button).toHaveClass(customButtonClass)
    })

    it("applies both custom className and button className", () => {
        const customClass = "custom-search-class"
        const customButtonClass = "custom-button-class"
        renderWithProviders(<SearchBar className={customClass} button={customButtonClass} />)
        
        const form = screen.getByRole("searchbox").closest("form")!
        expect(form).toHaveClass(customClass)
        
        const button = screen.getByRole("button", { name: /search/i })
        expect(button).toHaveClass(customButtonClass)
    })

    it("handles user input correctly", () => {
        renderWithProviders(<SearchBar />)
        
        const input = screen.getByPlaceholderText("Search posts...")
        fireEvent.change(input, { target: { value: "test search query" } })
        
        expect(input).toHaveValue("test search query")
    })

    it("has correct button attributes", () => {
        renderWithProviders(<SearchBar />)
        
        const button = screen.getByRole("button", { name: /search/i })
        expect(button).toHaveAttribute("type", "submit")
    })

    it("maintains form structure and layout", () => {
        renderWithProviders(<SearchBar />)
        
        const form = screen.getByRole("searchbox").closest("form")!
        const innerDiv = form.querySelector("div.relative")
        
        expect(innerDiv).toBeInTheDocument()
        expect(innerDiv).toHaveClass("relative")
        
        // Ensure all components are within the form
        expect(form).toContainElement(screen.getByTestId("search-icon"))
        expect(form).toContainElement(screen.getByPlaceholderText("Search posts..."))
        expect(form).toContainElement(screen.getByRole("button", { name: /search/i }))
    })

    it("handles empty className and button props gracefully", () => {
        renderWithProviders(<SearchBar className="" button="" />)
        
        const form = screen.getByRole("searchbox").closest("form")!
        const button = screen.getByRole("button", { name: /search/i })
        
        // Should still render without errors
        expect(form).toBeInTheDocument()
        expect(button).toBeInTheDocument()
    })
})