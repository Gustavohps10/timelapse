import { differenceInSeconds } from 'date-fns'
import { useContext, useEffect, useState } from 'react'

import { TimeEntriesContext } from '@/ui/contexts/TimeEntriesContext'

export type TimerProps = {
  size?: 'big' | 'medium' | 'small'
}

export function Timer({ size }: TimerProps) {
  const [manualTime, setManualTime] = useState<string>('00:00')

  const {
    activeTimeEntry,
    activeTimeEntryId,
    amountSecondsPassed,
    markCurrentTimeEntryAsFinished,
    setSecondsPassed,
  } = useContext(TimeEntriesContext)

  const totalSeconds = activeTimeEntry ? activeTimeEntry.minutesAmount * 60 : 0

  useEffect(() => {
    if (!activeTimeEntry) return

    const interval = setInterval(() => {
      const secondsDifference = differenceInSeconds(
        new Date(),
        new Date(activeTimeEntry.startDate),
      )

      if (secondsDifference >= totalSeconds) {
        markCurrentTimeEntryAsFinished()
        setSecondsPassed(totalSeconds)
        clearInterval(interval)
        return
      }

      setSecondsPassed(secondsDifference)
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [
    activeTimeEntryId,
    totalSeconds,
    markCurrentTimeEntryAsFinished,
    setSecondsPassed,
  ])

  const currentSeconds = activeTimeEntry
    ? totalSeconds - amountSecondsPassed
    : 0

  const minutesAmount = Math.floor(currentSeconds / 60)
  const secondsAmount = currentSeconds % 60

  const minutes = String(minutesAmount).padStart(2, '0')
  const seconds = String(secondsAmount).padStart(2, '0')

  useEffect(() => {
    if (activeTimeEntry) {
      document.title = `${minutes}:${seconds}`
    }
  }, [minutes, seconds, activeTimeEntry])

  const sizeClass = {
    big: 'text-4xl',
    medium: 'text-2xl',
    small: 'text-sm',
  }[size ?? 'medium']

  const formatedDate = `${minutes[0]}${minutes[1]}:${seconds[0]}${seconds[1]}`
  return (
    <span
      className={`relative mt-1 flex justify-center p-1 font-mono leading-tight font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 ${sizeClass}`}
    >
      <input
        className="relative top-0 left-0 m-0 flex w-full justify-center border-0 p-0 text-center outline-0"
        onChange={(e) => setManualTime(e.target.value)}
        value={!!activeTimeEntry ? formatedDate : manualTime}
      />
    </span>
  )
}
