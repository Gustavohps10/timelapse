'use client'

import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
// 1. Importação CORRETA para auto-scroll de elementos
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { GripVertical } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

type Card = { id: string; title: string }
type Column = { id: string; title: string; cards: Card[] }

export function Activities() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'A Fazer',
      cards: [
        { id: '1', title: 'Configurar ambiente' },
        { id: '2', title: 'Criar layout base' },
        { id: '3', title: 'Adicionar mais tarefas de exemplo' },
        { id: '4', title: 'Testar o scroll da coluna inicial' },
      ],
    },
    {
      id: 'doing',
      title: 'Em Andamento',
      cards: [{ id: '5', title: 'Implementar drag & drop' }],
    },
    {
      id: 'done',
      title: 'Concluído',
      cards: [{ id: '6', title: 'Setup inicial do projeto' }],
    },
  ])

  const handleDrop = (cardId: string, targetColId: string) => {
    const sourceCol = columns.find((c) =>
      c.cards.some((card) => card.id === cardId),
    )
    const targetCol = columns.find((c) => c.id === targetColId)

    // Evita drop na mesma coluna ou dados inválidos
    if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) return

    const cardToMove = sourceCol.cards.find((c) => c.id === cardId)
    if (!cardToMove) return

    // Atualiza o estado de forma imutável
    const updatedColumns = columns.map((col) => {
      // Remove o card da coluna de origem
      if (col.id === sourceCol.id) {
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
      }
      // Adiciona o card na coluna de destino
      if (col.id === targetCol.id) {
        return { ...col, cards: [...col.cards, cardToMove] }
      }
      return col
    })
    setColumns(updatedColumns)
  }

  return (
    <div className="flex h-screen gap-4 overflow-x-auto bg-gray-50 p-6">
      {columns.map((column) => (
        <Column key={column.id} column={column} onDrop={handleDrop} />
      ))}
    </div>
  )
}

function Column({
  column,
  onDrop,
}: {
  column: Column
  onDrop: (cardId: string, targetColId: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return combine(
      dropTargetForElements({
        element: el,
        onDrop: ({ source }) => {
          const cardId = source?.data?.cardId as string
          if (cardId) {
            // Garante que o cardId existe
            onDrop(cardId, column.id)
          }
        },
      }),
      // 2. Uso da função CORRETA
      autoScrollForElements({ element: el }),
    )
    // 3. Adiciona dependências para evitar stale closures
  }, [column.id, onDrop])

  return (
    // 4. Adiciona classes para permitir que a coluna tenha seu próprio scroll
    <div
      ref={ref}
      className="flex h-fit max-h-[calc(100vh-60px)] w-64 flex-shrink-0 flex-col rounded-2xl bg-gray-100 p-3 shadow"
    >
      <h2 className="mb-3 text-lg font-semibold">{column.title}</h2>
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}

function Card({ card }: { card: Card }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    return draggable({
      element: el,
      getInitialData: () => ({ cardId: card.id }),
    })
    // 5. Adiciona dependência para garantir que o draggable se atualize
  }, [card.id])

  return (
    <div
      ref={ref}
      className="cursor-grab rounded-xl bg-white p-3 shadow transition-transform hover:scale-[1.02] active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-gray-400" />
        <span>{card.title}</span>
      </div>
    </div>
  )
}
