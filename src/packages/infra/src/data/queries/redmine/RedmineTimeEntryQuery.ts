import {
  ICredentialsStorage,
  ISessionManager,
  ITimeEntryQuery,
} from '@trackpoint/application/contracts'
import { TimeEntryDTO } from '@trackpoint/application/dto'
import { AppError, Either } from '@trackpoint/cross-cutting'

import { IHttpClient } from '@/contracts'
import { RedmineQueryBase } from '@/data/queries/redmine/RedmineQueryBase'

type RedmineTimeEntry = {
  id: number
  project: { id: number; name: string }
  issue: { id: number }
  user: { id: number; name: string }
  activity: { id: number; name: string }
  hours: number
  comments: string
  spent_on: string
  created_at: string
  updated_at: string
}

type RedmineTimeEntriesResponse = {
  time_entries: RedmineTimeEntry[]
  total_count: number
  offset: number
  limit: number
}

export class RedmineTimeEntryQuery
  extends RedmineQueryBase
  implements ITimeEntryQuery
{
  constructor(
    httpClient: IHttpClient,
    sessionManager: ISessionManager,
    credentialsStorage: ICredentialsStorage,
  ) {
    super(httpClient, sessionManager, credentialsStorage)
  }

  findAll(): Promise<Either<AppError, TimeEntryDTO[]>> {
    throw new Error('Method not implemented.')
  }

  findById(id: string): Promise<Either<AppError, TimeEntryDTO | null>> {
    throw new Error('Method not implemented.')
  }

  exists(criteria: Partial<TimeEntryDTO>): Promise<Either<AppError, boolean>> {
    throw new Error('Method not implemented.')
  }

  public async findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    const client = await this.getConfiguredHttpClient()

    const response = await client.get<RedmineTimeEntriesResponse>(
      '/projects/faturamento_erp/time_entries.json',
      {
        params: {
          user_id: memberId,
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0],
          limit: 100,
        },
      },
    )

    if (response.isFailure()) return Either.failure(response.failure)

    const entries = response.success.time_entries.map<TimeEntryDTO>(
      (entry) => ({
        id: entry.id,
        projectId: entry.project.id,
        projectName: entry.project.name,
        issue: {
          id: entry.issue.id,
        },
        user: {
          id: entry.user.id,
        },
        userName: entry.user.name,
        activityId: entry.activity.id,
        activityName: entry.activity.name,
        hours: entry.hours,
        comments: entry.comments,
        spentOn: new Date(entry.spent_on),
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at),
      }),
    )

    return Either.success(entries)
  }
}
