"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "light" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="bottom-center"
      offset={112}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-md !border !border-border-strong !bg-popover !text-popover-foreground !shadow-[var(--shadow-float)] !font-sans !text-[13px] !gap-2.5 !py-2.5 !px-3.5",
          icon: "!text-clay",
          description: "!text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border-strong)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
