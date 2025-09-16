import { IApplicationClient } from '@timelapse/application'
import { TimeEntryDTO } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { LocalTimeEntryService } from './LocalTimeEntryService'

export class SyncService {
  private localService: LocalTimeEntryService

  constructor(private remoteClient: IApplicationClient) {
    this.localService = new LocalTimeEntryService(remoteClient)
  }

  async initialize(): Promise<Either<AppError, void>> {
    const result = await this.localService.initialize()
    if (result.isFailure()) {
      return result.forwardFailure()
    }
    return Either.success(undefined)
  }

  async syncTimeEntriesByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
    workspaceId: string,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    try {
      console.log('SyncService: Iniciando sincronização...', {
        memberId,
        startDate,
        endDate,
        workspaceId,
      })

      const remoteData =
        await this.remoteClient.services.timeEntries.findByMemberId({
          body: {
            workspaceId,
            memberId,
            startDate,
            endDate,
          },
        })

      if (!remoteData.isSuccess) {
        return Either.failure(
          new AppError(
            'SYNC_REMOTE_ERROR',
            'Falha ao buscar dados do servidor remoto',
            500,
          ),
        )
      }

      const timeEntries = remoteData.data || []
      console.log(
        `SyncService: ${timeEntries.length} TimeEntries recebidos do servidor`,
      )

      const saveResult = await this.localService.saveTimeEntries(timeEntries)
      if (saveResult.isFailure()) {
        return saveResult.forwardFailure()
      }

      console.log(
        `SyncService: ${timeEntries.length} TimeEntries salvos localmente`,
      )

      return Either.success(timeEntries)
    } catch (error) {
      console.error('SyncService: Erro na sincronização:', error)
      return Either.failure(
        new AppError(
          'SYNC_ERROR',
          error instanceof Error ? error.message : 'Erro desconhecido',
          500,
        ),
      )
    }
  }

  async getLocalTimeEntriesByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    const result = await this.localService.getTimeEntriesByMemberId(
      memberId,
      startDate,
      endDate,
    )
    if (result.isFailure()) {
      return result.forwardFailure()
    }
    return Either.success(result.success)
  }
}
