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
          if (receivedIssues?.length) allIssuesForFilter.push(...receivedIssues)

          if (!receivedIssues || receivedIssues.length < limitPerRequest) {
            keepFetching = false
          } else {
            offset += limitPerRequest
          }
        } catch (error) {
          console.error('Erro ao buscar página de issues:', error)
          keepFetching = false
        }
      }
      return allIssuesForFilter
    }

    const customFieldIds = [8, 9, 16, 24] // Teste, Revisão, Tarefa, Análise

    const baseSearchParams = {
      updated_on: `>=${checkpointDate}`,
      sort: 'updated_on:asc,id:asc',
    }

    const trackerIdsToPull = [
      // 1, // Bug
      // 2, // Funcionalidade
      3, // Suporte
      // 4, // Spike
      5, // Scrum
      // 6, // Refatoração
      // 9, // Teste
      // 10, // Orçamento
      11, // Gerência de Configuração
      12, // Apoio
      13, // Homologação
      // 14, // Documentação
      // 15, // Tarefa Pai
      // 18, // Comunicados
      19, // Reunião
      // 20, // Plano de projetos
      // 21, // Auditoria
      // 22, // Ação Corretiva
      // 23, // Auditoria de Baseline
    ]

    const fetchPromises = [
      // 1. Tarefas atribuídas ao usuário
      fetchAllPages({ ...baseSearchParams, assigned_to_id: memberId }),

      // 2. Tarefas criadas pelo usuário
      fetchAllPages({ ...baseSearchParams, author_id: memberId }),

      // 3. Tarefas onde o usuário está em um campo customizado
      ...customFieldIds.map((fieldId) =>
        fetchAllPages({ ...baseSearchParams, [`cf_${fieldId}`]: memberId }),
      ),

      // 4. UMA ÚNICA requisição para todos os tipos de tarefas genéricas
      fetchAllPages({
        ...baseSearchParams,
        // --- CORREÇÃO APLICADA AQUI ---
        // Usa .join('|') para criar uma string com o operador "OU" do Redmine
        tracker_id: trackerIdsToPull.join('|'),
      }),
    ]

    const resultsFromAllPages = await Promise.all(fetchPromises)
    const allIssues = resultsFromAllPages.flatMap((list) => list)
    const uniqueIssuesMap = new Map(allIssues.map((issue) => [issue.id, issue]))

    const sortedUniqueIssues = Array.from(uniqueIssuesMap.values()).sort(
      (a, b) => {
        const dateA = new Date(a.updated_on).getTime()
        const dateB = new Date(b.updated_on).getTime()
        if (dateA !== dateB) return dateA - dateB
        return a.id - b.id
      },
    )

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

      const statusChanges: any[] = []
      const journals: any[] = fullIssue.journals || []
      for (const journal of journals) {
        for (const detail of journal.details || []) {
          if (detail.name === 'status_id') {
            const fromStatus = statusMap.get(detail.old_value) ?? 'Desconhecido'
            const toStatus = statusMap.get(detail.new_value) ?? 'Desconhecido'
            statusChanges.push({
              fromStatus,
              toStatus,
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
          ? { id: fullIssue.author.id.toString(), name: fullIssue.author.name }
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

      if (newTasksFound.length >= batch) break
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
