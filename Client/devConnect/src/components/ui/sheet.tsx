import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Root
const Sheet = (props: React.ComponentProps<typeof SheetPrimitive.Root>) => (
    <SheetPrimitive.Root data-slot="sheet" {...props} />
)

// Trigger
const SheetTrigger = (props: React.ComponentProps<typeof SheetPrimitive.Trigger>) => (
    <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
)

// Close
const SheetClose = (props: React.ComponentProps<typeof SheetPrimitive.Close>) => (
    <SheetPrimitive.Close data-slot="sheet-close" {...props} />
)

// Portal
const SheetPortal = (props: React.ComponentProps<typeof SheetPrimitive.Portal>) => (
    <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
)

// Overlay
const SheetOverlay = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay
        ref={ref}
        data-slot="sheet-overlay"
        className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "fixed inset-0 z-50 bg-black/50",
            className
        )}
        {...props}
    />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// Content
const SheetContent = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left"
}
>(({ className, children, side = "right", ...props }, ref) => (
    <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
            ref={ref}
            data-slot="sheet-content"
            className={cn(
                "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out",
                "fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out",
                "data-[state=closed]:duration-300 data-[state=open]:duration-500",
                side === "right" &&
                "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                side === "left" &&
                "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                side === "top" &&
                "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                side === "bottom" &&
                "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                className
            )}
            {...props}
        >
            {children}
            <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background data-[state=open]:bg-secondary disabled:pointer-events-none">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
        </SheetPrimitive.Content>
    </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

// Header
const SheetHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        data-slot="sheet-header"
        className={cn("flex flex-col gap-1.5 p-4", className)}
        {...props}
    />
)

// Footer
const SheetFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
        data-slot="sheet-footer"
        className={cn("mt-auto flex flex-col gap-2 p-4", className)}
        {...props}
    />
)

// Title
const SheetTitle = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Title
        ref={ref}
        data-slot="sheet-title"
        className={cn("text-foreground font-semibold", className)}
        {...props}
    />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

// Description
const SheetDescription = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Description
        ref={ref}
        data-slot="sheet-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
    />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
