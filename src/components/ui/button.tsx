import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 tracking-[-0.01em] cursor-pointer",
  {
    variants: {
      variant: {
        // Primary CTA: fully-rounded pill with gentle elevation (DESIGN.md)
        default:
          "rounded-full bg-primary text-primary-foreground elevation-card elevation-card-hover hover:bg-primary/90 active:translate-y-px",
        clay:
          "rounded-full bg-clay text-clay-foreground elevation-card elevation-card-hover hover:bg-clay-strong active:translate-y-px",
        flat:
          "rounded-md bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "rounded-md bg-destructive text-white hover:opacity-90",
        outline:
          "rounded-md border border-border-strong bg-transparent hover:bg-secondary text-foreground",
        secondary:
          "rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "rounded-md hover:bg-secondary text-foreground",
        link: "text-clay underline-offset-4 hover:underline decoration-clay/50",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
