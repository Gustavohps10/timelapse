import {
  ITimeEntryQuery,
  PagedResultDTO,
  PaginationOptionsDTO,
  TimeEntryDTO,
} from '@timelapse/sdk'

import { RedmineBase } from './RedmineBase'

export class RedmineTimeEntryQuery
  extends RedmineBase
  implements ITimeEntryQuery
{
  public async findByMemberId(
    memberId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PagedResultDTO<TimeEntryDTO>> {
    const client = await this.getAuthenticatedClient()

    const response = await client.get('/time_entries.json', {
      params: {
        user_id: memberId,
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        limit: 100,
      },
    })

    const entries: TimeEntryDTO[] = response.data.time_entries.map(
      (entry: any) => ({
        id: entry.id,
        project: { id: entry.project.id, name: entry.project.name },
        issue: { id: entry.issue?.id },
        user: { id: entry.user.id, name: entry.user.name },
        activity: { id: entry.activity.id, name: entry.activity.name },
        hours: entry.hours,
        comments: entry.comments,
        spentOn: new Date(entry.spent_on),
        createdAt: new Date(entry.created_on),
        updatedAt: new Date(entry.updated_on),
      }),
    )

    return {
      items: entries,
      total: response.data.total_count ?? entries.length,
      page: 1,
      pageSize: entries.length,
    }
  }

  public async pull(
    memberId: string,
    checkpoint: { updatedAt: Date; id: string },
    batch: number,
  ): Promise<TimeEntryDTO[]> {
    const client = await this.getAuthenticatedClient()

    // ========================================================================
    // PARTE 1: DEFINIÇÕES
    // ========================================================================

    // O array que vai acumular os novos apontamentos encontrados entre as páginas.
    const newEntriesFound: TimeEntryDTO[] = []

    // Variáveis para controlar a paginação na API do Redmine.
    let offset = 0
    const limitPerPage = 100 // Sempre buscamos o máximo para reduzir chamadas de API.

    // A janela de tempo fixa. Buscaremos apontamentos cujo TRABALHO ('spent_on')
    // foi feito nos últimos 2 meses. É uma janela grande o suficiente para
    // capturar 99.9% das edições, que geralmente são em itens recentes.
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setMonth(toDate.getMonth() - 2)

    console.log(
      `Iniciando pull. Buscando na janela de ${fromDate.toISOString()} a ${toDate.toISOString()}`,
    )

    // ========================================================================
    // PARTE 2: O LOOP DE BUSCA PAGINADA DENTRO DA JANELA
    // ========================================================================

    // Continuaremos buscando páginas até que uma das condições de saída seja atendida.
    while (true) {
      console.log(`Buscando no Redmine... Offset: ${offset}`)

      const response = await client.get('/time_entries.json', {
        params: {
          user_id: memberId,
          from: fromDate.toISOString().split('T')[0],
          to: toDate.toISOString().split('T')[0],
          limit: limitPerPage,
          offset: offset,
        },
      })

      const entriesFromApi: any[] = response.data.time_entries

      // CONDIÇÃO DE SAÍDA 1: A API não tem mais dados nesta janela.
      if (entriesFromApi.length === 0) {
        console.log('API não retornou mais dados. Fim da busca.')
        break
      }

      // Mapeia os dados da API usando o 'updated_on' REAL.
      const mappedEntries = entriesFromApi.map((entry: any) => ({
        id: entry.id.toString(),
        task: { id: entry.issue.id.toString() },
        activity: {
          id: entry.activity.id.toString(),
          name: entry.activity.name,
        },
        user: { id: entry.user.id.toString(), name: entry.user.name },
        startDate: new Date(entry.spent_on),
        endDate: new Date(
          new Date(entry.spent_on).getTime() + entry.hours * 60 * 60 * 1000,
        ),
        timeSpent: entry.hours,
        comments: entry.comments,
        createdAt: new Date(entry.created_on),
        updatedAt: new Date(entry.updated_on), // <-- O VALOR REAL E CORRETO
      }))

      // Filtra em memória para achar apenas os que são mais novos que o checkpoint.
      const pageFiltered = mappedEntries.filter((entry) => {
        const updatedTime = entry.updatedAt.getTime()
        const checkpointTime = checkpoint.updatedAt.getTime()
        if (updatedTime === checkpointTime) {
          return Number(entry.id) > Number(checkpoint.id)
        }
        return updatedTime > checkpointTime
      })

      // Adiciona os resultados encontrados nesta página à nossa lista principal.
      if (pageFiltered.length > 0) {
        newEntriesFound.push(...pageFiltered)
      }

      // CONDIÇÃO DE SAÍDA 2 (OTIMIZAÇÃO): Já encontramos itens suficientes para
      // preencher o lote que o RxDB pediu. Não precisamos buscar mais páginas AGORA.
      if (newEntriesFound.length >= batch) {
        console.log(
          `Encontramos ${newEntriesFound.length} itens, o suficiente para o lote de ${batch}. Parando a busca por agora.`,
        )
        break
      }

      // Prepara para a próxima iteração.
      offset += limitPerPage
    }

    // ========================================================================
    // PARTE 3: PÓS-PROCESSAMENTO E RETORNO
    // ========================================================================

    // CRÍTICO: Ordenamos o resultado final em memória. Isso garante que, mesmo que
    // os itens venham de páginas diferentes, eles serão enviados ao RxDB na ordem
    // correta de atualização, garantindo que o próximo checkpoint seja o correto.
    newEntriesFound.sort((a, b) => {
      const timeA = a.updatedAt.getTime()
      const timeB = b.updatedAt.getTime()
      if (timeA === timeB) {
        return Number(a.id) - Number(b.id)
      }
      return timeA - timeB
    })

    // Retornamos apenas a fatia ('slice') correspondente ao lote pedido.
    return newEntriesFound.slice(0, batch)
  }

  findAll(
    pagination?: PaginationOptionsDTO,
  ): Promise<PagedResultDTO<TimeEntryDTO>> {
    throw new Error(
      'Método "findAll" não implementado para o conector Redmine.',
    )
  }

  findById(id: string): Promise<TimeEntryDTO | undefined> {
    throw new Error(
      'Método "findById" não implementado para o conector Redmine.',
    )
  }

  findByIds(ids: string[]): Promise<TimeEntryDTO[]> {
    throw new Error(
      'Método "findByIds" não implementado para o conector Redmine.',
    )
  }

  findByCondition(
    condition: Partial<TimeEntryDTO>,
    pagination?: PaginationOptionsDTO,
  ): Promise<PagedResultDTO<TimeEntryDTO>> {
    throw new Error(
      'Método "findByCondition" não implementado para o conector Redmine.',
    )
  }

  count(criteria?: Partial<TimeEntryDTO>): Promise<number> {
    throw new Error('Método "count" não implementado para o conector Redmine.')
  }

  exists(criteria: Partial<TimeEntryDTO>): Promise<boolean> {
    throw new Error('Método "exists" não implementado para o conector Redmine.')
  }
}
