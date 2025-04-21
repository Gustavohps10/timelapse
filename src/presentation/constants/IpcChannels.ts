export const IpcChannels = {
  TASKS_LIST: 'tasks:list',
} as const

export type IpcChannelType = keyof typeof IpcChannels
