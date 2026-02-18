'use client'

import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  OnChangeFn,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  expanded?: ExpandedState
  onExpandedChange?: OnChangeFn<ExpandedState>
  getRowClassName?: (row: TData) => string
}

export function DataTable<TData extends { subRows?: TData[]; id: string }>({
  columns,
  data,
  expanded = {},
  onExpandedChange,
  getRowClassName,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    // 🔥 Crucial para que a expansão funcione quando a linha mestre muda de estado
    getRowId: (row) => row.id,
  })

  return (
    <div className="bg-background overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width:
                      header.getSize() !== 150
                        ? `${header.getSize()}px`
                        : 'auto',
                  }}
                  className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsExpanded() ? 'expanded' : 'collapsed'}
                className={cn(
                  'group transition-colors',
                  row.getIsExpanded() && 'bg-muted/20',
                  row.depth > 0 && 'bg-muted/5 italic',
                  getRowClassName?.(row.original),
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      width:
                        cell.column.getSize() !== 150
                          ? `${cell.column.getSize()}px`
                          : 'auto',
                    }}
                    className={cn(
                      'border-border/40 border-b px-4 py-2 text-sm whitespace-nowrap',
                      cell.column.getIndex() === 0 && row.depth > 0 && 'pl-10',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground h-24 text-center text-sm"
              >
                Nenhum registro para exibir.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
