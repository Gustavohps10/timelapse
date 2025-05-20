import { useEffect } from 'react'

import { Timer } from '@/ui/components/timer'

export function TimerWidget() {
  useEffect(() => {
    // Aplica o fundo transparente apenas nesta janela
    document.body.style.background = 'transparent'

    // Limpa quando sair do componente
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="h-screen w-screen text-white">
      <div
        className="drag-bar"
        style={
          {
            height: '32px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            paddingLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            WebkitAppRegion: 'drag',
          } as React.CSSProperties & { WebkitAppRegion: string }
        }
      >
        <Timer />
      </div>
      {/* Resto da UI */}
    </div>
  )
}
