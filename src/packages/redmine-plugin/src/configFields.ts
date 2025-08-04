import { FieldGroup } from '@trackalize/connector-sdk'

export const configFields: FieldGroup[] = [
  {
    id: 'connection',
    label: 'Configuração da Conexão',
    fields: [
      {
        id: 'apiUrl',
        label: 'URL da sua instância Redmine',
        type: 'url',
        required: true,
        placeholder: 'https://redmine.suaempresa.com',
        persistable: true,
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
        persistable: false,
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
        persistable: false,
      },
      {
        id: 'password',
        label: 'Senha',
        type: 'password',
        required: false,
        persistable: false,
      },
    ],
  },
]
