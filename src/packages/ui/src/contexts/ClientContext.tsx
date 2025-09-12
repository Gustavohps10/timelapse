import { IApplicationClient } from '@timelapse/application'
import React from 'react'
import { createContext } from 'react'

export const ClientContext = createContext<IApplicationClient | null>(null)

interface ClientProviderProps {
  client: IApplicationClient
  children: React.ReactNode
}

export function ClientProvider({ client, children }: ClientProviderProps) {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  )
}
