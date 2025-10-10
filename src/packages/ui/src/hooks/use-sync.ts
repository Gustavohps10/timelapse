import { useContext } from 'react'

import { SyncContext } from '@/contexts/SyncContext'

export function useSync() {
  const context = useContext(SyncContext)
  if (!context)
    throw new Error('useSync deve ser usado dentro de um SyncProvider')
  return context
}
