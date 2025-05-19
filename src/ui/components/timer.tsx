import { differenceInSeconds } from 'date-fns'
import { useContext, useEffect } from 'react'

import { TimeEntriesContext } from '@/ui/contexts/TimeEntriesContext'

export function Timer() {
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
      } else {
        setSecondsPassed(secondsDifference)
      }
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

  return (
    <div>
      <span className="mt-1 scroll-m-20 font-mono text-4xl leading-tight font-bold tracking-tighter text-zinc-800 dark:text-zinc-300">
        {minutes[0]}
        {minutes[1]}:{seconds[0]}
        {seconds[1]}
      </span>
    </div>
  )
}
