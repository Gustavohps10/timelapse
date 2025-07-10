import React from 'react'
import { createContext } from 'react'

import { IClient } from '@/client'

export const ClientContext = createContext<IClient | null>(null)

interface ClientProviderProps {
  client: IClient
  children: React.ReactNode
}

export function ClientProvider({ client, children }: ClientProviderProps) {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  )
}
