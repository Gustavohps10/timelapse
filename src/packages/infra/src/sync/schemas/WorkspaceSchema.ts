import { RxJsonSchema } from 'rxdb'

import { WorkspaceDoc } from '@/sync/types'

export const workspaceSchema: RxJsonSchema<WorkspaceDoc> = {
  title: 'workspace schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    dataSource: { type: 'string', maxLength: 50 },
    dataSourceConfiguration: { type: 'object' },
    createdAt: { type: 'string', maxLength: 30 },
    updatedAt: { type: 'string', maxLength: 30 },
    _deleted: { type: 'boolean' },
  },
  required: ['id', 'name', 'dataSource', 'createdAt', 'updatedAt'],
  indexes: ['dataSource'],
}
