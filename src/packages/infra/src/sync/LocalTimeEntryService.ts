import { IApplicationClient } from '@timelapse/application'
import { TimeEntryDTO } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { TimeEntryMapper } from './mappers'
import { getDatabase } from './syncEngine'
import { TimeEntryDoc, UpdateTimeEntryData } from './types'

export class LocalTimeEntryService {
  private db: unknown = null

  constructor(private remoteClient: IApplicationClient) {}

  async initialize(): Promise<Either<AppError, void>> {
    try {
      this.db = await getDatabase(this.remoteClient)
      return Either.success(undefined)
    } catch (error) {
      return Either.failure(
        new AppError(
          'DB_INIT_ERROR',
          error instanceof Error
            ? error.message
            : 'Erro ao inicializar banco local',
          500,
        ),
      )
    }
  }

  async saveTimeEntry(
    timeEntry: TimeEntryDTO,
  ): Promise<Either<AppError, TimeEntryDoc>> {
    if (!this.db) {
      return Either.failure(
        new AppError(
          'DB_NOT_INITIALIZED',
          'LocalTimeEntryService não foi inicializado',
          500,
        ),
      )
    }

    try {
      const doc = TimeEntryMapper.dtoToDoc(timeEntry)

      if (!TimeEntryMapper.validateDoc(doc)) {
        return Either.failure(
          new AppError('INVALID_DATA', 'Dados do TimeEntry inválidos', 400),
        )
      }

      await (
        this.db as {
          time_entries: { insert: (doc: TimeEntryDoc) => Promise<unknown> }
        }
      ).time_entries.insert(doc)
      console.log(`LocalTimeEntryService: TimeEntry ${doc.id} salvo localmente`)

      return Either.success(doc)
    } catch (error) {
      return Either.failure(
        new AppError(
          'SAVE_ERROR',
          error instanceof Error ? error.message : 'Erro ao salvar TimeEntry',
          500,
        ),
      )
    }
  }

  async saveTimeEntries(
    timeEntries: TimeEntryDTO[],
  ): Promise<Either<AppError, void>> {
    if (!this.db) {
      return Either.failure(
        new AppError(
          'DB_NOT_INITIALIZED',
          'LocalTimeEntryService não foi inicializado',
          500,
        ),
      )
    }

    try {
      for (const timeEntry of timeEntries) {
        const result = await this.saveTimeEntry(timeEntry)
        if (result.isFailure()) {
          console.error(
            'Erro ao salvar TimeEntry:',
            timeEntry.id,
            result.failure,
          )
        }
      }

      console.log(
        `LocalTimeEntryService: ${timeEntries.length} TimeEntries processados localmente`,
      )
      return Either.success(undefined)
    } catch (error) {
      return Either.failure(
        new AppError(
          'BATCH_SAVE_ERROR',
          error instanceof Error
            ? error.message
            : 'Erro ao salvar TimeEntries em lote',
          500,
        ),
      )
    }
  }

  async updateTimeEntry(
    data: UpdateTimeEntryData,
  ): Promise<Either<AppError, void>> {
    if (!this.db) {
      return Either.failure(
        new AppError(
          'DB_NOT_INITIALIZED',
          'LocalTimeEntryService não foi inicializado',
          500,
        ),
      )
    }

    try {
      const doc = await (
        this.db as {
          time_entries: {
            findOne: (id: string) => { exec: () => Promise<unknown> }
          }
        }
      ).time_entries
        .findOne(data.id)
        .exec()
      if (!doc) {
        return Either.failure(
          new AppError(
            'NOT_FOUND',
            `TimeEntry com ID ${data.id} não encontrado`,
            404,
          ),
        )
      }

      const updateData = TimeEntryMapper.updateDataToDoc(data)
      await (
        doc as { update: (data: Partial<TimeEntryDoc>) => Promise<unknown> }
      ).update(updateData)

      console.log(
        `LocalTimeEntryService: TimeEntry ${data.id} atualizado localmente`,
      )
      return Either.success(undefined)
    } catch (error) {
      return Either.failure(
        new AppError(
          'UPDATE_ERROR',
          error instanceof Error
            ? error.message
            : 'Erro ao atualizar TimeEntry',
          500,
        ),
      )
    }
  }

  async deleteTimeEntry(id: string): Promise<Either<AppError, void>> {
    if (!this.db) {
      return Either.failure(
        new AppError(
          'DB_NOT_INITIALIZED',
          'LocalTimeEntryService não foi inicializado',
          500,
        ),
      )
    }

    try {
      const doc = await (
        this.db as {
          time_entries: {
            findOne: (id: string) => { exec: () => Promise<unknown> }
          }
        }
      ).time_entries
        .findOne(id)
        .exec()
      if (!doc) {
        return Either.failure(
          new AppError(
            'NOT_FOUND',
            `TimeEntry com ID ${id} não encontrado`,
            404,
          ),
        )
      }

      await (
        doc as { update: (data: { _deleted: boolean }) => Promise<unknown> }
      ).update({ _deleted: true })
      console.log(`LocalTimeEntryService: TimeEntry ${id} removido localmente`)
      return Either.success(undefined)
    } catch (error) {
      return Either.failure(
        new AppError(
          'DELETE_ERROR',
          error instanceof Error ? error.message : 'Erro ao remover TimeEntry',
          500,
        ),
      )
    }
  }

  async getTimeEntriesByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    if (!this.db) {
      return Either.failure(
        new AppError(
          'DB_NOT_INITIALIZED',
          'LocalTimeEntryService não foi inicializado',
          500,
        ),
      )
    }

    try {
      const docs = await (
        this.db as {
          time_entries: {
            find: (query: { selector: Record<string, unknown> }) => {
              exec: () => Promise<unknown[]>
            }
          }
        }
      ).time_entries
        .find({
          selector: {
            'user.id': parseInt(memberId),
            spentOn: {
              $gte: TimeEntryMapper.formatDate(startDate),
              $lte: TimeEntryMapper.formatDate(endDate),
            },
            _deleted: { $exists: false },
          },
        })
        .exec()

      const timeEntries = docs.map((doc: unknown) =>
        TimeEntryMapper.docToDto(
          (doc as { toJSON: () => TimeEntryDoc }).toJSON(),
        ),
      )

      return Either.success(timeEntries)
    } catch (error) {
      return Either.failure(
        new AppError(
          'QUERY_ERROR',
          error instanceof Error ? error.message : 'Erro ao buscar TimeEntries',
          500,
        ),
      )
    }
  }
}
