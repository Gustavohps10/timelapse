export const IpcChannels = {
  LOGIN: 'auth:login',
  TASKS_LIST: 'tasks:list',
} as const

export type IpcChannelType = keyof typeof IpcChannels
