'use client'

import { differenceInSeconds, parseISO } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import { useTimeEntryStore } from '@/stores/timeEntryStore'

export function useActiveTimer(): number {
  const active = useTimeEntryStore((s) => s.active)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    if (!active || active.timeStatus !== 'running') return

    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [active?.timeStatus])

  const seconds = useMemo((): number => {
    if (!active) return 0

    if (active.timeStatus === 'paused') {
      return active.timeSpent ?? 0
    }

    if (active.timeStatus === 'running') {
      if (!active.startDate) return active.timeSpent ?? 0

      const start = parseISO(active.startDate)
      return differenceInSeconds(now, start) + (active.timeSpent ?? 0)
    }

    return active.timeSpent ?? 0
  }, [active, now])

  return seconds
}
