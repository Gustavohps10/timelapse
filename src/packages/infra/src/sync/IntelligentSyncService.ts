import { IApplicationClient, TimeEntryDTO } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { LocalTimeEntryService } from './LocalTimeEntryService'

interface SyncCheckpoint {
  id: string
  time: number
  lastSyncTime: string
  memberId: string
  workspaceId: string
}

interface SyncConfig {
  initialSyncDays: number // Quantos dias buscar no sync inicial (padrão: 30)
  throttleSeconds: number // Throttle entre sincronizações (padrão: 30)
}

export class IntelligentSyncService {
  private localService: LocalTimeEntryService
  private lastSyncCheckpoints: Map<string, SyncCheckpoint> = new Map()
  private syncConfig: SyncConfig

  constructor(
    private remoteClient: IApplicationClient,
    config: Partial<SyncConfig> = {},
  ) {
    this.localService = new LocalTimeEntryService(remoteClient)
    this.syncConfig = {
      initialSyncDays: 30,
      throttleSeconds: 30,
      ...config,
    }
  }

  async initialize(): Promise<Either<AppError, void>> {
    const result = await this.localService.initialize()
    if (result.isFailure()) {
      return result.forwardFailure()
    }
    return Either.success(undefined)
  }

  /**
   * Executa sincronização inicial com dados dos últimos 30 dias
   */
  async performInitialSync(
    memberId: string,
    workspaceId: string,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Sempre últimos 30 dias

    console.log(
      '🔄 IntelligentSync: Executando sync inicial (últimos 30 dias)...',
      {
        memberId,
        workspaceId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: 30,
      },
    )

    return this.syncTimeEntriesByMemberId(
      memberId,
      startDate,
      endDate,
      workspaceId,
      true, // isInitialSync
    )
  }

  /**
   * Executa sincronização com throttling inteligente
   */
  async syncTimeEntriesByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
    workspaceId: string,
    isInitialSync: boolean = false,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    const syncKey = `${memberId}-${workspaceId}`
    const lastCheckpoint = this.lastSyncCheckpoints.get(syncKey)

    // Verificar throttling (exceto para sync inicial)
    if (!isInitialSync && lastCheckpoint) {
      const timeSinceLastSync = Date.now() - lastCheckpoint.time
      const throttleMs = this.syncConfig.throttleSeconds * 1000

      if (timeSinceLastSync < throttleMs) {
        const remainingSeconds = Math.ceil(
          (throttleMs - timeSinceLastSync) / 1000,
        )
        console.log(
          `⏳ IntelligentSync: Throttling ativo. Aguarde ${remainingSeconds}s para próxima sincronização`,
        )
        return Either.failure(
          new AppError(
            'SYNC_THROTTLED',
            `Sincronização bloqueada por throttling. Aguarde ${remainingSeconds} segundos`,
            429,
          ),
        )
      }
    }

    try {
      console.log('🔄 IntelligentSync: Iniciando sincronização...', {
        memberId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        workspaceId,
        isInitialSync,
      })

      // Buscar dados reais do servidor remoto
      console.log('🔍 IntelligentSync: Parâmetros enviados para API:', {
        workspaceId,
        memberId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
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
        console.error(
          '❌ IntelligentSync: Erro ao buscar dados remotos:',
          remoteData,
        )
        return Either.failure(
          new AppError(
            'SYNC_REMOTE_ERROR',
            'Falha ao buscar dados do servidor remoto',
            500,
          ),
        )
      }

      let timeEntries = remoteData.data || []
      console.log(
        `✅ IntelligentSync: ${timeEntries.length} TimeEntries recebidos do servidor (antes do filtro)`,
      )

      // Filtro de segurança: garantir que só retornamos dados do usuário correto
      const originalCount = timeEntries.length
      timeEntries = timeEntries.filter((entry) => {
        const entryUserId = entry.user?.id?.toString()
        const matchesUser = entryUserId === memberId
        if (!matchesUser) {
          console.warn(
            `⚠️ IntelligentSync: TimeEntry ${entry.id} não pertence ao usuário ${memberId} (user.id: ${entryUserId})`,
          )
        }
        return matchesUser
      })

      if (originalCount !== timeEntries.length) {
        console.log(
          `🔒 IntelligentSync: Filtro aplicado - ${originalCount} → ${timeEntries.length} TimeEntries (removidos ${originalCount - timeEntries.length} de outros usuários)`,
        )
      }

      // Salvar dados localmente
      const saveResult = await this.localService.saveTimeEntries(timeEntries)
      if (saveResult.isFailure()) {
        return saveResult.forwardFailure()
      }

      // Atualizar checkpoint
      const newCheckpoint: SyncCheckpoint = {
        id: `checkpoint-${Date.now()}`,
        time: Date.now(),
        lastSyncTime: new Date().toISOString(),
        memberId,
        workspaceId,
      }
      this.lastSyncCheckpoints.set(syncKey, newCheckpoint)

      console.log(
        `✅ IntelligentSync: ${timeEntries.length} TimeEntries salvos localmente`,
      )

      return Either.success(timeEntries)
    } catch (error) {
      console.error('❌ IntelligentSync: Erro na sincronização:', error)
      return Either.failure(
        new AppError(
          'SYNC_ERROR',
          error instanceof Error ? error.message : 'Erro desconhecido',
          500,
        ),
      )
    }
  }

  /**
   * Busca dados locais (sem sincronização)
   */
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

  /**
   * Força sincronização ignorando throttling
   */
  async forceSync(
    memberId: string,
    startDate: Date,
    endDate: Date,
    workspaceId: string,
  ): Promise<Either<AppError, TimeEntryDTO[]>> {
    console.log('🚀 IntelligentSync: Forçando sincronização...')
    return this.syncTimeEntriesByMemberId(
      memberId,
      startDate,
      endDate,
      workspaceId,
      true, // Ignora throttling
    )
  }

  /**
   * Obtém informações sobre o último checkpoint
   */
  getLastCheckpoint(
    memberId: string,
    workspaceId: string,
  ): SyncCheckpoint | null {
    const syncKey = `${memberId}-${workspaceId}`
    return this.lastSyncCheckpoints.get(syncKey) || null
  }

  /**
   * Verifica se pode sincronizar (não está em throttling)
   */
  canSync(memberId: string, workspaceId: string): boolean {
    const checkpoint = this.getLastCheckpoint(memberId, workspaceId)
    if (!checkpoint) return true

    const timeSinceLastSync = Date.now() - checkpoint.time
    const throttleMs = this.syncConfig.throttleSeconds * 1000

    return timeSinceLastSync >= throttleMs
  }

  /**
   * Obtém tempo restante para próxima sincronização
   */
  getTimeUntilNextSync(memberId: string, workspaceId: string): number {
    const checkpoint = this.getLastCheckpoint(memberId, workspaceId)
    if (!checkpoint) return 0

    const timeSinceLastSync = Date.now() - checkpoint.time
    const throttleMs = this.syncConfig.throttleSeconds * 1000

    return Math.max(0, throttleMs - timeSinceLastSync)
  }

  /**
   * Limpa checkpoints (útil para testes ou reset)
   */
  clearCheckpoints(): void {
    this.lastSyncCheckpoints.clear()
    console.log('🧹 IntelligentSync: Checkpoints limpos')
  }
}
