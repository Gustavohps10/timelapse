import { IApplicationClient } from '@timelapse/application'
import { useContext } from 'react'

import { ClientContext } from '@/contexts/ClientContext'

export function useClient(): IApplicationClient {
  const context = useContext(ClientContext)
  console.log(context)
  if (!context) {
    throw new Error(
      'useClient() deve ser usado dentro de um <ClientContext.Provider>.',
    )
  }

  return context
}
