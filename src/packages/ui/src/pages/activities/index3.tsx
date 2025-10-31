// 'use client'

// import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
// import { useQuery } from '@tanstack/react-query'
// import { useEffect, useMemo, useState } from 'react'

// import { useAuth, useDragToScroll } from '@/hooks'
// import { Column } from '@/pages/activities/components/column'
// import { useActivitiesStore } from '@/stores/activities-store'
// import { useSyncStore } from '@/stores/syncStore'
// import { SyncMetadataRxDBDTO } from '@/sync/metadata-sync-schema'

// export function Activities() {
//   const db = useSyncStore((state) => state.db)
//   const { user } = useAuth()

//   const { data: tasks, isLoading: isLoadingTasks } = useQuery({
//     queryKey: ['tasks', user?.id],
//     queryFn: async () => {
//       if (!db) throw new Error('Database not available')
//       if (!user?.id) return []

//       const userId = String(user.id)

//       const tasksDocs = await db.tasks
//         .find({
//           selector: {
//             _deleted: { $ne: true },
//             // $or: [
//             //   { 'author.id': { $eq: userId } },
//             //   { 'assignedTo.id': { $eq: userId } },
//             //   { participants: { $elemMatch: { id: userId } } },
//             // ],
//           },
//         })
//         .exec()

//       const tasksWithTimeEntries = await Promise.all(
//         tasksDocs.map(async (task) => {
//           const taskObj = task.toJSON()
//           const timeEntriesDocs = await db.timeEntries
//             .find({
//               selector: {
//                 _deleted: { $ne: true },
//                 'task.id': { $eq: taskObj.id },
//               },
//             })
//             .exec()

//           return {
//             ...taskObj,
//             timeEntries: timeEntriesDocs.map((te) => te.toJSON()),
//           }
//         }),
//       )

//       return JSON.parse(JSON.stringify(tasksWithTimeEntries))
//     },
//     enabled: !!db && !!user?.id,
//   })

//   const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
//     queryKey: ['metadata'],
//     queryFn: async (): Promise<SyncMetadataRxDBDTO | null> => {
//       if (!db) throw new Error('Database not available')
//       const metadataDoc = await db.metadata.findOne().exec()

//       if (!metadataDoc) {
//         return null
//       }
//       return JSON.parse(JSON.stringify(metadataDoc.toJSON()))
//     },
//     enabled: !!db,
//   })

//   const { columns, setColumns, reorderSameColumn, moveBetweenColumns } =
//     useActivitiesStore()

//   const taskStatuses = useMemo(() => metadata?.taskStatuses || [], [metadata])

//   useEffect(() => {
//     if (tasks && taskStatuses.length > 0) {
//       setColumns(tasks, taskStatuses)
//     }
//   }, [tasks, taskStatuses, setColumns])

//   const [isDndDragging, setIsDndDragging] = useState(false)
//   const scrollRef = useDragToScroll<HTMLDivElement>({ disabled: isDndDragging })

//   const onDragEnd = (result: DropResult) => {
//     setIsDndDragging(false)
//     const { source, destination } = result
//     if (!destination) return
//     if (source.droppableId === destination.droppableId) {
//       reorderSameColumn(source.droppableId, source.index, destination.index)
//     } else {
//       moveBetweenColumns(
//         source.droppableId,
//         destination.droppableId,
//         source.index,
//         destination.index,
//       )
//     }
//   }

//   if (isLoadingTasks || isLoadingMetadata) {
//     return (
//       <div className="flex h-full items-center justify-center p-6">
//         <p className="text-muted-foreground mt-10">Carregando atividades...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-full flex-col overflow-hidden">
//       <h1 className="px-6 py-4 text-2xl font-semibold tracking-tight">
//         Atividades
//       </h1>

//       {metadata ? (
//         <DragDropContext
//           onDragStart={() => setIsDndDragging(true)}
//           onDragEnd={onDragEnd}
//         >
//           <div className="flex-1 overflow-hidden rounded-md border">
//             <div
//               ref={scrollRef}
//               className="custom-scroll flex h-full cursor-grab items-start gap-6 overflow-x-auto p-4 select-none"
//               style={{ width: 'calc(100vw - 300px - 4rem)' }}
//             >
//               {taskStatuses.map((status) => (
//                 <Column
//                   key={status.name}
//                   status={status}
//                   tasks={columns.get(status.name) || []}
//                   metadata={metadata}
//                 />
//               ))}
//             </div>
//           </div>
//         </DragDropContext>
//       ) : (
//         <div className="flex flex-1 items-center justify-center rounded-md border p-6">
//           <p className="text-muted-foreground">
//             Metadados não encontrados. Não é possível exibir o quadro de
//             atividades.
//           </p>
//         </div>
//       )}

//       <style>{`
//         .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
//         .custom-scroll::-webkit-scrollbar-track { background: transparent; }
//         .custom-scroll::-webkit-scrollbar-thumb { background: var(--color-muted); border: 2px solid transparent; border-radius: 9999px; background-clip: padding-box; }
//         .custom-scroll { scrollbar-width: thin; scrollbar-color: var(--color-muted) transparent; }
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         [data-rbd-placeholder-context-id] {
//           background-color: transparent !important;
//           border: 2px dashed hsl(var(--muted-foreground)) !important;
//           border-radius: 0.5rem !important;
//           margin-bottom: 0.5rem !important;
//         }
//       `}</style>
//     </div>
//   )
// }
