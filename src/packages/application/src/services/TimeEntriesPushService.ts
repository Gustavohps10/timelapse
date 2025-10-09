import {
  AppError,
  Either,
  InternalServerError,
  UnauthorizedError,
  ValidationError,
} from '@timelapse/cross-cutting/helpers'
import { TimeEntry } from '@timelapse/domain'

import { ITimeEntryRepository } from '@/contracts'
import {
  ITimeEntriesPushUseCase,
  PushTimeEntriesInput,
  SyncTimeEntryDTO,
} from '@/contracts/use-cases'
import { SessionManager } from '@/workflow'

export class TimeEntriesPushService implements ITimeEntriesPushUseCase {
  constructor(
    private readonly sessionManager: SessionManager,
    private readonly timeEntryRepository: ITimeEntryRepository,
  ) {}

  public async execute(
    input: PushTimeEntriesInput,
  ): Promise<Either<AppError, SyncTimeEntryDTO[]>> {
    try {
      const user = this.sessionManager.getCurrentUser()
      if (!user)
        return Either.failure(
          UnauthorizedError.danger('USUARIO_NAO_ENCONTRADO'),
        )

      const results: SyncTimeEntryDTO[] = []

      for (const entry of input.entries) {
        results.push(await this.processEntry(entry))
      }

      return Either.success(results)
    } catch {
      return Either.failure(InternalServerError.danger('ERRO_INESPERADO'))
    }
  }

  private async processEntry(
    entry: SyncTimeEntryDTO,
  ): Promise<SyncTimeEntryDTO> {
    const { id, _deleted } = entry

    const validationError = this.validateDocument(entry)
    if (validationError) return { ...entry, validationError: validationError }

    try {
      if (_deleted) return this.handleDeleted(entry)

      const existing = await this.timeEntryRepository.findById(id!)

      if (existing) return this.handleExisting(entry, existing)

      return this.handleNew(entry)
    } catch {
      return {
        ...entry,
        validationError: ValidationError.danger('ERRO_PROCESSAMENTO_DOCUMENTO'),
      }
    }
  }

  private validateDocument(entry: SyncTimeEntryDTO): ValidationError | null {
    const { id, updatedAt, _deleted } = entry
    if (!id) return ValidationError.danger('DOCUMENT_ID_MISSING')
    if (!_deleted && !updatedAt)
      return ValidationError.danger('DOCUMENT_UPDATED_AT_MISSING')
    return null
  }

  private async handleDeleted(
    entry: SyncTimeEntryDTO,
  ): Promise<SyncTimeEntryDTO> {
    await this.timeEntryRepository.delete(entry.id!)
    return { ...entry, syncedAt: new Date() }
  }

  private async handleExisting(
    entry: SyncTimeEntryDTO,
    existing: TimeEntry,
  ): Promise<SyncTimeEntryDTO> {
    const { assumedMasterState } = entry

    const isConflict =
      assumedMasterState &&
      existing.updatedAt.getTime() !== assumedMasterState.updatedAt?.getTime()

    if (isConflict)
      return {
        ...entry,
        conflicted: true,
        conflictData: { server: existing, local: entry },
      }

    const resultUpdateHours = existing.updateHours(
      entry.startDate,
      entry.endDate,
      entry.timeSpent,
    )

    if (resultUpdateHours.isFailure()) {
      return { ...entry, validationError: resultUpdateHours.failure }
    }

    existing.updateComments(entry.comments)
    await this.timeEntryRepository.update(existing)

    return { ...entry, syncedAt: new Date() }
  }

  private async handleNew(entry: SyncTimeEntryDTO): Promise<SyncTimeEntryDTO> {
    const result = TimeEntry.create({
      task: { id: entry.task.id },
      activity: { id: entry.activity.id },
      user: { id: entry.user.id, name: entry.user.name },
      startDate: entry.startDate,
      endDate: entry.endDate,
      timeSpent: entry.timeSpent,
      comments: entry.comments,
    })

    if (result.isFailure())
      return {
        ...entry,
        validationError: ValidationError.danger('TIME_ENTRY_INVALID'),
      }

    await this.timeEntryRepository.create(result.success)
    return { ...entry, syncedAt: new Date() }
  }
}
