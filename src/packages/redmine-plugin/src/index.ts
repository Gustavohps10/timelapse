import { ITaskMutation } from '@trackalize/application'
import {
  ConnectorRuntimeContext,
  IAuthenticationStrategy,
  IMemberQuery,
  ITaskQuery,
  ITimeEntryQuery,
  TrackalizeConnector,
} from '@trackalize/connector-sdk'

import { RedmineAuthenticationStrategy } from '@/RedmineAuthenticationStrategy'
import { RedmineMemberQuery } from '@/RedmineMemberQuery'
import { RedmineTaskMutation } from '@/RedmineTaskMutation'
import { RedmineTaskQuery } from '@/RedmineTaskQuery'
import { RedmineTimeEntryQuery } from '@/RedmineTimeEntryQuery'

const RedmineConnector: TrackalizeConnector = {
  id: '@trackalize/redmine-plugin',
  dataSourceType: 'redmine',
  displayName: 'Redmine (Oficial)',

  configFields: [
    {
      id: 'connection',
      label: 'Configuração da Conexão',
      fields: [
        {
          id: 'apiUrl',
          label: 'URL da sua instância Redmine',
          type: 'url',
          required: true,
          placeholder:
            '[https://redmine.suaempresa.com](https://redmine.suaempresa.com)',
        },
      ],
    },
    {
      id: 'auth-api-key',
      label: 'Autenticação com Chave de API (Recomendado)',
      fields: [
        {
          id: 'apiKey',
          label: 'Sua Chave de Acesso da API',
          type: 'password',
          required: false,
        },
      ],
    },
    {
      id: 'auth-user-pass',
      label: 'Autenticação com Usuário e Senha',
      fields: [
        {
          id: 'login',
          label: 'Usuário',
          type: 'text',
          required: false,
        },
        {
          id: 'password',
          label: 'Senha',
          type: 'password',
          required: false,
        },
      ],
    },
  ],

  getAuthenticationStrategy(
    context: ConnectorRuntimeContext,
  ): IAuthenticationStrategy {
    return new RedmineAuthenticationStrategy()
  },

  getTaskQuery(context: ConnectorRuntimeContext): ITaskQuery {
    return new RedmineTaskQuery()
  },

  getMemberQuery(context: ConnectorRuntimeContext): IMemberQuery {
    return new RedmineMemberQuery(context)
  },

  getTimeEntryQuery(context: ConnectorRuntimeContext): ITimeEntryQuery {
    return new RedmineTimeEntryQuery(context)
  },

  getTaskMutation(context: ConnectorRuntimeContext): ITaskMutation {
    return new RedmineTaskMutation()
  },
}

export default RedmineConnector
