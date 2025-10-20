import { RxJsonSchema } from 'rxdb'

export interface SyncTaskRxDBDTO {
  _id: string
  _deleted: boolean
  id: string
  title: string
  description?: string
  url?: string
  project?: {
    id?: string
    name?: string
  }
  parent?: {
    id?: string
  }
  status: {
    id: string
    name: string
  }
  priority?: {
    id?: string
    name?: string
  }
  author?: {
    id?: string
    name?: string
  }
  assignedTo?: {
    id?: string
    name?: string
  }
  createdAt: string
  updatedAt: string
  startDate?: string
  dueDate?: string
  doneRatio?: number
  spentHours?: number
  estimatedTime?: {
    production?: number
    validation?: number
    documentation?: number
    generic?: number
  }
  customFields?: Record<string, any>
  metadata?: Record<string, any>
  statusChanges?: {
    fromStatus: string
    toStatus: string
    changedBy?: string
    changedAt: string
  }[]
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
    project: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
    parent: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
    status: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    priority: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
    author: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
    assignedTo: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    startDate: { type: 'string', format: 'date-time' },
    dueDate: { type: 'string', format: 'date-time' },
    doneRatio: { type: 'number' },
    spentHours: { type: 'number' },
    estimatedTime: {
      type: 'object',
      properties: {
        production: { type: 'number' },
        validation: { type: 'number' },
        documentation: { type: 'number' },
        generic: { type: 'number' },
      },
    },
    customFields: { type: 'object' },
    metadata: { type: 'object' },
    statusChanges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          fromStatus: { type: 'string' },
          toStatus: { type: 'string' },
          changedBy: { type: 'string' },
          changedAt: { type: 'string', format: 'date-time' },
        },
        required: ['fromStatus', 'toStatus', 'changedAt'],
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
