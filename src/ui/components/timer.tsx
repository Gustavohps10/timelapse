import { differenceInSeconds } from 'date-fns'
import { useContext, useEffect } from 'react'

import { TimeEntriesContext } from '@/ui/contexts/TimeEntriesContext'

export type TimerProps = {
  size?: 'big' | 'medium' | 'small'
}

export function Timer({ size }: TimerProps) {
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

  return (
    <div>
      <span
        className={`mt-1 scroll-m-20 font-mono leading-tight font-bold tracking-tighter text-zinc-800 dark:text-zinc-300 ${sizeClass}`}
      >
        {minutes[0]}
        {minutes[1]}:{seconds[0]}
        {seconds[1]}
      </span>
    </div>
  )
}
