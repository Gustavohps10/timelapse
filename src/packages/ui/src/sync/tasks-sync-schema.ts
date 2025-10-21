import { RxJsonSchema } from 'rxdb'

export interface SyncParticipantsRxDBDTO {
  id: string
  name: string
  role: {
    id: string
  }
}

export interface SyncEstimatedTimeRxDBDTO {
  id: string
  name: string
  activities: {
    id: string
    name: string
  }[]
  hours: number
}

export interface SyncTaskRxDBDTO {
  _id: string
  _deleted: boolean
  id: string
  title: string
  description?: string
  url?: string
  projectName?: string
  status: {
    id: string
    name: string
  }
  tracker?: {
    id: string
  }
  priority?: {
    id: string
    name: string
  }
  author?: {
    id: string
    name: string
  }
  assignedTo?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  startDate?: string
  dueDate?: string
  doneRatio?: number
  spentHours?: number
  estimatedTimes?: SyncEstimatedTimeRxDBDTO[]
  statusChanges?: {
    fromStatus: string
    toStatus: string
    description?: string
    changedBy: {
      id: string
      name: string
    }
    changedAt: string
  }[]
  participants?: SyncParticipantsRxDBDTO[]

  conflicted?: boolean
  conflictData?: { server?: any; local?: any }
  validationError?: any
  syncedAt?: string
  assumedMasterState?: any
}

export const tasksSyncSchema: RxJsonSchema<SyncTaskRxDBDTO> = {
  title: 'tasks schema',
  version: 0,
  description: 'Tasks with sync metadata',
  type: 'object',
  primaryKey: '_id',
  properties: {
    _id: { type: 'string', maxLength: 100 },
    _deleted: { type: 'boolean' },
    id: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    description: { type: 'string' },
    url: { type: 'string' },
    projectName: { type: 'string' },

    status: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    tracker: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    priority: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    author: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    assignedTo: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    startDate: { type: 'string', format: 'date-time' },
    dueDate: { type: 'string', format: 'date-time' },
    doneRatio: { type: 'number' },
    spentHours: { type: 'number' },
    estimatedTimes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              required: ['id', 'name'],
            },
          },
          hours: { type: 'number' },
        },
        required: ['id', 'name', 'activities', 'hours'],
      },
    },
    statusChanges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fromStatus: { type: 'string' },
          toStatus: { type: 'string' },
          description: { type: 'string' },
          changedBy: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
            required: ['id', 'name'],
          },
          changedAt: { type: 'string', format: 'date-time' },
        },
        required: ['fromStatus', 'toStatus', 'changedBy', 'changedAt'],
      },
    },
    participants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          role: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
            required: ['id'],
          },
        },
        required: ['id', 'name', 'role'],
      },
    },
    conflicted: { type: 'boolean' },
    conflictData: {
      type: 'object',
      properties: {
        server: { type: 'object' },
        local: { type: 'object' },
      },
    },
    validationError: { type: 'object' },
    syncedAt: { type: 'string', format: 'date-time' },
    assumedMasterState: { type: 'object' },
  },
  required: ['_id', 'id', 'title', 'status', 'createdAt', 'updatedAt'],
}
