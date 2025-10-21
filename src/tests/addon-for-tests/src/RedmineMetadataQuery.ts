import { IMetadataQuery, MetadataDTO, MetadataItem } from '@timelapse/sdk'
import { AxiosResponse } from 'axios'

import { RedmineBase } from '@/RedmineBase'

const activityIconMap = new Map<string, string>([
  ['8', 'Palette'],
  ['9', 'Code'],
  ['10', 'BarChart2'],
  ['11', 'CalendarCheck'],
  ['12', 'CheckCircle'],
  ['13', 'FlaskConical'],
  ['14', 'SearchCode'],
  ['15', 'Settings'],
  ['16', 'Wrench'],
  ['17', 'LifeBuoy'],
  ['18', 'Handshake'],
  ['19', 'ClipboardCheck'],
  ['25', 'FileText'],
  ['26', 'GraduationCap'],
  ['27', 'Users'],
  ['28', 'Briefcase'],
  ['30', 'ShieldCheck'],
])

export class RedmineMetadataQuery
  extends RedmineBase
  implements IMetadataQuery
{
  public async getMetadata(): Promise<MetadataDTO> {
    console.log('METADATA: Iniciando busca de metadados...')
    try {
      const client = await this.getAuthenticatedClient()

      const results = await Promise.allSettled([
        client.get('issue_statuses.json'),
        client.get('enumerations/issue_priorities.json'),
        client.get('enumerations/time_entry_activities.json'),
        client.get('trackers.json'),
      ])

      const processResult = <T>(
        result: PromiseSettledResult<AxiosResponse<T>>,
        name: string,
        dataKey: keyof T,
      ): any[] => {
        if (result.status === 'fulfilled') {
          const data = result.value.data?.[dataKey] as any[]
          if (data) {
            console.log(
              `METADATA: Buscados ${data.length} item(s) para '${name}'.`,
            )
            return data
          }
          console.warn(
            `METADATA: Resposta para '${name}' não continha a chave esperada '${String(
              dataKey,
            )}'.`,
          )
          return []
        } else {
          console.error(
            `METADATA: Falha ao buscar metadados para '${name}'. Razão:`,
            result.reason,
          )
          return []
        }
      }

      const rawStatuses = processResult(
        results[0],
        'Status de Tarefas',
        'issue_statuses',
      )
      const rawPriorities = processResult(
        results[1],
        'Prioridades',
        'issue_priorities',
      )
      const rawActivities = processResult(
        results[2],
        'Atividades',
        'time_entry_activities',
      )
      const rawTrackers = processResult(results[3], 'Trackers', 'trackers')

      console.log('METADATA: Mapeando dados recebidos da API...')
      const taskStatuses = this._mapStatuses(rawStatuses)
      const taskPriorities = this._mapPriorities(rawPriorities)
      const activities = this._mapActivities(rawActivities)
      const trackStatuses = this._mapTrackers(rawTrackers)

      console.log(
        'METADATA: Gerando metadados estáticos para Papéis de Participante...',
      )
      const participantRoles = this._getParticipantRoles()

      console.log(
        'METADATA: Gerando metadados estáticos para Tipos de Tempo Estimado...',
      )
      const estimationTypes = this._getEstimationTypes()

      console.log('METADATA: Mapeamento de metadados concluído com sucesso.')

      return {
        taskStatuses,
        taskPriorities,
        activities,
        trackStatuses,
        participantRoles,
        estimationTypes,
      }
    } catch (error) {
      console.error(
        'METADATA: Erro geral inesperado ao buscar metadados:',
        error,
      )
      return {
        taskStatuses: [],
        taskPriorities: [],
        activities: [],
        trackStatuses: [],
        participantRoles: [],
        estimationTypes: [],
      }
    }
  }

  private _mapStatuses(
    statuses: { id: number; name: string }[],
  ): MetadataItem[] {
    return (statuses || []).map((status) => {
      const uiConfig = this._getUiConfigForStatus(status.id)
      return {
        id: status.id.toString(),
        name: status.name,
        icon: uiConfig.icon,
        colors: uiConfig.colors,
      }
    })
  }

  private _mapPriorities(
    priorities: { id: number; name: string }[],
  ): MetadataItem[] {
    return (priorities || []).map((priority) => {
      const uiConfig = this._getUiConfigForPriority(priority.id)
      return {
        id: priority.id.toString(),
        name: priority.name,
        icon: uiConfig.icon,
        colors: uiConfig.colors,
      }
    })
  }

  private _mapActivities(
    activities: { id: number; name: string }[],
  ): MetadataItem[] {
    return (activities || []).map((activity) => ({
      id: activity.id.toString(),
      name: activity.name,
      icon: activityIconMap.get(activity.id.toString()) || 'Activity',
      colors: {
        badge: 'bg-slate-200 dark:bg-slate-700',
        background: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-300',
      },
    }))
  }

  private _mapTrackers(
    trackers: { id: number; name: string }[],
  ): MetadataItem[] {
    return (trackers || []).map((tracker) => {
      const uiConfig = this._getUiConfigForTracker(tracker.id)
      return {
        id: tracker.id.toString(),
        name: tracker.name,
        icon: uiConfig.icon,
        colors: uiConfig.colors,
      }
    })
  }

  private _getParticipantRoles(): MetadataItem[] {
    const roles: MetadataItem[] = [
      {
        id: '5',
        name: 'Autor',
        icon: 'User',
        colors: {
          badge: 'bg-gray-200 dark:bg-gray-700',
          background: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-300',
        },
      },
      {
        id: 'assignee',
        name: 'Atribuído',
        icon: 'UserCheck',
        colors: {
          badge: 'bg-blue-100 dark:bg-blue-900/30',
          background: 'bg-blue-50 dark:bg-blue-950',
          text: 'text-blue-700 dark:text-blue-300',
        },
      },
      {
        id: '1',
        name: 'Testador',
        icon: 'FlaskConical',
        colors: {
          badge: 'bg-purple-100 dark:bg-purple-900/30',
          background: 'bg-purple-50 dark:bg-purple-950',
          text: 'text-purple-700 dark:text-purple-300',
        },
      },
      {
        id: '2',
        name: 'Revisor',
        icon: 'SearchCode',
        colors: {
          badge: 'bg-orange-100 dark:bg-orange-900/30',
          background: 'bg-orange-50 dark:bg-orange-950',
          text: 'text-orange-700 dark:text-orange-300',
        },
      },
      {
        id: '3',
        name: 'Responsável Tarefa',
        icon: 'ClipboardCheck',
        colors: {
          badge: 'bg-yellow-100 dark:bg-yellow-900/30',
          background: 'bg-yellow-50 dark:bg-yellow-950',
          text: 'text-yellow-700 dark:text-yellow-300',
        },
      },
      {
        id: '4',
        name: 'Analista',
        icon: 'GraduationCap',
        colors: {
          badge: 'bg-teal-100 dark:bg-teal-900/30',
          background: 'bg-teal-50 dark:bg-teal-950',
          text: 'text-teal-700 dark:text-teal-300',
        },
      },
    ]
    return roles
  }

  private _getEstimationTypes(): MetadataItem[] {
    const types: MetadataItem[] = [
      {
        id: '1',
        name: 'Tempo de Produção',
        icon: 'Code',
        colors: {
          badge: 'bg-green-100 dark:bg-green-900/30',
          background: 'bg-green-50 dark:bg-green-950',
          text: 'text-green-700 dark:text-green-300',
        },
      },
      {
        id: '2',
        name: 'Tempo de Validação',
        icon: 'ClipboardCheck',
        colors: {
          badge: 'bg-yellow-100 dark:bg-yellow-900/30',
          background: 'bg-yellow-50 dark:bg-yellow-950',
          text: 'text-yellow-700 dark:text-yellow-300',
        },
      },
      {
        id: '3',
        name: 'Tempo de Documentação',
        icon: 'FileText',
        colors: {
          badge: 'bg-blue-100 dark:bg-blue-900/30',
          background: 'bg-blue-50 dark:bg-blue-950',
          text: 'text-blue-700 dark:text-blue-300',
        },
      },
      {
        id: '4',
        name: 'Tempo Geral',
        icon: 'Clock', // Usando um ícone genérico de relógio
        colors: {
          badge: 'bg-gray-200 dark:bg-gray-700',
          background: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-300',
        },
      },
    ]
    return types
  }

  private _getUiConfigForStatus(statusId: number): {
    icon: string
    colors: MetadataItem['colors']
  } {
    switch (statusId) {
      case 1:
      case 25:
        return {
          icon: 'Timer',
          colors: {
            badge: 'bg-blue-100 dark:bg-blue-900/30',
            background: 'bg-blue-50 dark:bg-blue-950',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-300 dark:border-blue-700',
          },
        }
      case 2:
      case 20:
      case 8:
      case 10:
      case 26:
        return {
          icon: 'ZapIcon',
          colors: {
            badge: 'bg-yellow-100 dark:bg-yellow-900/30',
            background: 'bg-yellow-50 dark:bg-yellow-950',
            text: 'text-yellow-700 dark:text-yellow-300',
            border: 'border-yellow-300 dark:border-yellow-700',
          },
        }
      case 24:
      case 28:
      case 7:
      case 9:
      case 11:
        return {
          icon: 'PauseCircle',
          colors: {
            badge: 'bg-orange-100 dark:bg-orange-900/30',
            background: 'bg-orange-50 dark:bg-orange-950',
            text: 'text-orange-700 dark:text-orange-300',
            border: 'border-orange-300 dark:border-orange-700',
          },
        }
      case 19:
      case 6:
      case 23:
      case 15:
        return {
          icon: 'CircleX',
          colors: {
            badge: 'bg-red-100 dark:bg-red-900/30',
            background: 'bg-red-50 dark:bg-red-950',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-300 dark:border-red-700',
          },
        }
      case 21:
      case 22:
      case 27:
      case 18:
      case 3:
      case 14:
        return {
          icon: 'CheckCircle2',
          colors: {
            badge: 'bg-green-100 dark:bg-green-900/30',
            background: 'bg-green-50 dark:bg-green-950',
            text: 'text-green-700 dark:text-green-300',
            border: 'border-green-300 dark:border-green-700',
          },
        }
      case 12:
      case 13:
        return {
          icon: 'ArchiveX',
          colors: {
            badge: 'bg-gray-200 dark:bg-gray-700',
            background: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-300',
            border: 'border-gray-300 dark:border-gray-600',
          },
        }
      default:
        return {
          icon: 'HelpCircle',
          colors: {
            badge: 'bg-gray-200 dark:bg-gray-700',
            background: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-300',
            border: 'border-gray-300 dark:border-gray-600',
          },
        }
    }
  }

  private _getUiConfigForPriority(priorityId: number): {
    icon: string
    colors: MetadataItem['colors']
  } {
    switch (priorityId) {
      case 1:
        return {
          icon: 'Flag',
          colors: {
            text: 'text-gray-500 dark:text-gray-400',
            badge: '',
            background: '',
          },
        }
      case 2:
        return {
          icon: 'Flag',
          colors: {
            text: 'text-blue-600 dark:text-blue-400',
            badge: '',
            background: '',
          },
        }
      case 3:
        return {
          icon: 'Flag',
          colors: {
            text: 'text-yellow-600 dark:text-yellow-400',
            badge: '',
            background: '',
          },
        }
      case 4:
      case 5:
        return {
          icon: 'Flag',
          colors: {
            text: 'text-red-600 dark:text-red-400',
            badge: '',
            background: '',
          },
        }
      default:
        return {
          icon: 'Flag',
          colors: {
            text: 'text-gray-500 dark:text-gray-400',
            badge: '',
            background: '',
          },
        }
    }
  }

  private _getUiConfigForTracker(trackerId: number): {
    icon: string
    colors: MetadataItem['colors']
  } {
    switch (trackerId) {
      case 1:
        return {
          icon: 'Bug',
          colors: {
            badge: 'bg-red-100 dark:bg-red-900/30',
            background: 'bg-red-50 dark:bg-red-950',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-300 dark:border-red-700',
          },
        }
      case 2:
        return {
          icon: 'Star',
          colors: {
            badge: 'bg-purple-100 dark:bg-purple-900/30',
            background: 'bg-purple-50 dark:bg-purple-950',
            text: 'text-purple-700 dark:text-purple-300',
            border: 'border-purple-300 dark:border-purple-700',
          },
        }
      case 3:
        return {
          icon: 'LifeBuoy',
          colors: {
            badge: 'bg-blue-100 dark:bg-blue-900/30',
            background: 'bg-blue-50 dark:bg-blue-950',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-300 dark:border-blue-700',
          },
        }
      default:
        return {
          icon: 'Tag',
          colors: {
            badge: 'bg-gray-200 dark:bg-gray-700',
            background: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-300',
            border: 'border-gray-300 dark:border-gray-600',
          },
        }
    }
  }
}
