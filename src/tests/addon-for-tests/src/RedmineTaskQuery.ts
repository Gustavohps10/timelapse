import {
  ITaskQuery,
  MarkupConverter,
  PagedResultDTO,
  PaginationOptionsDTO,
  TaskDTO,
} from '@timelapse/sdk'

import { RedmineBase } from '@/RedmineBase'

export class RedmineTaskQuery extends RedmineBase implements ITaskQuery {
  public async pull(
    memberId: string,
    checkpoint: { updatedAt: Date; id: string },
    batch: number,
  ): Promise<TaskDTO[]> {
    const client = await this.getAuthenticatedClient()

    const statusResponse = await client.get('issue_statuses.json')
    const statusMap = new Map<string, string>()
    for (const status of statusResponse.data.issue_statuses) {
      statusMap.set(status.id.toString(), status.name)
    }

    const checkpointDate = checkpoint.updatedAt.toISOString().split('.')[0]
    const limitPerRequest = 100

    // --- PASSO 1: Função auxiliar que lida com a paginação para UM filtro ---
    // Esta função garante que obteremos TODAS as issues de um filtro,
    // buscando página por página até o fim.
    const fetchAllPages = async (queryParams: object): Promise<any[]> => {
      const allIssuesForFilter: any[] = []
      let offset = 0
      let keepFetching = true

      while (keepFetching) {
        try {
          const response = await client.get('issues.json', {
            params: { ...queryParams, limit: limitPerRequest, offset },
          })

          const receivedIssues = response.data.issues
          if (receivedIssues && receivedIssues.length > 0) {
            allIssuesForFilter.push(...receivedIssues)
          }

          // Se a API retornou menos itens que o limite, esta é a última página.
          if (!receivedIssues || receivedIssues.length < limitPerRequest) {
            keepFetching = false
          } else {
            offset += limitPerRequest
          }
        } catch (error) {
          console.error('Erro ao buscar página de issues:', error)
          keepFetching = false // Interrompe em caso de erro para este filtro
        }
      }
      return allIssuesForFilter
    }

    // IDs dos campos personalizados que identificamos
    const customFieldIds = [
      8, // Responsável Teste
      9, // Responsável Revisão
      16, // Responsável Tarefa
      24, // Responsável Análise
    ]

    // --- PASSO 2: Preparar e executar as buscas completas em paralelo ---
    const baseSearchParams = {
      updated_on: `>=${checkpointDate}`,
      sort: 'updated_on:asc,id:asc',
    }

    const fetchPromises = [
      fetchAllPages({ ...baseSearchParams, assigned_to_id: memberId }),
      fetchAllPages({ ...baseSearchParams, author_id: memberId }),
      ...customFieldIds.map((fieldId) =>
        fetchAllPages({ ...baseSearchParams, [`cf_${fieldId}`]: memberId }),
      ),
    ]

    // --- PASSO 3: Consolidar os resultados de TODAS as páginas de TODAS as buscas ---
    const resultsFromAllPages = await Promise.all(fetchPromises)
    const allIssues = resultsFromAllPages.flatMap((issueList) => issueList)
    const uniqueIssuesMap = new Map(allIssues.map((issue) => [issue.id, issue]))

    // Reordenar a lista final para que o checkpoint funcione corretamente
    const sortedUniqueIssues = Array.from(uniqueIssuesMap.values()).sort(
      (a, b) => {
        const dateA = new Date(a.updated_on).getTime()
        const dateB = new Date(b.updated_on).getTime()
        if (dateA !== dateB) return dateA - dateB
        return a.id - b.id
      },
    )

    // --- PASSO 4: Processar a lista unificada e criar os DTOs ---
    const newTasksFound: TaskDTO[] = []

    for (const issue of sortedUniqueIssues) {
      const { issue: fullIssue } = await client
        .get(`issues/${issue.id}.json`, { params: { include: 'journals' } })
        .then((r) => r.data)

      if (
        fullIssue.updated_on === checkpointDate &&
        Number(fullIssue.id) <= Number(checkpoint.id)
      ) {
        continue
      }

      const statusChanges: any[] = [] // Substitua 'any' pelo seu DTO
      const journals: any[] = fullIssue.journals || []
      for (const journal of journals) {
        for (const detail of journal.details || []) {
          if (detail.name === 'status_id') {
            const fromStatusName =
              statusMap.get(detail.old_value) ?? 'Desconhecido'
            const toStatusName =
              statusMap.get(detail.new_value) ?? 'Desconhecido'
            statusChanges.push({
              fromStatus: fromStatusName,
              toStatus: toStatusName,
              changedBy: journal.user?.name!,
              changedAt: new Date(journal.created_on),
            })
          }
        }
      }

      const task: TaskDTO = {
        id: fullIssue.id.toString(),
        url: `${this.context?.config?.apiUrl}/issues/${fullIssue.id}`,
        title: fullIssue.subject,
        description: MarkupConverter.fromTextile(
          fullIssue.description,
          this.context?.config?.apiUrl!,
        ),
        projectName: fullIssue.project?.name,
        status: {
          id: fullIssue.status.id.toString(),
          name: fullIssue.status.name,
        },
        priority: fullIssue.priority
          ? {
              id: fullIssue.priority.id.toString(),
              name: fullIssue.priority.name,
            }
          : undefined,
        assignedTo: fullIssue.assigned_to
          ? {
              id: fullIssue.assigned_to.id.toString(),
              name: fullIssue.assigned_to.name,
            }
          : undefined,
        author: fullIssue.author
          ? {
              id: fullIssue.author.id.toString(),
              name: fullIssue.author.name,
            }
          : undefined,
        createdAt: new Date(fullIssue.created_on),
        updatedAt: new Date(fullIssue.updated_on),
        startDate: fullIssue.start_date
          ? new Date(fullIssue.start_date)
          : undefined,
        dueDate: fullIssue.due_date ? new Date(fullIssue.due_date) : undefined,
        doneRatio: fullIssue.done_ratio,
        spentHours: fullIssue.spent_hours,
        estimatedTime: {
          production:
            Number(
              (fullIssue.custom_fields as any[]).find((c) => c.id === 57)
                ?.value,
            ) || undefined,
          validation:
            Number(
              (fullIssue.custom_fields as any[]).find((c) => c.id === 58)
                ?.value,
            ) || undefined,
          documentation:
            Number(
              (fullIssue.custom_fields as any[]).find((c) => c.id === 59)
                ?.value,
            ) || undefined,
          generic:
            Number(
              (fullIssue.custom_fields as any[]).find((c) => c.id === 60)
                ?.value,
            ) || undefined,
        },
        statusChanges: statusChanges.length > 0 ? statusChanges : undefined,
      }

      newTasksFound.push(task)

      if (newTasksFound.length >= batch) {
        break
      }
    }

    return newTasksFound.slice(0, batch)
  }

  findAll(pagination?: PaginationOptionsDTO): Promise<PagedResultDTO<TaskDTO>> {
    throw new Error('Method findAll RedmineTaskQuery not implemented.')
  }

  findById(id: string): Promise<TaskDTO | undefined> {
    throw new Error('Method findById RedmineTaskQuery not implemented.')
  }

  findByIds(ids: string[]): Promise<TaskDTO[]> {
    throw new Error('Method findByIds RedmineTaskQuery not implemented.')
  }

  findByCondition(
    condition: Partial<TaskDTO>,
    pagination?: PaginationOptionsDTO,
  ): Promise<PagedResultDTO<TaskDTO>> {
    throw new Error('Method findByCondition RedmineTaskQuery not implemented.')
  }

  count(criteria?: Partial<TaskDTO>): Promise<number> {
    throw new Error('Method count RedmineTaskQuery not implemented.')
  }

  exists(criteria: Partial<TaskDTO>): Promise<boolean> {
    throw new Error('Method exists RedmineTaskQuery not implemented.')
  }
}
