import { useContext } from 'react'

import {
  WorkspaceContext,
  WorkspaceContextType,
} from '@/contexts/WorkspaceContext'

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('use Workspace must be used within an WorkspaceProvider')
  }
  return context
}
