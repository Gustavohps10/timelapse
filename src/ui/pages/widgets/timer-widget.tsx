import { ClockArrowUp, Pin, Play } from 'lucide-react'
import { useEffect } from 'react'

import { Timer } from '@/ui/components/timer'
import { Button } from '@/ui/components/ui/button'

export function TimerWidget() {
  useEffect(() => {
    document.body.style.background = 'transparent'

    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="h-screen w-screen text-white">
      <div
        className="drag-bar my-2 flex justify-center rounded-md p-2"
        style={
          {
            backgroundColor: 'rgba(0,0,0,0.4)',
            paddingLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            WebkitAppRegion: 'drag',
          } as React.CSSProperties & { WebkitAppRegion: string }
        }
      >
        <Timer size="medium" />
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm">
          <Play />
        </Button>
        <Button size="sm" className="bg-[#0000007c] hover:bg-[#000000a8]">
          <Pin />
        </Button>
        <Button size="sm" className="bg-[#0000007c] hover:bg-[#000000a8]">
          <ClockArrowUp />
        </Button>
      </div>
    </div>
  )
}
