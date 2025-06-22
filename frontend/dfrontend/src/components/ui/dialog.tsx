'use client'

import * as React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

export const Dialog = RadixDialog.Root

export const DialogTrigger = RadixDialog.Trigger

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ children, ...props }, ref) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
    <RadixDialog.Content
      ref={ref}
      className="fixed z-50 bg-white p-6 rounded-lg shadow-lg max-w-md w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </RadixDialog.Portal>
))
DialogContent.displayName = 'DialogContent'

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
)

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <RadixDialog.Title className="text-lg font-bold">{children}</RadixDialog.Title>
)

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <RadixDialog.Description className="text-sm text-gray-500">{children}</RadixDialog.Description>
)
