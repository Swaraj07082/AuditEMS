"use client"
import { SessionProvider } from 'next-auth/react'
import React, { ReactNode } from 'react'


interface providerProps{
    children : ReactNode
}

const provider = ({children} : providerProps) => {
  return <SessionProvider>{children}</SessionProvider>
}

export default provider
