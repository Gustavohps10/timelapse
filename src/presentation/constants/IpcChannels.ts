export const IpcChannels = {
  LOGIN: 'auth:login',
  TASKS_LIST: 'tasks:list',

  GET_TOKEN: 'token',
  SAVE_TOKEN: 'token:save',
  DELETE_TOKEN: 'token:delete',

  LIST_TIME_ENTRIES: 'time-entries',
} as const

export type IpcChannelType = keyof typeof IpcChannels
