import { useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  return (
    <>
      Workspace Settings para ID: <strong>{workspaceId}</strong>
      <Button className="ml-4">Configurar</Button>
    </>
  )
}
