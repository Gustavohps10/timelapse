'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useActiveTimer } from '@/hooks/use-active-timer'
import { cn } from '@/lib/utils'
import { useTimeEntryStore } from '@/stores/timeEntryStore'

export type TimerProps = {
  onTimeChange?: (hours: number) => void
}

export function Timer({ onTimeChange }: TimerProps) {
  const [digits, setDigits] = useState<string[]>(['0', '0', '0', '0', '0', '0'])
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTimeEntry = useTimeEntryStore((s) => s.active)
  const amountSecondsPassed = useActiveTimer()

  useEffect(() => {
    if (!activeTimeEntry && onTimeChange) {
      const [h1, h2, m1, m2, s1, s2] = digits.map(Number)
      const totalSeconds =
        (h1 * 10 + h2) * 3600 + (m1 * 10 + m2) * 60 + (s1 * 10 + s2)
      onTimeChange(totalSeconds / 3600)
    }
  }, [digits, activeTimeEntry, onTimeChange])

  const formattedTime = useMemo((): string => {
    let displaySeconds = amountSecondsPassed

    if (activeTimeEntry?.type === 'decreasing') {
      const totalTargetSeconds = activeTimeEntry.timeSpent ?? 0
      displaySeconds = Math.max(0, totalTargetSeconds - amountSecondsPassed)
    }

    const h = Math.floor(displaySeconds / 3600)
      .toString()
      .padStart(2, '0')
    const m = Math.floor((displaySeconds % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const s = Math.floor(displaySeconds % 60)
      .toString()
      .padStart(2, '0')

    return `${h}:${m}:${s}`
  }, [amountSecondsPassed, activeTimeEntry])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (activeTimeEntry) return

    if (e.key >= '0' && e.key <= '9') {
      const newDigits = [...digits]
      newDigits[activeIndex] = e.key

      const [, , m1, m2, s1, s2] = newDigits.map(Number)
      if (m1 * 10 + m2 <= 59 && s1 * 10 + s2 <= 59) {
        setDigits(newDigits)
        if (activeIndex < 5) setActiveIndex((i) => i + 1)
      }
      e.preventDefault()
    }

    if (e.key === 'Backspace') {
      const newDigits = [...digits]
      newDigits[activeIndex] = '0'
      setDigits(newDigits)
      if (activeIndex > 0) setActiveIndex((i) => i - 1)
      e.preventDefault()
    }

    if (e.key === 'ArrowRight' && activeIndex < 5) setActiveIndex((i) => i + 1)
    if (e.key === 'ArrowLeft' && activeIndex > 0) setActiveIndex((i) => i - 1)
  }

  return (
    <div className="relative inline-flex items-center justify-center font-mono text-xl font-medium tabular-nums select-none">
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onBlur={() => setActiveIndex(-1)}
        className="pointer-events-none absolute inset-0 opacity-0"
        readOnly
      />

      {activeTimeEntry ? (
        <span
          className={cn(
            activeTimeEntry.timeStatus === 'running' && 'text-primary',
          )}
        >
          {formattedTime}
        </span>
      ) : (
        <div className="flex items-center">
          {digits.map((digit, index) => (
            <span key={index} className="flex items-center">
              <span
                className={cn(
                  'cursor-text transition-all',
                  index === activeIndex &&
                    'bg-primary/20 text-primary rounded-[2px] px-0.5',
                )}
                onClick={() => {
                  setActiveIndex(index)
                  setTimeout(() => inputRef.current?.focus(), 0)
                }}
              >
                {digit}
              </span>
              {(index === 1 || index === 3) && (
                <span className="px-0.5 opacity-40">:</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
