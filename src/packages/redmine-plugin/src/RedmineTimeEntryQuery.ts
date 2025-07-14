import {
  AppError,
  ConnectorRuntimeContext,
  Either,
  ITimeEntryQuery,
  TimeEntryDTO,
} from '@trackalize/connector-sdk'

import { RedmineBase } from './RedmineBase'

interface RedmineTimeEntry {
  id: number
  project: { id: number; name: string }
  issue?: { id: number }
  user: { id: number; name: string }
  activity: { id: number; name: string }
  hours: number
  comments: string
  spent_on: string
  created_on: string
  updated_on: string
}

interface RedmineTimeEntriesResponse {
  time_entries: RedmineTimeEntry[]
  total_count: number
  offset: number
  limit: number
}

interface RedmineTimeEntry {
  id: number
  project: { id: number; name: string }
  issue?: { id: number }
  user: { id: number; name: string }
  activity: { id: number; name: string }
  hours: number
  comments: string
  spent_on: string
  created_on: string
  updated_on: string
}

interface RedmineTimeEntriesResponse {
  time_entries: RedmineTimeEntry[]
  total_count: number
  offset: number
  limit: number
}

export class RedmineTimeEntryQuery
  extends RedmineBase
  implements ITimeEntryQuery
{
  constructor(context: ConnectorRuntimeContext) {
    super(context)
  }

  public async findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    try {
      const client = await this.getAuthenticatedClient()

      const response = await client.get<RedmineTimeEntriesResponse>(
        '/time_entries.json',
        {
          params: {
            user_id: memberId,
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0],
            limit: 100,
          },
        },
      )

      const entries: TimeEntryDTO[] = response.data.time_entries.map(
        (entry) => ({
          id: entry.id,
          project: {
            id: entry.project.id,
            name: entry.project.name,
          },
          issue: {
            id: entry.issue?.id,
          },
          user: {
            id: entry.user.id,
            name: entry.user.name,
          },
          activity: {
            id: entry.activity.id,
            name: entry.activity.name,
          },
          hours: entry.hours,
          comments: entry.comments,
          spentOn: new Date(entry.spent_on),
          createdAt: new Date(entry.created_on),
          updatedAt: new Date(entry.updated_on),
        }),
      )

      const timeEntries: TimeEntryDTO[] = entries

      return Either.success(timeEntries)
    } catch {
      return Either.failure(
        new AppError(
          'Não foi possível obter os apontamentos do Redmine.',
          '',
          400,
        ),
      )
    }
  }

  findAll(): Promise<Either<AppError, TimeEntryDTO[]>> {
    throw new Error(
      'Método "findAll" não implementado para o conector Redmine.',
    )
  }

  findById(id: string): Promise<Either<AppError, TimeEntryDTO | null>> {
    throw new Error(
      'Método "findById" não implementado para o conector Redmine.',
    )
  }

  exists(criteria: Partial<TimeEntryDTO>): Promise<Either<AppError, boolean>> {
    throw new Error('Método "exists" não implementado para o conector Redmine.')
  }
}
