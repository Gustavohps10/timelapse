import { IApplicationClient, ITimeEntriesClient } from '@timelapse/application'
import { AppError, Either } from '@timelapse/cross-cutting/helpers'

import { IntelligentSyncService } from './IntelligentSyncService'
import { getDatabase } from './syncEngine'

export async function createOfflineFirstClient(
  baseClient: IApplicationClient,
): Promise<Either<AppError, IApplicationClient>> {
  try {
    const _db = await getDatabase(baseClient)
    const intelligentSyncService = new IntelligentSyncService(baseClient)

    // Inicializar o serviço de sincronização
    const initResult = await intelligentSyncService.initialize()
    if (initResult.isFailure()) {
      console.error(
        'Erro ao inicializar IntelligentSyncService:',
        initResult.failure,
      )
      return Either.failure(initResult.failure)
    }

    const offlineTimeEntriesService: ITimeEntriesClient = {
      findByMemberId: async (payload) => {
        console.log('[INFRA]: Buscando TimeEntries do banco LOCAL...')

        try {
          // Construir filtros baseados no payload
          const memberId = payload.body.memberId
          const startDate = payload.body.startDate
          const endDate = payload.body.endDate
          const workspaceId = payload.body.workspaceId

          // Primeiro, buscar dados locais
          const localResult =
            await intelligentSyncService.getLocalTimeEntriesByMemberId(
              memberId,
              startDate,
              endDate,
            )

          if (localResult.isFailure()) {
            console.error(
              '[INFRA]: Erro ao buscar dados locais:',
              localResult.failure,
            )
            return {
              data: [],
              totalItems: 0,
              totalPages: 0,
              currentPage: 1,
              isSuccess: false,
              statusCode: 500,
            }
          }

          const localTimeEntries = localResult.success
          console.log(
            `[INFRA]: Encontrados ${localTimeEntries.length} TimeEntries no banco local`,
          )

          // Verificar se tem contexto válido de usuário antes de sincronizar
          if (
            !memberId ||
            !workspaceId ||
            memberId === 'undefined' ||
            workspaceId === 'undefined'
          ) {
            console.log(
              '[INFRA]: Sem contexto de usuário válido - retornando apenas dados locais',
            )
            return {
              data: localTimeEntries,
              totalItems: localTimeEntries.length,
              totalPages: 1,
              currentPage: 1,
              isSuccess: true,
              statusCode: 200,
            }
          }

          // Verificar se precisa sincronizar
          const canSync = intelligentSyncService.canSync(memberId, workspaceId)
          const lastCheckpoint = intelligentSyncService.getLastCheckpoint(
            memberId,
            workspaceId,
          )

          if (!lastCheckpoint) {
            // Primeira vez - fazer sync inicial com últimos 30 dias
            console.log(
              '[INFRA]: Primeira sincronização - executando sync inicial (últimos 30 dias)...',
            )
            const syncResult = await intelligentSyncService.performInitialSync(
              memberId,
              workspaceId,
            )

            if (syncResult.isSuccess()) {
              console.log(
                `[INFRA]: Sync inicial concluído - ${syncResult.success.length} TimeEntries sincronizados`,
              )
              // Retornar dados atualizados após sync inicial
              const updatedLocalResult =
                await intelligentSyncService.getLocalTimeEntriesByMemberId(
                  memberId,
                  startDate,
                  endDate,
                )
              if (updatedLocalResult.isSuccess()) {
                return {
                  data: updatedLocalResult.success,
                  totalItems: updatedLocalResult.success.length,
                  totalPages: 1,
                  currentPage: 1,
                  isSuccess: true,
                  statusCode: 200,
                }
              }
            } else {
              console.error(
                '[INFRA]: Erro no sync inicial:',
                syncResult.failure,
              )
            }
          } else if (canSync) {
            // Pode sincronizar - fazer sync incremental
            console.log('[INFRA]: Executando sincronização incremental...')
            const syncResult =
              await intelligentSyncService.syncTimeEntriesByMemberId(
                memberId,
                startDate,
                endDate,
                workspaceId,
              )

            if (syncResult.isSuccess()) {
              console.log(
                `[INFRA]: Sync incremental concluído - ${syncResult.success.length} TimeEntries sincronizados`,
              )
              // Retornar dados atualizados após sync
              const updatedLocalResult =
                await intelligentSyncService.getLocalTimeEntriesByMemberId(
                  memberId,
                  startDate,
                  endDate,
                )
              if (updatedLocalResult.isSuccess()) {
                return {
                  data: updatedLocalResult.success,
                  totalItems: updatedLocalResult.success.length,
                  totalPages: 1,
                  currentPage: 1,
                  isSuccess: true,
                  statusCode: 200,
                }
              }
            } else {
              console.log(
                '[INFRA]: Sync incremental falhou ou foi throttled:',
                syncResult.failure.details,
              )
            }
          } else {
            const timeUntilNextSync =
              intelligentSyncService.getTimeUntilNextSync(memberId, workspaceId)
            console.log(
              `[INFRA]: Sync throttled. Próxima sincronização em ${Math.ceil(timeUntilNextSync / 1000)}s`,
            )
          }

          // Retornar dados locais (com ou sem sync)
          return {
            data: localTimeEntries,
            totalItems: localTimeEntries.length,
            totalPages: 1,
            currentPage: 1,
            isSuccess: true,
            statusCode: 200,
          }
        } catch (error) {
          console.error(
            '[INFRA]: Erro ao buscar TimeEntries do banco local:',
            error,
          )

          return {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            isSuccess: false,
            statusCode: 500,
          }
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

    return Either.success(finalClient)
  } catch (error) {
    return Either.failure(
      new AppError(
        'OFFLINE_CLIENT_ERROR',
        error instanceof Error
          ? error.message
          : 'Erro ao criar cliente offline-first',
        500,
      ),
    )
  }
}
