import { RxJsonSchema } from 'rxdb'

import { TimeEntryDoc } from '@/sync/types'

export const timeEntrySchema: RxJsonSchema<TimeEntryDoc> = {
  title: 'time entry schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    taskId: { type: 'string', maxLength: 100 },
    project: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', maxLength: 200 },
      },
      required: ['id', 'name'],
    },
    issue: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', maxLength: 200 },
      },
      required: ['id', 'name'],
    },
    activity: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', maxLength: 200 },
      },
      required: ['id', 'name'],
    },
    spentOn: { type: 'string', maxLength: 10 }, // YYYY-MM-DD
    hours: { type: 'number' },
    comments: { type: 'string', maxLength: 1000 },
    createdAt: { type: 'string', maxLength: 30 },
    updatedAt: { type: 'string', maxLength: 30 },
    _deleted: { type: 'boolean' },
  },
  required: [
    'id',
    'taskId',
    'project',
    'issue',
    'user',
    'activity',
    'spentOn',
    'hours',
    'createdAt',
    'updatedAt',
  ],
  indexes: ['taskId', 'spentOn', 'user.id'],
}
