import { IMetadataQuery, MetadataDTO, MetadataItem } from '@timelapse/sdk'

import { RedmineBase } from '@/RedmineBase'

// Mapeamento estático de ID de atividade para nome do ícone Lucide
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
  ['30', 'ShieldCheck'], // Ícone para Auditoria (não estava na lista original)
])

export class RedmineMetadataQuery
  extends RedmineBase
  implements IMetadataQuery
{
  public async getMetadata(): Promise<MetadataDTO> {
    const client = await this.getAuthenticatedClient()

    const [statusResponse, priorityResponse, activityResponse] =
      await Promise.all([
        client.get('issue_statuses.json'),
        client.get('enumerations/issue_priorities.json'),
        client.get('enumerations/time_entry_activities.json'),
      ])

    const taskStatuses = this._mapStatuses(statusResponse.data.issue_statuses)
    const taskPriorities = this._mapPriorities(
      priorityResponse.data.issue_priorities,
    )
    const activities = this._mapActivities(
      activityResponse.data.time_entry_activities,
    )

    return {
      taskStatuses,
      taskPriorities,
      activities,
    }
  }

  // --- MÉTODOS DE MAPEAMENTO PRIVADOS E EXPLÍCITOS ---

  private _mapStatuses(
    statuses: { id: number; name: string }[],
  ): MetadataItem[] {
    return statuses.map((status) => {
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
    return priorities.map((priority) => {
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
    return activities.map((activity) => ({
      id: activity.id.toString(),
      name: activity.name,
      icon: activityIconMap.get(activity.id.toString()) || 'Activity', // Fallback para ícone genérico
      colors: {
        badge: 'bg-slate-200 dark:bg-slate-700',
        background: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-300',
      },
    }))
  }

  // --- LÓGICA DE UI POR ID ---

  private _getUiConfigForStatus(statusId: number): {
    icon: string
    colors: MetadataItem['colors']
  } {
    switch (statusId) {
      // Aberto / Pendente
      case 1: // Nova
      case 25: // Aguardando Analise
        return {
          icon: 'Timer',
          colors: {
            badge: 'bg-blue-100 dark:bg-blue-900/30',
            background: 'bg-blue-50 dark:bg-blue-950',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-300 dark:border-blue-700',
          },
        }

      // Em Progresso
      case 2: // Em andamento
      case 20: // Em Análise
      case 8: // Em revisão
      case 10: // Em Teste
      case 26: // Em Orçamento
        return {
          icon: 'ZapIcon',
          colors: {
            badge: 'bg-yellow-100 dark:bg-yellow-900/30',
            background: 'bg-yellow-50 dark:bg-yellow-950',
            text: 'text-yellow-700 dark:text-yellow-300',
            border: 'border-yellow-300 dark:border-yellow-700',
          },
        }

      // Aguardando / Bloqueado
      case 24: // Analise de Viabilidade
      case 28: // Aguard. Aprovação do Orçamento
      case 7: // Aguardando Revisão
      case 9: // Aguardando Teste
      case 11: // Impedida
        return {
          icon: 'PauseCircle',
          colors: {
            badge: 'bg-orange-100 dark:bg-orange-900/30',
            background: 'bg-orange-50 dark:bg-orange-950',
            text: 'text-orange-700 dark:text-orange-300',
            border: 'border-orange-300 dark:border-orange-700',
          },
        }

      // Rejeitado
      case 19: // Rejeitada Revisão
      case 6: // Rejeitada Teste
      case 23: // Rejeitada
      case 15: // Implantação Rejeitada
        return {
          icon: 'CircleX',
          colors: {
            badge: 'bg-red-100 dark:bg-red-900/30',
            background: 'bg-red-50 dark:bg-red-950',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-300 dark:border-red-700',
          },
        }

      // Concluído / Fechado
      case 21: // Análise Concluída
      case 22: // Análise Revisada
      case 27: // Orçamento Aprovado
      case 18: // Validada
      case 3: // Concluída
      case 14: // Implantada
        return {
          icon: 'CheckCircle2',
          colors: {
            badge: 'bg-green-100 dark:bg-green-900/30',
            background: 'bg-green-50 dark:bg-green-950',
            text: 'text-green-700 dark:text-green-300',
            border: 'border-green-300 dark:border-green-700',
          },
        }

      // Outros estados fechados
      case 12: // Não entregue
      case 13: // Retirada
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
      case 1: // Baixa
        return {
          icon: 'Flag',
          colors: {
            text: 'text-gray-500 dark:text-gray-400',
            badge: '',
            background: '',
          },
        }
      case 2: // Normal
        return {
          icon: 'Flag',
          colors: {
            text: 'text-blue-600 dark:text-blue-400',
            badge: '',
            background: '',
          },
        }
      case 3: // Alta
        return {
          icon: 'Flag',
          colors: {
            text: 'text-yellow-600 dark:text-yellow-400',
            badge: '',
            background: '',
          },
        }
      case 4: // Urgente
      case 5: // Imediata
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
}
