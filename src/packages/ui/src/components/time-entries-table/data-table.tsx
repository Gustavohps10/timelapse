export type TimeEntry = {
  id?: number
  issue_id?: number
  project_id?: number
  spent_on: string
  hours: number
  activity_id?: number
  comments?: string
  user_id?: number
  sincStatus?: 'synced' | 'pending' | 'failed'
}

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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

export function DataTable<TData extends { subRows?: TData[] }>({
  columns,
  data,
}: {
  columns: ColumnDef<TData>[]
  data: TData[]
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows ?? [],
  })

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: `${header.getSize()}px` }} // 👈 define a largura
                  className="px-2 py-2 text-sm font-medium whitespace-nowrap"
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
                style={{ paddingLeft: `${row.depth * 20}px` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: `${cell.column.getSize()}px` }} // 👈 define a largura
                    className="px-2 py-2 text-sm whitespace-nowrap"
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
                Nenhum resultado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
