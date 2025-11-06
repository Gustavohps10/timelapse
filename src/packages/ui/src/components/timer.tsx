import { differenceInSeconds } from 'date-fns'
import { JSX, useContext, useEffect, useRef, useState } from 'react'

import { TimeEntriesContext } from '@/contexts/TimeEntriesContext'
import { markCurrentTimeEntryAction } from '@/reducers/time-entries/actions'

export type TimerProps = {
  size?: 'big' | 'medium' | 'small'
  onTimeChange?: (minutes: number) => void
}

export function Timer({ size, onTimeChange }: TimerProps) {
  const [digits, setDigits] = useState<string[]>(['0', '0', '0', '0', '0', '0'])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const { activeTimeEntry, amountSecondsPassed, setSecondsPassed } =
    useContext(TimeEntriesContext)

  const totalSeconds = activeTimeEntry ? activeTimeEntry.minutesAmount * 60 : 0

  useEffect(() => {
    if (!activeTimeEntry && onTimeChange) {
      const [h1, h2, m1, m2, s1, s2] = digits.map(Number)
      const minutes =
        h1 * 600 + h2 * 60 + m1 * 10 + m2 + Math.floor((s1 * 10 + s2) / 60)
      onTimeChange(minutes)
    }
  }, [digits, activeTimeEntry])

  useEffect(() => {
    if (!activeTimeEntry || activeTimeEntry.status === 'paused') return

    const interval = setInterval(() => {
      const secondsDifference = differenceInSeconds(
        new Date(),
        new Date(activeTimeEntry.startDate),
      )

      if (activeTimeEntry.type === 'decreasing') {
        if (secondsDifference >= totalSeconds) {
          markCurrentTimeEntryAction()
          setSecondsPassed(totalSeconds)
          clearInterval(interval)
          return
        }

        setSecondsPassed(secondsDifference)
      }

      if (activeTimeEntry.type === 'increasing') {
        setSecondsPassed(-secondsDifference)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimeEntry, totalSeconds, markCurrentTimeEntryAction])

  const currentSeconds = activeTimeEntry
    ? totalSeconds - amountSecondsPassed
    : 0

  const isValidDigits = (nextDigits: string[]): boolean => {
    const [m1, m2, s1, s2] = nextDigits.map(Number)
    const mm = m1 * 10 + m2
    const ss = s1 * 10 + s2
    return mm <= 59 && ss <= 59
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (activeTimeEntry) return
    if (e.key >= '0' && e.key <= '9') {
      const newDigits = [...digits]
      newDigits[activeIndex] = e.key

      if (isValidDigits(newDigits)) {
        setDigits(newDigits)
        if (activeIndex < 5) setActiveIndex((i) => i + 1)
      }
      e.preventDefault()
    } else if (e.code == 'Space') {
      e.preventDefault()

      if (activeIndex < digits.length - 1) setActiveIndex(activeIndex + 1)
    } else if (e.key === 'ArrowRight') {
      if (activeIndex < 5) setActiveIndex((i) => i + 1)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      if (activeIndex > 0) setActiveIndex((i) => i - 1)
      e.preventDefault()
    }
  }

  const handleDigitClick = (index: number) => {
    if (!activeTimeEntry) {
      setActiveIndex(index)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const renderTime = () => {
    const time = [...digits]

    return (
      <>
        {time
          .map((digit, index) => (
            <span
              key={index}
              className={`inline-block h-6 w-[1ch] cursor-text pr-[1px] text-center ${
                index === activeIndex && activeIndex !== -1
                  ? 'ring-pulse text-foreground rounded ring-2 ring-red-500'
                  : ''
              }`}
              onClick={() => handleDigitClick(index)}
            >
              {digit}
            </span>
          ))
          .reduce((acc, curr, i) => {
            acc.push(curr)

            if (i === 1 || i === 3) {
              const targetIndex = i + 1
              acc.push(
                <span
                  key={`sep-${i}`}
                  className="cursor-text px-0.5 text-zinc-500"
                  onClick={() => handleDigitClick(targetIndex)}
                >
                  :
                </span>,
              )
            }

            return acc
          }, [] as JSX.Element[])}
      </>
    )
  }

  const sizeClass = {
    big: 'text-4xl',
    medium: 'text-2xl',
    small: 'text-sm',
  }[size ?? 'medium']

  return (
    <span
      className={`relative mt-1 flex justify-center p-1 font-mono leading-tight font-semibold tracking-tighter text-zinc-800 dark:text-zinc-300 ${sizeClass}`}
    >
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onBlur={() => setActiveIndex(-1)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
      {activeTimeEntry ? (
        <span>
          {new Date(currentSeconds * 1000).toISOString().substr(11, 8)}
        </span>
      ) : (
        renderTime()
      )}
    </span>
  )
}
