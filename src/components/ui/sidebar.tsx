'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Sheet, SheetContent, SheetTrigger } from './sheet'
import { cn } from '../../lib/utils'

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <Sheet open={open} onOpenChange={setOpen}>
        {children}
      </Sheet>
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('Sidebar must be used within SidebarProvider')

  return (
    <SheetContent side="left" className="w-[240px] sm:w-[300px]">
      {children}
    </SheetContent>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-2 border-b">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-2">{children}</div>
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </h3>
  )
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <nav className="space-y-1">{children}</nav>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-2 border-t">{children}</div>
}

const sidebarMenuButtonVariants = cva(
  'flex items-center w-full px-2 py-1 text-sm font-medium rounded-md',
  {
    variants: {
      isActive: {
        true: 'bg-primary/10 text-primary',
        false: 'text-gray-600 hover:bg-gray-50',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
)

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(sidebarMenuButtonVariants({ isActive, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

export function SidebarTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('SidebarTrigger must be used within SidebarProvider')

  return (
    <SheetTrigger asChild>
      <button onClick={() => context.setOpen(true)}>{children}</button>
    </SheetTrigger>
  )
}