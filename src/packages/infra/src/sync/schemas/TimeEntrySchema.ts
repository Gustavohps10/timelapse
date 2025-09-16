import { RxJsonSchema } from 'rxdb'

import { TimeEntryDoc } from '../types'

export const timeEntrySchema: RxJsonSchema<TimeEntryDoc> = {
  title: 'time entry schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },

    project: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string', maxLength: 200 },
      },
      required: ['id', 'name'],
    },

    issue: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },

    user: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string', maxLength: 200 },
      },
      required: ['id', 'name'],
    },

    activity: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string', maxLength: 200 },
      },
      required: ['id', 'name'],
    },

    hours: { type: 'number' },

    comments: { type: 'string', maxLength: 500 },

    spentOn: { type: 'string', maxLength: 30 }, // sem format
    createdAt: { type: 'string', maxLength: 30 },
    updatedAt: { type: 'string', maxLength: 30 },
    _deleted: { type: 'boolean' },
  },

  required: [
    'id',
    'project',
    'issue',
    'user',
    'activity',
    'hours',
    'spentOn',
    'createdAt',
    'updatedAt',
  ],
}
