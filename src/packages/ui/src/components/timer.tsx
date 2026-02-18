'use client'

import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { TimeEntriesContext } from '@/contexts/TimeEntriesContext'
import { cn } from '@/lib/utils'

export type TimerProps = {
  size?: 'big' | 'medium' | 'small'
  onTimeChange?: (minutes: number) => void
}

export function Timer({ size = 'medium', onTimeChange }: TimerProps) {
  const [digits, setDigits] = useState<string[]>(['0', '0', '0', '0', '0', '0'])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const { activeTimeEntry, amountSecondsPassed } =
    useContext(TimeEntriesContext)

  // 1. Lógica de cálculo de tempo para quando NÃO há timer ativo (modo input/edição)
  useEffect(() => {
    if (!activeTimeEntry && onTimeChange) {
      const [h1, h2, m1, m2, s1, s2] = digits.map(Number)
      const totalMinutes =
        (h1 * 10 + h2) * 60 + (m1 * 10 + m2) + Math.floor((s1 * 10 + s2) / 60)
      onTimeChange(totalMinutes)
    }
  }, [digits, activeTimeEntry, onTimeChange])

  // 2. Formatação do tempo ativo (HH:MM:SS) consumindo o contexto reativo
  const formattedTime = useMemo(() => {
    // Se o timer for decrescente, subtraímos o tempo passado do tempo total planejado
    // Caso contrário (increasing ou manual), mostramos o tempo progressivo (HH:MM:SS)
    let displaySeconds = amountSecondsPassed

    if (activeTimeEntry?.type === 'decreasing') {
      // No modo decrescente, timeSpent seria o "alvo" de minutos convertido em segundos
      const totalTargetSeconds = activeTimeEntry.timeSpent || 0
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

  const isValidDigits = (nextDigits: string[]): boolean => {
    const [h1, h2, m1, m2, s1, s2] = nextDigits.map(Number)
    const mm = m1 * 10 + m2
    const ss = s1 * 10 + s2
    // Limitação padrão de relógio: minutos e segundos não passam de 59
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
    } else if (e.key === 'Backspace') {
      const newDigits = [...digits]
      newDigits[activeIndex] = '0'
      setDigits(newDigits)
      if (activeIndex > 0) setActiveIndex((i) => i - 1)
      e.preventDefault()
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
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const renderEditableTime = () => {
    return digits.map((digit, index) => {
      const isSelected = index === activeIndex
      const elements = []

      elements.push(
        <span
          key={`digit-${index}`}
          className={cn(
            'inline-block w-[0.9ch] cursor-text text-center transition-all duration-75',
            isSelected &&
              'bg-primary/20 text-primary ring-primary/50 z-10 scale-110 rounded-[2px] ring-1',
          )}
          onClick={() => handleDigitClick(index)}
        >
          {digit}
        </span>,
      )

      if (index === 1 || index === 3) {
        elements.push(
          <span
            key={`sep-${index}`}
            className="text-muted-foreground px-0.5 opacity-40 select-none"
          >
            :
          </span>,
        )
      }

      return elements
    })
  }

  const sizeClasses = {
    big: 'text-5xl tracking-tighter',
    medium: 'text-2xl tracking-tight',
    small: 'text-sm tracking-normal',
  }[size]

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center font-mono font-semibold tabular-nums transition-colors select-none',
        activeTimeEntry?.timeStatus === 'running'
          ? 'text-primary'
          : 'text-foreground',
        sizeClasses,
      )}
    >
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onBlur={() => setActiveIndex(-1)}
        className="pointer-events-none absolute inset-0 h-full w-full cursor-default opacity-0"
        readOnly
      />

      {activeTimeEntry ? (
        <span
          className={cn(
            activeTimeEntry.timeStatus === 'running' && 'animate-pulse-subtle',
          )}
        >
          {formattedTime}
        </span>
      ) : (
        <div className="flex items-center">{renderEditableTime()}</div>
      )}
    </div>
  )
}
