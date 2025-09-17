// src/__test__/Components/RegisterForm.test.tsx
import {describe, expect, it, vi, beforeEach} from "vitest"
import {fireEvent, screen, waitFor} from "@testing-library/react"
import {renderWithProviders} from "../test.util.tsx"
import RegisterForm from "@/components/RegisterForm"

// Create the mock function inside the vi.mock factory
vi.mock("@/features/Auth/authSlice", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/Auth/authSlice")>()
    return {
        ...actual,
        register: vi.fn(() => ({
            type: 'auth/register/pending',
            payload: undefined,
            unwrap: () => Promise.resolve({ message: "Registration successful" }),
        })),
    }
})

import {register} from "@/features/Auth/authSlice"

describe("RegisterForm", () => {
    beforeEach(() => {
        // Reset and set default behavior
        vi.clearAllMocks()
        ;(register as vi.Mock).mockReturnValue({
            type: 'auth/register/pending',
            payload: undefined,
            unwrap: () => Promise.resolve({ message: "Registration successful" }),
        })
    })

    it("renders form inputs", () => {
        renderWithProviders(<RegisterForm />)

        expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Enter your Email/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument()
        expect(screen.getByRole("button", {name: /register/i})).toBeInTheDocument()
    })

    it("shows validation errors if fields are empty", async () => {
        renderWithProviders(<RegisterForm />)

        fireEvent.click(screen.getByRole("button", {name: /register/i}))

        await waitFor(() => {
            expect(screen.getAllByText(/String must contain/i).length).toBeGreaterThan(0)
        })
    })

    it("dispatches register on valid submission", async () => {
        renderWithProviders(<RegisterForm />)

        fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
            target: {value: "testusername"},
        })
        fireEvent.change(screen.getByPlaceholderText(/Enter your Email/i), {
            target: {value: "test@example.com"},
        })
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
            target: {value: "password123"},
        })

        fireEvent.click(screen.getByRole("button", {name: /register/i}))

        await waitFor(() => {
            expect(register).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
                username: "testusername",
            })
        })
    })

    it("shows success message after registration", async () => {
        renderWithProviders(<RegisterForm/>)

        fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
            target: {value: "testusername"},
        })
        fireEvent.change(screen.getByPlaceholderText(/Enter your Email/i), {
            target: {value: "test@example.com"},
        })
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
            target: {value: "password123"},
        })

        fireEvent.click(screen.getByRole("button", {name: /register/i}))

        expect(
            await screen.findByText((content) => content.includes("Registration successful"))
        ).toBeInTheDocument()
    })

    it("shows error message if registration fails", async () => {
        // Override mock for this specific test
          (register as vi.Mock).mockReturnValueOnce({
            type: 'auth/register/pending',
            payload: undefined,
            unwrap: () => Promise.reject({ message: "Registration failed" }),
        })

        renderWithProviders(<RegisterForm />)

        // Fill form
        fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
            target: {value: "testusername"},
        })
        fireEvent.change(screen.getByPlaceholderText(/Enter your Email/i), {
            target: {value: "test@example.com"},
        })
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
            target: {value: "password123"},
        })

        fireEvent.click(screen.getByRole("button", {name: /register/i}))

        // Debug what's actually rendered
        // await waitFor(() => {
        //     console.log("=== DEBUG: Looking for error message ===")
        //     screen.debug()
        //     console.log("All text content:", document.body.textContent)
        // })

        // This will likely fail, showing you need to implement error handling
        expect(
            await screen.findByText((content) => content.includes("Registration failed"))
        ).toBeInTheDocument()
    })
})
