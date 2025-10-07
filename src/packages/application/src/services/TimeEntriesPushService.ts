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
    const { document, _deleted } = entry

    const validationError = this.validateDocument(entry)
    if (validationError) return { ...entry, _validationError: validationError }

    try {
      if (_deleted) return this.handleDeleted(entry)

      const existing = await this.timeEntryRepository.findById(document.id!)

      if (existing) return this.handleExisting(entry, existing)

      return this.handleNew(entry)
    } catch {
      return {
        ...entry,
        _validationError: ValidationError.danger(
          'ERRO_PROCESSAMENTO_DOCUMENTO',
        ),
      }
    }
  }

  private validateDocument(entry: SyncTimeEntryDTO): ValidationError | null {
    const { document, _deleted } = entry
    if (!document.id) return ValidationError.danger('DOCUMENT_ID_MISSING')
    if (!_deleted && !document.updatedAt)
      return ValidationError.danger('DOCUMENT_UPDATED_AT_MISSING')
    return null
  }

  private async handleDeleted(
    entry: SyncTimeEntryDTO,
  ): Promise<SyncTimeEntryDTO> {
    await this.timeEntryRepository.delete(entry.document.id!)
    return { ...entry, _syncedAt: new Date() }
  }

  private async handleExisting(
    entry: SyncTimeEntryDTO,
    existing: TimeEntry,
  ): Promise<SyncTimeEntryDTO> {
    const { document, assumedMasterState } = entry

    const isConflict =
      assumedMasterState &&
      existing.updatedAt.getTime() !== assumedMasterState.updatedAt?.getTime()

    if (isConflict)
      return {
        ...entry,
        _conflicted: true,
        _conflictData: { server: existing, local: document },
      }

    const resultUpdateHours = existing.updateHours(
      document.startDate,
      document.endDate,
      document.timeSpent,
    )

    if (resultUpdateHours.isFailure()) {
      return { ...entry, _validationError: resultUpdateHours.failure }
    }

    existing.updateComments(document.comments)
    await this.timeEntryRepository.update(existing)

    return { ...entry, _syncedAt: new Date() }
  }

  private async handleNew(entry: SyncTimeEntryDTO): Promise<SyncTimeEntryDTO> {
    const { document } = entry

    const result = TimeEntry.create({
      task: { id: document.task.id },
      activity: { id: document.activity.id },
      user: { id: document.user.id, name: document.user.name },
      startDate: document.startDate,
      endDate: document.endDate,
      timeSpent: document.timeSpent,
      comments: document.comments,
    })

    if (result.isFailure())
      return {
        ...entry,
        _validationError: ValidationError.danger('TIME_ENTRY_INVALID'),
      }

    await this.timeEntryRepository.create(result.success)
    return { ...entry, _syncedAt: new Date() }
  }
}
