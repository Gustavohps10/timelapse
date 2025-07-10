import { useContext } from 'react'

import { IClient } from '@/client'
import { ClientContext } from '@/contexts/ClientContext'

export function useClient(): IClient {
  const context = useContext(ClientContext)
  console.log(context)
  if (!context) {
    throw new Error(
      'useClient() deve ser usado dentro de um <ClientContext.Provider>.',
    )
  }

  return context
}
