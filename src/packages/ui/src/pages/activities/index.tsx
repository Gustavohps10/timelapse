import { Board } from '@/components/dnd/board'
import { TBoard, TCard, TColumn } from '@/components/dnd/data'

function getInitialData(): TBoard {
  // Doing this so we get consistent ids on server and client
  const getCards = (() => {
    let count: number = 0

    return function getCards({ amount }: { amount: number }): TCard[] {
      return Array.from({ length: amount }, (): TCard => {
        const id = count++
        return {
          id: `card:${id}`,
          description: `Card ${id}`,
        }
      })
    }
  })()

  const columns: TColumn[] = [
    { id: 'column:a', title: 'Column A', cards: getCards({ amount: 60 }) },
    { id: 'column:b', title: 'Column B', cards: getCards({ amount: 4 }) },
    { id: 'column:c', title: 'Column C', cards: getCards({ amount: 30 }) },
    { id: 'column:d', title: 'Column D', cards: getCards({ amount: 12 }) },
    { id: 'column:e', title: 'Column E', cards: getCards({ amount: 0 }) },
    { id: 'column:f', title: 'Column F', cards: getCards({ amount: 44 }) },
    { id: 'column:g', title: 'Column G', cards: getCards({ amount: 4 }) },
    { id: 'column:h', title: 'Column H', cards: getCards({ amount: 8 }) },
    { id: 'column:i', title: 'Column I', cards: getCards({ amount: 30 }) },
  ]

  return {
    columns,
  }
}

export function Activities() {
  return (
    <div className="flex-1 overflow-hidden rounded-md border">
      <div
        // ref={containerRef}
        className="custom-scroll flex h-full items-start gap-6 overflow-x-auto p-4 select-none"
        style={{ width: 'calc(100vw - 300px - 4rem)' }}
      >
        <Board initial={getInitialData()} />
      </div>
    </div>
  )
}
