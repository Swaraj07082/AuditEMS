'use client'

import * as React from 'react'
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'

export const DropdownMenu = RadixDropdownMenu.Root

export const DropdownMenuTrigger = RadixDropdownMenu.Trigger

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(({ children, ...props }, ref) => (
  <RadixDropdownMenu.Portal>
    <RadixDropdownMenu.Content
      ref={ref}
      sideOffset={4}
      className="bg-white border border-gray-200 rounded-md shadow-md p-1 z-50"
      {...props}
    >
      {children}
    </RadixDropdownMenu.Content>
  </RadixDropdownMenu.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>
>(({ children, ...props }, ref) => (
  <RadixDropdownMenu.Item
    ref={ref}
    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
    {...props}
  >
    {children}
  </RadixDropdownMenu.Item>
))
DropdownMenuItem.displayName = 'DropdownMenuItem'
