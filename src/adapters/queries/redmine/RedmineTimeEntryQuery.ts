import { IHttpClient } from '@/adapters/interfaces/IHttpClient'
import { ITimeEntryQuery } from '@/application/contracts/queries/ITimeEntryQuery'
import { ITokenStorage } from '@/application/contracts/storage/ITokenStorage'
import { TimeEntryDTO } from '@/application/dto/TimeEntryDTO'
import { AppError } from '@/cross-cutting/AppError'
import { Either } from '@/cross-cutting/Either'

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

export class RedmineTimeEntryQuery implements ITimeEntryQuery {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly tokenStorage: ITokenStorage,
  ) {
    this.configureHttpClient()
  }

  private async configureHttpClient(): Promise<void> {
    const token = await this.tokenStorage.getToken('atask', 'userKey')
    if (!token) throw new Error('Token não encontrado')

    this.httpClient.configure({
      baseURL: 'http://redmine.atakone.com.br',
      params: {
        key: token,
      },
    })
  }

  public async findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    const response = await this.httpClient.get<RedmineTimeEntriesResponse>(
      '/projects/faturamento_erp/time_entries.json?key',
      {
        params: {
          user_id: memberId,
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0],
          limit: 100,
        },
      },
    )

    if (response.isFailure()) {
      return Either.failure(
        new AppError(
          'Erro ao buscar lançamentos no Redmine',
          response.failure?.details,
          500,
        ),
      )
    }

    const entries = response.success.time_entries.map<TimeEntryDTO>(
      (entry) => ({
        id: entry.id,
        projectId: entry.project.id,
        projectName: entry.project.name,
        issueId: entry.issue.id,
        userId: entry.user.id,
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
