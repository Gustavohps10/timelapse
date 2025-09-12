import { IApplicationClient, ITimeEntriesClient } from '@timelapse/application'

import { getDatabase } from './syncEngine'

export async function createOfflineFirstClient(
  baseClient: IApplicationClient,
): Promise<IApplicationClient> {
  const db = await getDatabase(baseClient)

  const offlineTimeEntriesService: ITimeEntriesClient = {
    findByMemberId: async (payload) => {
      console.log('[INFRA]: Buscando TimeEntries do banco LOCAL...')
      const docs = await db.time_entries.find().exec()

      const timeEntryViewModels = docs.map((doc) => doc.toJSON())
      const total = timeEntryViewModels.length

      return {
        data: timeEntryViewModels,
        totalItems: total,
        totalPages: 1,
        currentPage: 1,
        isSuccess: true,
        statusCode: 200,
      }
    },
  }

  const finalClient: IApplicationClient = {
    ...baseClient,
    services: {
      ...baseClient.services,
      timeEntries: offlineTimeEntriesService,
    },
  }

  return finalClient
}
