import { useQuery } from '@tanstack/react-query'
import { WorkspaceViewModel } from '@timelapse/presentation/view-models'
import { createContext, ReactNode } from 'react'
import { useParams } from 'react-router'

import { useClient } from '@/hooks'

export interface WorkspaceContextType {
  workspace?: WorkspaceViewModel
  isLoading: boolean
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
)

interface WorkspaceProviderProps {
  children: ReactNode
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
}) => {
  const client = useClient()
  const { workspaceId } = useParams<{ workspaceId: string }>()

  const {
    data: workspace,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return undefined

      const response = await client.services.workspaces.getById({
        body: { workspaceId },
      })

      console.log('Resposta:', response)
      return response.data ?? undefined
    },
    enabled: !!workspaceId,
  })

  console.log(workspace)

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
