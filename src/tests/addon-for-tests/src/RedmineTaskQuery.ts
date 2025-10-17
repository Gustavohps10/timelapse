import { StatusChangeDTO } from '@timelapse/application'
import {
  ITaskQuery,
  PagedResultDTO,
  PaginationOptionsDTO,
  TaskDTO,
} from '@timelapse/sdk'

import { RedmineBase } from '@/RedmineBase'

interface CustomField {
  id: number
  value: any
}

export class RedmineTaskQuery extends RedmineBase implements ITaskQuery {
  public async pull(
    memberId: string,
    checkpoint: { updatedAt: Date; id: string },
    batch: number,
  ): Promise<TaskDTO[]> {
    const client = await this.getAuthenticatedClient()
    const newTasksFound: TaskDTO[] = []
    let offset = 0
    const limitPerPage = 100

    const checkpointDate = checkpoint.updatedAt.toISOString()

    while (newTasksFound.length < batch) {
      const response = await client.get('issues.json', {
        params: {
          assigned_to_id: memberId,
          limit: limitPerPage,
          offset,
          updated_on: `>=${checkpointDate}`,
          sort: 'updated_on:asc,id:asc',
        },
      })

      const issues: any[] = response.data.issues
      if (issues.length === 0) {
        break
      }

      const issueDetailPromises = issues.map((issue) =>
        client
          .get(`issues/${issue.id}.json`, {
            params: { include: 'journals' },
          })
          .then((r) => r.data),
      )

      const results = await Promise.all(issueDetailPromises)

      for (const { issue: fullIssue } of results) {
        if (
          fullIssue.updated_on === checkpointDate &&
          Number(fullIssue.id) <= Number(checkpoint.id)
        ) {
          continue
        }

        const statusChanges: StatusChangeDTO[] = []
        const journals: any[] = fullIssue.journals || []
        for (const journal of journals) {
          for (const detail of journal.details || []) {
            if (detail.name === 'status_id') {
              statusChanges.push({
                fromStatus: detail.old_value_name!,
                toStatus: detail.new_value_name!,
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
          status: {
            id: fullIssue.status.id.toString(),
            name: fullIssue.status.name,
          },
          assignedTo: fullIssue.assigned_to
            ? {
                id: fullIssue.assigned_to.id.toString(),
                name: fullIssue.assigned_to.name,
              }
            : undefined,
          createdAt: new Date(fullIssue.created_on),
          updatedAt: new Date(fullIssue.updated_on),
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
          },
          statusChanges: statusChanges.length > 0 ? statusChanges : undefined,
        }

        newTasksFound.push(task)
        if (newTasksFound.length >= batch) {
          break
        }
      }

      if (newTasksFound.length >= batch || issues.length < limitPerPage) {
        break
      }

      offset += limitPerPage
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
